import { createAdminClient } from "@/lib/supabase/admin";
import { isDistributionConfigured } from "@/lib/distribution/config";
import { getDistributionProvider } from "@/lib/distribution/fuga/provider";
import { loadReleasePackage } from "@/lib/distribution/load-release";
import { sendReleaseDeliveringEmail, sendReleaseLiveEmail } from "@/lib/email";
import type { DistributionJob } from "@/lib/distribution/types";
import type { ReleaseWithTracks } from "@/types";

function shouldDistributeNow(scheduledDate: string | null) {
  if (!scheduledDate) return true;
  return new Date(scheduledDate).getTime() <= Date.now();
}

function validateReleaseForDistribution(release: ReleaseWithTracks) {
  if (!release.title || !release.artwork_url) {
    throw new Error("Release must have a title and artwork");
  }

  const tracks = release.tracks || [];
  if (tracks.length === 0) {
    throw new Error("Release must have at least one track");
  }

  if (tracks.some((track) => !track.audio_url)) {
    throw new Error("All tracks must have audio files uploaded");
  }
}

export async function queueDistributionJob(releaseId: string, userId: string) {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("distribution_jobs")
    .select("id, status")
    .eq("release_id", releaseId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.status === "pending" || existing?.status === "processing") {
    return existing.id as string;
  }

  if (existing?.status === "failed") {
    const { error } = await admin
      .from("distribution_jobs")
      .update({
        status: "pending",
        attempts: 0,
        error_message: null,
        completed_at: null,
        started_at: null,
      })
      .eq("id", existing.id);

    if (error) {
      throw new Error(error.message);
    }

    return existing.id as string;
  }

  const { data: job, error } = await admin
    .from("distribution_jobs")
    .insert({
      release_id: releaseId,
      user_id: userId,
      provider: "fuga",
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !job) {
    throw new Error(error?.message || "Could not queue distribution job");
  }

  return job.id as string;
}

export async function releaseToStores(releaseId: string, userId: string) {
  const admin = createAdminClient();

  const { data: releaseData, error: fetchError } = await admin
    .from("releases")
    .select("*, tracks(*)")
    .eq("id", releaseId)
    .eq("user_id", userId)
    .single();

  const release = releaseData as ReleaseWithTracks | null;

  if (fetchError || !release) {
    throw new Error("Release not found");
  }

  if (release.status === "live") {
    throw new Error("This release is already live on stores");
  }

  const { data: activeJob } = await admin
    .from("distribution_jobs")
    .select("status")
    .eq("release_id", releaseId)
    .in("status", ["pending", "processing"])
    .maybeSingle();

  if (activeJob) {
    throw new Error("This release is already being delivered to stores");
  }

  validateReleaseForDistribution(release);

  const distributeNow = shouldDistributeNow(release.scheduled_date);
  const newStatus = distributeNow ? "approved" : "scheduled";

  const { data: updated, error: updateError } = await admin
    .from("releases")
    .update({
      status: newStatus,
      rejection_reason: null,
      reviewed_by: null,
      reviewed_at: null,
    })
    .eq("id", releaseId)
    .select("*, tracks(*)")
    .single();

  if (updateError || !updated) {
    throw new Error("Failed to update release status");
  }

  if (!distributeNow) {
    await admin.from("notifications").insert({
      user_id: userId,
      type: "system",
      title: "Release scheduled",
      message: `"${release.title}" is scheduled for store delivery.`,
      link: "/dashboard/releases",
      metadata: { release_id: releaseId },
    });

    return {
      release: updated as ReleaseWithTracks,
      scheduled: true,
      warning: null as string | null,
    };
  }

  if (!isDistributionConfigured()) {
    return {
      release: updated as ReleaseWithTracks,
      scheduled: false,
      warning:
        "Release queued, but distribution is not configured. Add FUGA credentials to deliver to stores.",
    };
  }

  const { data: owner } = await admin
    .from("users")
    .select("email")
    .eq("id", userId)
    .single();

  await admin.from("notifications").insert({
    user_id: userId,
    type: "system",
    title: "Delivering to stores",
    message: `"${release.title}" is being sent to Spotify, Apple Music, and other platforms.`,
    link: "/dashboard/releases",
    metadata: { release_id: releaseId },
  });

  if (owner?.email) {
    try {
      await sendReleaseDeliveringEmail(owner.email, release.title);
    } catch (emailError) {
      console.error("Failed to send delivering email:", emailError);
    }
  }

  const jobId = await queueDistributionJob(releaseId, userId);

  processDistributionJob(jobId).catch((distributionError) => {
    console.error("Background distribution failed:", distributionError);
  });

  return {
    release: updated as ReleaseWithTracks,
    scheduled: false,
    jobId,
    warning: null as string | null,
  };
}

export async function processDistributionJob(jobId: string) {
  if (!isDistributionConfigured()) {
    throw new Error(
      "Distribution is not configured. Add FUGA_API_URL, FUGA_USERNAME, FUGA_PASSWORD, and FUGA_LABEL_ID."
    );
  }

  const admin = createAdminClient();

  const { data: job, error } = await admin
    .from("distribution_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error || !job) {
    throw new Error("Distribution job not found");
  }

  const typedJob = job as DistributionJob;

  if (typedJob.status === "delivered") {
    return typedJob;
  }

  if (typedJob.attempts >= typedJob.max_attempts) {
    return typedJob;
  }

  await admin
    .from("distribution_jobs")
    .update({
      status: "processing",
      attempts: typedJob.attempts + 1,
      started_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("id", jobId);

  try {
    const pkg = await loadReleasePackage(typedJob.release_id);
    const provider = getDistributionProvider();
    const result = await provider.distribute(jobId, pkg);

    await admin
      .from("releases")
      .update({
        status: "live",
        external_product_id: result.externalProductId,
        distributed_at: new Date().toISOString(),
        upc: result.upc || pkg.release.upc,
      })
      .eq("id", typedJob.release_id);

    if (result.isrcs) {
      for (const [trackId, isrc] of Object.entries(result.isrcs)) {
        await admin.from("tracks").update({ isrc }).eq("id", trackId);
      }
    }

    for (const delivery of result.platformDeliveries) {
      await admin.from("platform_deliveries").insert({
        release_id: typedJob.release_id,
        distribution_job_id: jobId,
        platform: delivery.platform,
        external_dsp_id: delivery.externalDspId || null,
        status: delivery.status,
      });
    }

    await admin
      .from("distribution_jobs")
      .update({
        status: "delivered",
        external_product_id: result.externalProductId,
        completed_at: new Date().toISOString(),
        error_message: null,
      })
      .eq("id", jobId);

    await admin.from("notifications").insert({
      user_id: typedJob.user_id,
      type: "release_live",
      title: "Your music is live",
      message: `"${pkg.release.title}" has been delivered to major streaming platforms.`,
      link: "/dashboard/releases",
      metadata: { release_id: typedJob.release_id },
    });

    if (pkg.ownerEmail) {
      try {
        await sendReleaseLiveEmail(pkg.ownerEmail, pkg.release.title);
      } catch (emailError) {
        console.error("Failed to send release live email:", emailError);
      }
    }

    return typedJob;
  } catch (processError) {
    const message =
      processError instanceof Error ? processError.message : "Distribution failed";

    const failed = typedJob.attempts + 1 >= typedJob.max_attempts;

    await admin
      .from("distribution_jobs")
      .update({
        status: failed ? "failed" : "pending",
        error_message: message,
        completed_at: failed ? new Date().toISOString() : null,
      })
      .eq("id", jobId);

    if (failed) {
      const { data: releaseRow } = await admin
        .from("releases")
        .select("title")
        .eq("id", typedJob.release_id)
        .single();

      await admin.from("notifications").insert({
        user_id: typedJob.user_id,
        type: "distribution_failed",
        title: "Distribution needs attention",
        message: `"${releaseRow?.title || "Your release"}" could not be delivered: ${message}`,
        link: "/dashboard/releases",
        metadata: { release_id: typedJob.release_id, job_id: jobId },
      });
    }

    throw processError;
  }
}

export async function processPendingDistributionJobs(limit = 5) {
  const admin = createAdminClient();

  const { data: jobs } = await admin
    .from("distribution_jobs")
    .select("id")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(limit);

  const results = [];
  for (const job of jobs || []) {
    try {
      await processDistributionJob(job.id as string);
      results.push({ id: job.id, ok: true });
    } catch (error) {
      results.push({
        id: job.id,
        ok: false,
        error: error instanceof Error ? error.message : "failed",
      });
    }
  }

  return results;
}

export async function queueReadyScheduledReleases() {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { data: releases } = await admin
    .from("releases")
    .select("id, user_id, scheduled_date")
    .eq("status", "scheduled")
    .lte("scheduled_date", now);

  const queued = [];
  for (const release of releases || []) {
    const jobId = await queueDistributionJob(release.id as string, release.user_id as string);
    queued.push(jobId);
  }

  return queued;
}

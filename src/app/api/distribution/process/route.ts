import { createAdminClient } from "@/lib/supabase/admin";
import { getCronSecret } from "@/lib/distribution/config";
import { processDistributionJob } from "@/lib/distribution/process";
import { apiError, apiSuccess, requireAdmin } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const jobId = body.jobId as string | undefined;

    if (jobId) {
      const auth = await requireAdmin();
      if ("error" in auth) return auth.error;

      await processDistributionJob(jobId);
      return apiSuccess({ processed: jobId });
    }

    const secret = getCronSecret();
    const authHeader = request.headers.get("authorization");
    if (!secret || authHeader !== `Bearer ${secret}`) {
      return apiError("Unauthorized", 401);
    }

    const admin = createAdminClient();
    const { data: job } = await admin
      .from("distribution_jobs")
      .select("id")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!job) {
      return apiSuccess({ processed: null, message: "No pending jobs" });
    }

    await processDistributionJob(job.id as string);
    return apiSuccess({ processed: job.id });
  } catch (error) {
    console.error("Process distribution error:", error);
    const message = error instanceof Error ? error.message : "Processing failed";
    return apiError(message, 500);
  }
}

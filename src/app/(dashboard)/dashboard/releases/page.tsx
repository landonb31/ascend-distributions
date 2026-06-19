import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ReleaseList } from "@/components/dashboard/release-list";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import type { DistributionJob, PlatformDelivery } from "@/lib/distribution/types";

export const metadata = { title: "My Releases" };

export default async function ReleasesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: releases } = await supabase
    .from("releases")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const releaseIds = (releases || []).map((r) => r.id);

  let jobsByRelease: Record<string, DistributionJob> = {};
  let deliveriesByRelease: Record<string, PlatformDelivery[]> = {};

  if (releaseIds.length > 0) {
    const { data: jobs } = await supabase
      .from("distribution_jobs")
      .select("*")
      .in("release_id", releaseIds)
      .order("created_at", { ascending: false });

    for (const job of jobs || []) {
      const typed = job as DistributionJob;
      if (!jobsByRelease[typed.release_id]) {
        jobsByRelease[typed.release_id] = typed;
      }
    }

    const { data: deliveries } = await supabase
      .from("platform_deliveries")
      .select("*")
      .in("release_id", releaseIds);

    for (const delivery of deliveries || []) {
      const typed = delivery as PlatformDelivery;
      deliveriesByRelease[typed.release_id] = [
        ...(deliveriesByRelease[typed.release_id] || []),
        typed,
      ];
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Releases</h1>
          <p className="text-muted-foreground mt-1">
            Upload, release directly to stores, and track delivery status.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload New
          </Link>
        </Button>
      </div>

      <ReleaseList
        releases={releases || []}
        jobsByRelease={jobsByRelease}
        deliveriesByRelease={deliveriesByRelease}
      />
    </div>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Disc3, Pencil, Trash2, Filter, Send, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import {
  getDistributionStatusLabel,
  summarizePlatformDeliveries,
} from "@/lib/distribution/status";
import {
  cn,
  formatDate,
  formatNumber,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils";
import type { DistributionJob, PlatformDelivery } from "@/lib/distribution/types";
import type { Release, ReleaseStatus } from "@/types";

const STATUS_OPTIONS: { value: ReleaseStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending_review", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "scheduled", label: "Scheduled" },
  { value: "live", label: "Live" },
  { value: "rejected", label: "Rejected" },
];

interface ReleaseListProps {
  releases: Release[];
  jobsByRelease?: Record<string, DistributionJob>;
  deliveriesByRelease?: Record<string, PlatformDelivery[]>;
}

export function ReleaseList({
  releases,
  jobsByRelease = {},
  deliveriesByRelease = {},
}: ReleaseListProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<ReleaseStatus | "all">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredReleases = useMemo(() => {
    if (statusFilter === "all") return releases;
    return releases.filter((r) => r.status === statusFilter);
  }, [releases, statusFilter]);

  async function handleDelete(release: Release) {
    if (release.status !== "draft") return;
    if (!confirm(`Delete draft "${release.title}"? This cannot be undone.`)) return;

    setDeletingId(release.id);
    const supabase = createClient();

    const { error: tracksError } = await supabase
      .from("tracks")
      .delete()
      .eq("release_id", release.id);

    if (tracksError) {
      setDeletingId(null);
      alert("Failed to delete release tracks. Please try again.");
      return;
    }

    const { error } = await supabase.from("releases").delete().eq("id", release.id);

    setDeletingId(null);

    if (error) {
      alert("Failed to delete release. Please try again.");
      return;
    }

    startTransition(() => router.refresh());
  }

  async function handleSubmit(release: Release) {
    setSubmittingId(release.id);

    try {
      const response = await fetch(`/api/releases/${release.id}/submit`, {
        method: "POST",
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(result.error || "Could not release to stores.");
        return;
      }

      startTransition(() => router.refresh());
    } catch {
      alert("Could not release to stores. Please try again.");
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <Card glass>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">All Releases</CardTitle>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ReleaseStatus | "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredReleases.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Disc3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold">
              {statusFilter === "all" ? "No releases yet" : "No releases match this filter"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">
              {statusFilter === "all"
                ? "Upload your music and release directly to Spotify, Apple Music, and more."
                : "Try selecting a different status filter."}
            </p>
            {statusFilter === "all" && (
              <Button asChild>
                <Link href="/dashboard/upload">Upload Music</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReleases.map((release) => {
              const job = jobsByRelease[release.id];
              const deliveries = deliveriesByRelease[release.id] || [];
              const distributionLabel = getDistributionStatusLabel(release, job);
              const liveSummary = summarizePlatformDeliveries(deliveries);

              const canRelease =
                release.status !== "live" &&
                (release.status === "draft" ||
                  release.status === "rejected" ||
                  release.status === "pending_review" ||
                  job?.status === "failed");

              return (
                <div
                  key={release.id}
                  className="flex flex-col gap-3 rounded-lg border border-white/[0.06] p-4 sm:flex-row sm:items-center hover:bg-white/[0.02] transition-colors"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white/5">
                    {release.artwork_url ? (
                      <Image
                        src={release.artwork_url}
                        alt={release.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Disc3 className="h-7 w-7 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{release.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {release.genre || "No genre"}
                      {release.release_date && ` · ${formatDate(release.release_date)}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatNumber(release.total_streams)} streams
                      {release.total_revenue > 0 &&
                        ` · $${Number(release.total_revenue).toFixed(2)} revenue`}
                    </p>
                    <p className="text-xs text-ascend-purple mt-1">{distributionLabel}</p>
                    {liveSummary && (
                      <p className="text-xs text-green-400 mt-0.5">{liveSummary}</p>
                    )}
                    {release.status === "rejected" && release.rejection_reason && (
                      <p className="text-xs text-red-400 mt-1 line-clamp-2">
                        {release.rejection_reason}
                      </p>
                    )}
                    {job?.status === "failed" && job.error_message && (
                      <p className="text-xs text-red-400 mt-1 line-clamp-2">
                        {job.error_message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <Badge className={cn(getStatusColor(release.status))}>
                      {getStatusLabel(release.status)}
                    </Badge>

                    {canRelease && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSubmit(release)}
                          disabled={submittingId === release.id || isPending}
                        >
                          {submittingId === release.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Send className="mr-1.5 h-3.5 w-3.5" />
                              {job?.status === "failed" ? "Retry" : "Release to Stores"}
                            </>
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            href={`/dashboard/upload?edit=${release.id}`}
                            aria-label="Edit release"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      </>
                    )}

                    {release.status === "draft" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(release)}
                        disabled={deletingId === release.id || isPending}
                        aria-label="Delete draft"
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

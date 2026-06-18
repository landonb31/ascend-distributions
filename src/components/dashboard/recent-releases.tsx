import Link from "next/link";
import Image from "next/image";
import { Disc3, ArrowRight, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WaveformBars } from "@/components/dashboard/waveform-bars";
import { formatDate, formatNumber, getStatusColor, getStatusLabel } from "@/lib/utils";
import type { Release } from "@/types";
import { cn } from "@/lib/utils";

interface RecentReleasesProps {
  releases: Release[];
}

export function RecentReleases({ releases }: RecentReleasesProps) {
  return (
    <Card glass className="overflow-hidden border-white/10">
      <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-white/[0.01]">
        <div>
          <CardTitle className="text-lg">Recent Releases</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">Your latest tracks across all platforms</p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/releases">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {releases.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="relative mb-6 flex h-28 w-28 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-ascend-purple/20 to-ascend-blue/10">
              <Disc3 className="h-12 w-12 text-ascend-purple" />
              <div className="absolute -bottom-3 left-1/2 h-8 w-20 -translate-x-1/2">
                <WaveformBars className="h-full w-full opacity-60" bars={16} />
              </div>
            </div>
            <h3 className="text-lg font-semibold">No releases yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Upload your first single or album and we&apos;ll deliver it to Spotify, Apple Music, and more.
            </p>
            <Button className="mt-6 shadow-lg shadow-purple-500/20" asChild>
              <Link href="/dashboard/upload">Upload Music</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {releases.slice(0, 5).map((release) => (
              <Link
                key={release.id}
                href={`/dashboard/releases`}
                className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.03]"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-lg shadow-black/20 transition-transform group-hover:scale-[1.02]">
                  {release.artwork_url ? (
                    <Image
                      src={release.artwork_url}
                      alt={release.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-ascend-purple/20 to-ascend-blue/10">
                      <Disc3 className="h-7 w-7 text-ascend-purple" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Play className="h-5 w-5 fill-white text-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold group-hover:text-ascend-purple transition-colors">
                    {release.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {release.genre || release.album || "Single"}
                  </p>
                  <div className="mt-2 h-4 w-24 opacity-40 group-hover:opacity-70 transition-opacity">
                    <WaveformBars className="h-full" bars={12} />
                  </div>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-sm font-medium">{formatNumber(release.total_streams)}</p>
                  <p className="text-xs text-muted-foreground">streams</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {release.release_date ? formatDate(release.release_date) : "No date"}
                  </p>
                </div>
                <Badge className={cn("shrink-0", getStatusColor(release.status))}>
                  {getStatusLabel(release.status)}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

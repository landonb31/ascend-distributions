import Link from "next/link";
import Image from "next/image";
import { Disc3, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatNumber, getStatusColor, getStatusLabel } from "@/lib/utils";
import type { Release } from "@/types";
import { cn } from "@/lib/utils";

interface RecentReleasesProps {
  releases: Release[];
}

export function RecentReleases({ releases }: RecentReleasesProps) {
  return (
    <Card glass>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Releases</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/releases">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {releases.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <Disc3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold">No releases yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Upload your first release to get started.
            </p>
            <Button asChild>
              <Link href="/dashboard/upload">Upload Music</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {releases.slice(0, 5).map((release) => (
              <div
                key={release.id}
                className="flex items-center gap-4 rounded-lg p-3 hover:bg-white/[0.03] transition-colors"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/5">
                  {release.artwork_url ? (
                    <Image
                      src={release.artwork_url}
                      alt={release.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Disc3 className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{release.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {release.release_date ? formatDate(release.release_date) : "No date set"}
                    {" · "}
                    {formatNumber(release.total_streams)} streams
                  </p>
                </div>
                <Badge className={cn("shrink-0", getStatusColor(release.status))}>
                  {getStatusLabel(release.status)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReleaseActions } from "@/components/admin/release-actions";
import { Disc3 } from "lucide-react";
import type { Release } from "@/types";

export const metadata = { title: "Admin — Releases" };

export default async function AdminReleasesPage() {
  const supabase = await createClient();

  const { data: releases } = await supabase
    .from("releases")
    .select("*")
    .order("created_at", { ascending: false });

  const userIds = [...new Set((releases || []).map((r) => r.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, display_name")
    .in("user_id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);

  const profileMap = new Map(profiles?.map((p) => [p.user_id, p.display_name]) || []);

  const enriched = (releases || []).map((r) => ({
    ...r,
    artistName: profileMap.get(r.user_id) || "Unknown artist",
  }));

  const pending = enriched.filter((r) => r.status === "pending_review");

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Releases
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and manage release submissions.
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Review ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="all">All Releases ({enriched.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <ReleaseList releases={pending} showActions />
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <ReleaseList releases={enriched} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReleaseList({
  releases,
  showActions = false,
}: {
  releases: Array<Release & { artistName: string }>;
  showActions?: boolean;
}) {
  if (releases.length === 0) {
    return (
      <Card glass>
        <CardContent className="py-12 text-center text-muted-foreground">
          No releases to display.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {releases.map((release) => (
        <Card glass key={release.id}>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5">
                {release.artwork_url ? (
                  <Image
                    src={release.artwork_url}
                    alt={release.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Disc3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{release.title}</h3>
                  <Badge className={cn(getStatusColor(release.status))}>
                    {getStatusLabel(release.status)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {release.artistName}
                  {release.genre && ` · ${release.genre}`}
                  {" · "}
                  {formatDate(release.created_at)}
                </p>

                {showActions && release.status === "pending_review" && (
                  <div className="mt-3">
                    <ReleaseActions
                      releaseId={release.id}
                      title={release.title}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

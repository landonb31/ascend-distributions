import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ReleaseList } from "@/components/dashboard/release-list";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

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

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Releases</h1>
          <p className="text-muted-foreground mt-1">
            Manage your catalog, track status, and edit drafts.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload New
          </Link>
        </Button>
      </div>

      <ReleaseList releases={releases || []} />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { RoyaltiesDashboard } from "@/components/dashboard/royalties-dashboard";
import type { Royalty } from "@/types";

export const metadata = { title: "Royalties" };

type RoyaltyRow = Royalty & {
  tracks?: { title: string; artist_name: string } | { title: string; artist_name: string }[] | null;
};

export default async function RoyaltiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: royalties } = await supabase
    .from("royalties")
    .select("*, tracks(title, artist_name)")
    .eq("user_id", user.id)
    .order("period_start", { ascending: false });

  const normalizedRoyalties = ((royalties || []) as RoyaltyRow[]).map((row) => {
    const tracks = row.tracks;
    const track = Array.isArray(tracks) ? tracks[0] : tracks ?? undefined;
    const { tracks: _tracks, ...rest } = row;
    void _tracks;
    return { ...rest, track };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Royalties</h1>
        <p className="text-muted-foreground mt-1">
          Transparent breakdown of your earnings by track, platform, and month.
        </p>
      </div>

      <RoyaltiesDashboard royalties={normalizedRoyalties} />
    </div>
  );
}

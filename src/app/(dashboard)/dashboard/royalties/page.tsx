import { createClient } from "@/lib/supabase/server";
import { RoyaltiesDashboard } from "@/components/dashboard/royalties-dashboard";

export const metadata = { title: "Royalties" };

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

  const normalizedRoyalties = (royalties || []).map((r) => {
    const trackData = (r as { tracks?: { title: string; artist_name: string } | { title: string; artist_name: string }[] }).tracks;
    const track = Array.isArray(trackData) ? trackData[0] : trackData;
    const { tracks: _, ...rest } = r as typeof r & { tracks?: unknown };
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

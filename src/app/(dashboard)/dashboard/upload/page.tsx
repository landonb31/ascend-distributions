import { createClient } from "@/lib/supabase/server";
import { UploadForm } from "@/components/dashboard/upload-form";
import { UploadPageHero } from "@/components/dashboard/upload-page-hero";

export const metadata = { title: "Upload Music" };

interface UploadPageProps {
  searchParams: Promise<{ edit?: string }>;
}

export default async function UploadPage({ searchParams }: UploadPageProps) {
  const { edit } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: artist } = await supabase
    .from("artists")
    .select("artist_name, spotify_id, apple_music_id")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="relative space-y-8 animate-fade-in">
      <div className="pointer-events-none absolute inset-x-0 -top-8 h-96 upload-aurora opacity-60" />

      <UploadPageHero editing={Boolean(edit)} />

      <UploadForm
        defaultArtistName={artist?.artist_name || ""}
        editReleaseId={edit}
        artistHasSpotify={Boolean(artist?.spotify_id)}
        artistHasApple={Boolean(artist?.apple_music_id)}
      />
    </div>
  );
}

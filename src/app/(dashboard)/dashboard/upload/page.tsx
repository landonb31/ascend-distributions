import { createClient } from "@/lib/supabase/server";
import { UploadForm } from "@/components/dashboard/upload-form";

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
    .select("artist_name")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {edit ? "Edit Draft" : "Upload Music"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {edit
            ? "Update your draft release before submitting for review."
            : "Upload your track, artwork, and metadata to distribute worldwide."}
        </p>
      </div>

      <UploadForm defaultArtistName={artist?.artist_name || ""} editReleaseId={edit} />
    </div>
  );
}

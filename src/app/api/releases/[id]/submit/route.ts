import { apiError, apiSuccess, getAuthContext } from "@/lib/api";
import type { ReleaseWithTracks } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await getAuthContext();
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;

    const { data: releaseData, error: fetchError } = await supabase
      .from("releases")
      .select("*, tracks(*)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    const release = releaseData as ReleaseWithTracks | null;

    if (fetchError || !release) {
      return apiError("Release not found", 404);
    }

    if (!["draft", "rejected"].includes(release.status)) {
      return apiError("Only draft or rejected releases can be submitted", 400);
    }

    if (!release.title || !release.artwork_url) {
      return apiError("Release must have a title and artwork before submission", 400);
    }

    const tracks = release.tracks as { audio_url: string | null }[] | undefined;
    if (!tracks || tracks.length === 0) {
      return apiError("Release must have at least one track", 400);
    }

    if (tracks.some((t) => !t.audio_url)) {
      return apiError("All tracks must have audio files uploaded", 400);
    }

    const { data: updated, error } = await supabase
      .from("releases")
      .update({
        status: "pending_review",
        rejection_reason: null,
        reviewed_by: null,
        reviewed_at: null,
      })
      .eq("id", id)
      .select("*, tracks(*)")
      .single();

    if (error) {
      console.error("Submit release error:", error);
      return apiError("Failed to submit release", 500);
    }

    return apiSuccess({ release: updated });
  } catch (error) {
    console.error("Submit release error:", error);
    return apiError("Failed to submit release", 500);
  }
}

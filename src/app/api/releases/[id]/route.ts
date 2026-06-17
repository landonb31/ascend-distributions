import { releaseUpdateSchema } from "@/lib/validations";
import { apiError, apiSuccess, getAuthContext } from "@/lib/api";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await getAuthContext();
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;

    const { data: release, error } = await supabase
      .from("releases")
      .select("*, tracks(*)")
      .eq("id", id)
      .single();

    if (error || !release) {
      return apiError("Release not found", 404);
    }

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (release.user_id !== user.id && userData?.role !== "admin" && release.status !== "live") {
      return apiError("Forbidden", 403);
    }

    return apiSuccess({ release });
  } catch (error) {
    console.error("Release GET error:", error);
    return apiError("Failed to fetch release", 500);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await getAuthContext();
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;
    const body = await request.json();
    const parsed = releaseUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input", 400);
    }

    const { data: existing } = await supabase
      .from("releases")
      .select("user_id, status")
      .eq("id", id)
      .single();

    if (!existing) {
      return apiError("Release not found", 404);
    }

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const isOwner = existing.user_id === user.id;
    const isAdmin = userData?.role === "admin";

    if (!isOwner && !isAdmin) {
      return apiError("Forbidden", 403);
    }

    if (isOwner && !isAdmin && !["draft", "rejected"].includes(existing.status)) {
      return apiError("Only draft or rejected releases can be edited", 400);
    }

    const { tracks, ...updateData } = parsed.data;

    const updatePayload: Record<string, unknown> = {};
    if (updateData.title !== undefined) updatePayload.title = updateData.title;
    if (updateData.album !== undefined) updatePayload.album = updateData.album;
    if (updateData.genre !== undefined) updatePayload.genre = updateData.genre;
    if (updateData.releaseDate !== undefined) updatePayload.release_date = updateData.releaseDate;
    if (updateData.scheduledDate !== undefined) updatePayload.scheduled_date = updateData.scheduledDate;
    if (updateData.artworkUrl !== undefined) updatePayload.artwork_url = updateData.artworkUrl;
    if (updateData.upc !== undefined) updatePayload.upc = updateData.upc;
    if (updateData.artistId !== undefined) updatePayload.artist_id = updateData.artistId;
    if (updateData.labelId !== undefined) updatePayload.label_id = updateData.labelId;

    const { data: release, error } = await supabase
      .from("releases")
      .update(updatePayload)
      .eq("id", id)
      .select("*, tracks(*)")
      .single();

    if (error) {
      console.error("Update release error:", error);
      return apiError("Failed to update release", 500);
    }

    if (tracks && tracks.length > 0) {
      await supabase.from("tracks").delete().eq("release_id", id);

      const trackRows = tracks.map((track, index) => ({
        release_id: id,
        user_id: existing.user_id,
        title: track.title!,
        artist_name: track.artistName!,
        featuring_artists: track.featuringArtists || null,
        track_number: track.trackNumber ?? index + 1,
        duration_seconds: track.durationSeconds || null,
        audio_url: track.audioUrl || null,
        audio_format: track.audioFormat || null,
        isrc: track.isrc || null,
        is_explicit: track.isExplicit ?? false,
      }));

      await supabase.from("tracks").insert(trackRows);
    }

    const { data: fullRelease } = await supabase
      .from("releases")
      .select("*, tracks(*)")
      .eq("id", id)
      .single();

    return apiSuccess({ release: fullRelease || release });
  } catch (error) {
    console.error("Release PATCH error:", error);
    return apiError("Failed to update release", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await getAuthContext();
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;

    const { data: existing } = await supabase
      .from("releases")
      .select("user_id, status")
      .eq("id", id)
      .single();

    if (!existing) {
      return apiError("Release not found", 404);
    }

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const isOwner = existing.user_id === user.id;
    const isAdmin = userData?.role === "admin";

    if (!isOwner && !isAdmin) {
      return apiError("Forbidden", 403);
    }

    if (isOwner && !isAdmin && existing.status !== "draft") {
      return apiError("Only draft releases can be deleted", 400);
    }

    const { error } = await supabase.from("releases").delete().eq("id", id);

    if (error) {
      console.error("Delete release error:", error);
      return apiError("Failed to delete release", 500);
    }

    return apiSuccess({ message: "Release deleted" });
  } catch (error) {
    console.error("Release DELETE error:", error);
    return apiError("Failed to delete release", 500);
  }
}

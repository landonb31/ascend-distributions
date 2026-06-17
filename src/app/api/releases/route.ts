import { releaseCreateSchema } from "@/lib/validations";
import { apiError, apiSuccess, getAuthContext } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext();
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabase
      .from("releases")
      .select("*, tracks(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Fetch releases error:", error);
      return apiError("Failed to fetch releases", 500);
    }

    return apiSuccess({ releases: data });
  } catch (error) {
    console.error("Releases GET error:", error);
    return apiError("Failed to fetch releases", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;
    const body = await request.json();
    const parsed = releaseCreateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input", 400);
    }

    const { tracks, ...releaseData } = parsed.data;

    const { data: release, error: releaseError } = await supabase
      .from("releases")
      .insert({
        user_id: user.id,
        title: releaseData.title,
        album: releaseData.album || null,
        genre: releaseData.genre || null,
        release_date: releaseData.releaseDate || null,
        scheduled_date: releaseData.scheduledDate || null,
        artwork_url: releaseData.artworkUrl || null,
        upc: releaseData.upc || null,
        artist_id: releaseData.artistId || null,
        label_id: releaseData.labelId || null,
        status: "draft",
      })
      .select()
      .single();

    if (releaseError || !release) {
      console.error("Create release error:", releaseError);
      return apiError("Failed to create release", 500);
    }

    if (tracks && tracks.length > 0) {
      const trackRows = tracks.map((track, index) => ({
        release_id: release.id,
        user_id: user.id,
        title: track.title,
        artist_name: track.artistName,
        featuring_artists: track.featuringArtists || null,
        track_number: track.trackNumber ?? index + 1,
        duration_seconds: track.durationSeconds || null,
        audio_url: track.audioUrl || null,
        audio_format: track.audioFormat || null,
        isrc: track.isrc || null,
        is_explicit: track.isExplicit,
      }));

      const { error: tracksError } = await supabase.from("tracks").insert(trackRows);

      if (tracksError) {
        console.error("Create tracks error:", tracksError);
        await supabase.from("releases").delete().eq("id", release.id);
        return apiError("Failed to create tracks", 500);
      }
    }

    const { data: fullRelease } = await supabase
      .from("releases")
      .select("*, tracks(*)")
      .eq("id", release.id)
      .single();

    return apiSuccess({ release: fullRelease }, 201);
  } catch (error) {
    console.error("Releases POST error:", error);
    return apiError("Failed to create release", 500);
  }
}

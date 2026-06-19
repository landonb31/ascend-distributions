import { releaseToStores } from "@/lib/distribution/process";
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

    const allowedStatuses = ["draft", "rejected", "approved", "scheduled", "pending_review"];
    if (!allowedStatuses.includes(release.status)) {
      return apiError("This release cannot be sent to stores in its current state", 400);
    }

    const result = await releaseToStores(id, user.id);

    return apiSuccess({
      release: result.release,
      scheduled: result.scheduled,
      warning: result.warning,
    });
  } catch (error) {
    console.error("Release to stores error:", error);
    const message = error instanceof Error ? error.message : "Failed to release to stores";
    return apiError(message, 500);
  }
}

import { releaseToStores } from "@/lib/distribution/process";
import { apiError, apiSuccess, requireAdmin } from "@/lib/api";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const { supabase } = auth;

    const { data: release, error: fetchError } = await supabase
      .from("releases")
      .select("user_id, status")
      .eq("id", id)
      .single();

    if (fetchError || !release) {
      return apiError("Release not found", 404);
    }

    const result = await releaseToStores(id, release.user_id);

    return apiSuccess({
      release: result.release,
      scheduled: result.scheduled,
      warning: result.warning,
    });
  } catch (error) {
    console.error("Approve release error:", error);
    const message = error instanceof Error ? error.message : "Failed to release to stores";
    return apiError(message, 500);
  }
}

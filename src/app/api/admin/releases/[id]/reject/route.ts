import { createAdminClient } from "@/lib/supabase/admin";
import { rejectReleaseSchema } from "@/lib/validations";
import { sendReleaseRejectedEmail } from "@/lib/email";
import { apiError, apiSuccess, requireAdmin } from "@/lib/api";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;
    const admin = createAdminClient();
    const body = await request.json();
    const parsed = rejectReleaseSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input", 400);
    }

    const { reason } = parsed.data;

    const { data: release, error: fetchError } = await supabase
      .from("releases")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !release) {
      return apiError("Release not found", 404);
    }

    if (release.status !== "pending_review") {
      return apiError("Only pending releases can be rejected", 400);
    }

    const { data: updated, error } = await supabase
      .from("releases")
      .update({
        status: "rejected",
        rejection_reason: reason,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Reject release error:", error);
      return apiError("Failed to reject release", 500);
    }

    await admin.from("notifications").insert({
      user_id: release.user_id,
      type: "release_rejected",
      title: "Release Needs Changes",
      message: `Your release "${release.title}" requires changes: ${reason}`,
      link: "/dashboard/releases",
      metadata: { release_id: id, reason },
    });

    const { data: owner } = await admin
      .from("users")
      .select("email")
      .eq("id", release.user_id)
      .single();

    if (owner?.email) {
      try {
        await sendReleaseRejectedEmail(owner.email, release.title, reason);
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
      }
    }

    return apiSuccess({ release: updated });
  } catch (error) {
    console.error("Reject release error:", error);
    return apiError("Failed to reject release", 500);
  }
}

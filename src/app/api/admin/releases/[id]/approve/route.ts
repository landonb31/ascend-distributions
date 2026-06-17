import { sendReleaseApprovedEmail } from "@/lib/email";
import { apiError, apiSuccess, requireAdmin } from "@/lib/api";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;

    const { data: release, error: fetchError } = await supabase
      .from("releases")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !release) {
      return apiError("Release not found", 404);
    }

    if (release.status !== "pending_review") {
      return apiError("Only pending releases can be approved", 400);
    }

    const newStatus = release.scheduled_date ? "scheduled" : "approved";

    const { data: updated, error } = await supabase
      .from("releases")
      .update({
        status: newStatus,
        rejection_reason: null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Approve release error:", error);
      return apiError("Failed to approve release", 500);
    }

    await supabase.from("notifications").insert({
      user_id: release.user_id,
      type: "release_approved",
      title: "Release Approved",
      message: `Your release "${release.title}" has been approved.`,
      link: "/dashboard/releases",
      metadata: { release_id: id },
    });

    const { data: owner } = await supabase
      .from("users")
      .select("email")
      .eq("id", release.user_id)
      .single();

    if (owner?.email) {
      try {
        await sendReleaseApprovedEmail(owner.email, release.title);
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
      }
    }

    return apiSuccess({ release: updated });
  } catch (error) {
    console.error("Approve release error:", error);
    return apiError("Failed to approve release", 500);
  }
}

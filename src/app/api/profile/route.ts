import { profileSchema } from "@/lib/validations";
import { apiError, apiSuccess, getAuthContext } from "@/lib/api";

export async function GET() {
  try {
    const auth = await getAuthContext();
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Fetch profile error:", error);
      return apiError("Failed to fetch profile", 500);
    }

    const { data: artist } = await supabase
      .from("artists")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { data: label } = await supabase
      .from("labels")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    return apiSuccess({ profile, artist, label });
  } catch (error) {
    console.error("Profile GET error:", error);
    return apiError("Failed to fetch profile", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getAuthContext();
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input", 400);
    }

    const { displayName, bio, website, location, isPublic } = parsed.data;

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        bio: bio || null,
        website: website || null,
        location: location || null,
        is_public: isPublic,
      })
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) {
      console.error("Update profile error:", error);
      return apiError("Failed to update profile", 500);
    }

    return apiSuccess({ profile });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return apiError("Failed to update profile", 500);
  }
}

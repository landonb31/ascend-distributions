import { getAuthErrorMessage } from "@/lib/auth-errors";
import { apiError, apiSuccess } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { registerSchema } from "@/lib/validations";
import { findUserByEmail, issueSignupVerificationCode } from "@/lib/signup-verification";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input", 400);
    }

    const { email, password, displayName, artistName, role } = parsed.data;
    const admin = createAdminClient();
    const profile = { displayName, artistName, role, password };

    const existingUser = await findUserByEmail(admin, email);

    if (existingUser?.email_confirmed_at) {
      return apiError("An account with this email already exists. Try signing in instead.", 400);
    }

    if (existingUser) {
      await issueSignupVerificationCode(
        admin,
        existingUser.id,
        email,
        profile,
        existingUser.user_metadata?.signup_code as string | undefined
      );

      return apiSuccess({ message: "Check your email for your verification code" });
    }

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        display_name: displayName,
        artist_name: artistName,
        role,
      },
    });

    if (createError) {
      return apiError(getAuthErrorMessage(createError.message), 400);
    }

    const userId = created.user?.id;

    if (!userId) {
      return apiError("Registration failed", 500);
    }

    try {
      await issueSignupVerificationCode(admin, userId, email, profile);
    } catch (error) {
      console.error("Signup email error:", error);
      await admin.auth.admin.deleteUser(userId);
      return apiError("Could not send verification email. Please try again.", 500);
    }

    return apiSuccess({ message: "Check your email for your verification code" });
  } catch (error) {
    console.error("Register error:", error);
    return apiError("Registration failed", 500);
  }
}

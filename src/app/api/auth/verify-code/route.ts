import { getAuthErrorMessage } from "@/lib/auth-errors";
import { apiError, apiSuccess } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyCodeSchema } from "@/lib/validations";
import { findUserByEmail } from "@/lib/signup-verification";
import { formatVerificationCode, isValidVerificationCode } from "@/lib/verification-code";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = verifyCodeSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input", 400);
    }

    const { email, code, password } = parsed.data;
    const normalizedCode = formatVerificationCode(code);

    if (!isValidVerificationCode(normalizedCode)) {
      return apiError("Enter the 6-digit code from your email", 400);
    }

    const admin = createAdminClient();
    const user = await findUserByEmail(admin, email);

    if (!user) {
      return apiError("No account found for this email. Sign up again.", 400);
    }

    const metadata = user.user_metadata ?? {};
    const storedCode = formatVerificationCode(String(metadata.signup_code ?? ""));
    const expiresAt = metadata.signup_code_expires_at
      ? new Date(String(metadata.signup_code_expires_at))
      : null;

    if (!storedCode || storedCode !== normalizedCode) {
      return apiError("That code is incorrect. Check your email and try again.", 400);
    }

    if (!expiresAt || expiresAt.getTime() < Date.now()) {
      return apiError("That code has expired. Sign up again to get a new one.", 400);
    }

    const { error: confirmError } = await admin.auth.admin.updateUserById(user.id, {
      email,
      password,
      email_confirm: true,
      role: "authenticated",
      user_metadata: {
        ...metadata,
        signup_code: null,
        signup_code_expires_at: null,
      },
    });

    if (confirmError) {
      return apiError(getAuthErrorMessage(confirmError.message), 400);
    }

    const { data: confirmedUser, error: readError } = await admin.auth.admin.getUserById(user.id);

    if (readError || !confirmedUser.user?.email_confirmed_at) {
      console.error("Email confirm verification failed:", readError, confirmedUser?.user);
      return apiError("Email could not be confirmed. Please try again.", 500);
    }

    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return apiSuccess({ message: "Email verified. Please sign in." });
    }

    return apiSuccess({ message: "Email verified" });
  } catch (error) {
    console.error("Verify code error:", error);
    return apiError("Verification failed", 500);
  }
}

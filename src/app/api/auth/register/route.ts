import { getAuthErrorMessage } from "@/lib/auth-errors";
import { apiError, apiSuccess } from "@/lib/api";
import { sendVerificationCodeEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input", 400);
    }

    const { email, password, displayName, artistName, role } = parsed.data;
    const admin = createAdminClient();

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

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          artist_name: artistName,
          role,
        },
      },
    });

    const verificationCode = linkData?.properties?.email_otp;

    if (linkError || !verificationCode) {
      console.error("Signup code error:", linkError);
      if (userId) {
        await admin.auth.admin.deleteUser(userId);
      }
      return apiError("Could not prepare verification code. Please try again.", 500);
    }

    const emailResult = await sendVerificationCodeEmail(email, verificationCode);

    if (!emailResult || emailResult.error) {
      console.error("Signup email error:", emailResult?.error);
      if (userId) {
        await admin.auth.admin.deleteUser(userId);
      }
      return apiError("Could not send verification email. Please try again.", 500);
    }

    return apiSuccess({ message: "Check your email for your verification code" });
  } catch (error) {
    console.error("Register error:", error);
    return apiError("Registration failed", 500);
  }
}

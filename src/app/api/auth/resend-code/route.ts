import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { findUserByEmail, issueSignupVerificationCode } from "@/lib/signup-verification";

const resendCodeSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resendCodeSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input", 400);
    }

    const { email, password } = parsed.data;
    const admin = createAdminClient();
    const user = await findUserByEmail(admin, email);

    if (!user) {
      return apiError("No account found for this email. Sign up again.", 400);
    }

    if (user.email_confirmed_at) {
      return apiError("This email is already verified. Try signing in.", 400);
    }

    const metadata = user.user_metadata ?? {};

    try {
      await issueSignupVerificationCode(
        admin,
        user.id,
        email,
        {
          displayName: String(metadata.display_name ?? ""),
          artistName: String(metadata.artist_name ?? ""),
          role: String(metadata.role ?? "artist"),
          password,
        },
        metadata.signup_code as string | undefined
      );
    } catch (error) {
      console.error("Resend code error:", error);
      return apiError("Could not send a new verification code. Please try again.", 500);
    }

    return apiSuccess({ message: "A new verification code has been sent" });
  } catch (error) {
    console.error("Resend code error:", error);
    return apiError("Could not resend verification code", 500);
  }
}

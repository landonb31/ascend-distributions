import { getAuthErrorMessage } from "@/lib/auth-errors";
import { apiError, apiSuccess } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { verifyCodeSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = verifyCodeSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input", 400);
    }

    const { email, code } = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "signup",
    });

    if (error) {
      return apiError(getAuthErrorMessage(error.message), 400);
    }

    return apiSuccess({ message: "Email verified" });
  } catch (error) {
    console.error("Verify code error:", error);
    return apiError("Verification failed", 500);
  }
}

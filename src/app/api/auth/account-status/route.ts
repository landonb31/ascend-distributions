import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { findUserByEmail } from "@/lib/signup-verification";

const accountStatusSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = accountStatusSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input", 400);
    }

    const admin = createAdminClient();
    const user = await findUserByEmail(admin, parsed.data.email);

    if (!user) {
      return apiSuccess({ exists: false, needsVerification: false });
    }

    return apiSuccess({
      exists: true,
      needsVerification: !user.email_confirmed_at,
    });
  } catch (error) {
    console.error("Account status error:", error);
    return apiError("Could not check account status", 500);
  }
}

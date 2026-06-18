import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";
import { sendVerificationCodeEmail } from "@/lib/email";
import { formatVerificationCode, generateVerificationCode } from "@/lib/verification-code";

type AdminClient = SupabaseClient<Database>;

const CODE_TTL_MS = 60 * 60 * 1000;

export async function findUserByEmail(admin: AdminClient, email: string) {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) {
    throw error;
  }

  return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
}

export async function issueSignupVerificationCode(
  admin: AdminClient,
  userId: string,
  email: string,
  profile: {
    displayName: string;
    artistName: string;
    role: string;
    password?: string;
  },
  previousCode?: string | null
) {
  const verificationCode = generateVerificationCode(previousCode ?? undefined);

  const updatePayload: {
    password?: string;
    user_metadata: Record<string, unknown>;
  } = {
    user_metadata: {
      display_name: profile.displayName,
      artist_name: profile.artistName,
      role: profile.role,
      signup_code: verificationCode,
      signup_code_expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
      signup_code_issued_at: new Date().toISOString(),
    },
  };

  if (profile.password) {
    updatePayload.password = profile.password;
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(userId, updatePayload);

  if (updateError) {
    throw updateError;
  }

  const emailResult = await sendVerificationCodeEmail(
    email,
    formatVerificationCode(verificationCode)
  );

  if (!emailResult || emailResult.error) {
    throw emailResult?.error ?? new Error("Failed to send verification email");
  }

  return verificationCode;
}

export function isSignupCodeExpired(expiresAt: string | null | undefined) {
  if (!expiresAt) {
    return true;
  }

  return new Date(expiresAt).getTime() < Date.now();
}

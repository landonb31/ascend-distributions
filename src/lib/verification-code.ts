import { randomInt } from "crypto";

/** Generate a fresh 6-digit code, different from any previous code. */
export function generateVerificationCode(previous?: string): string {
  let code = "";

  do {
    code = String(randomInt(100000, 1_000_000));
  } while (previous && code === previous);

  return code;
}

export function formatVerificationCode(code: string): string {
  return code.replace(/\D/g, "").padStart(6, "0").slice(0, 6);
}

export function isValidVerificationCode(code: string): boolean {
  return /^\d{6}$/.test(formatVerificationCode(code));
}

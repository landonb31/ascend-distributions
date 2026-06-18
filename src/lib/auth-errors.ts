export function getAuthErrorMessage(message: string): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("rate limit") ||
    normalized.includes("over_email_send_rate_limit")
  ) {
    return "Too many verification emails were sent. Wait about an hour, then try again — or sign in if you already created an account.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Your email isn't verified yet. Enter the 6-digit code from your signup email on the verify page.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }

  if (normalized.includes("token has expired") || normalized.includes("otp_expired")) {
    return "That code has expired. Sign up again to get a new one.";
  }

  if (normalized.includes("invalid") && normalized.includes("otp")) {
    return "That code is incorrect. Check your email and try again.";
  }

  if (normalized.includes("user already registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }

  return message;
}

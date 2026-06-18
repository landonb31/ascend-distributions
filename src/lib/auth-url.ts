const PRODUCTION_APP_URL = "https://ascenddistributions.com";

/** Base URL used in auth emails — never localhost. */
export function getAuthRedirectBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (configured && !/localhost|127\.0\.0\.1/i.test(configured)) {
    return configured;
  }

  return process.env.AUTH_REDIRECT_URL?.replace(/\/$/, "") || PRODUCTION_APP_URL;
}

export function getAuthCallbackUrl(next = "/verify") {
  const nextPath = next.startsWith("/") ? next : `/${next}`;
  return `${getAuthRedirectBaseUrl()}/auth/callback?next=${encodeURIComponent(nextPath)}`;
}

/** Supabase may ignore redirectTo if Site URL is localhost — force the production callback. */
export function normalizeAuthActionLink(actionLink: string, redirectTo: string) {
  try {
    const url = new URL(actionLink);
    url.searchParams.set("redirect_to", redirectTo);
    return url.toString();
  } catch {
    return actionLink;
  }
}

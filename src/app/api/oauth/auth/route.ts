import {
  OAUTH_PROVIDER,
  buildStateCookie,
  createStateToken,
  getAllowedDomainPatterns,
  isAllowedHostname,
  readOAuthClientConfig,
  renderHandshakeResponse,
  resolveScope,
} from "@/lib/cms-oauth";

export const dynamic = "force-dynamic";

/**
 * Step one of the Sveltia CMS sign-in: redirect the popup to GitHub's consent screen.
 *
 * The redirect URI is not sent; GitHub uses the one registered on the OAuth app, which must be
 * `<site>/api/oauth/callback`.
 */
export function GET(request: Request): Response {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");
  const siteId = searchParams.get("site_id") ?? "";

  if (provider !== OAUTH_PROVIDER) {
    return renderHandshakeResponse({
      error: "Your Git backend is not supported by this authenticator.",
      errorCode: "UNSUPPORTED_BACKEND",
    });
  }

  if (!isAllowedHostname(siteId, getAllowedDomainPatterns())) {
    return renderHandshakeResponse({
      error: "Your domain is not allowed to use this authenticator.",
      errorCode: "UNSUPPORTED_DOMAIN",
    });
  }

  const client = readOAuthClientConfig();

  if (!client) {
    return renderHandshakeResponse({
      error: "OAuth app client ID or secret is not configured.",
      errorCode: "MISCONFIGURED_CLIENT",
    });
  }

  const stateToken = createStateToken();

  const params = new URLSearchParams({
    client_id: client.clientId,
    scope: resolveScope(searchParams.get("scope")),
    state: stateToken,
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params.toString()}`,
      "Cache-Control": "no-store",
      "Set-Cookie": buildStateCookie(stateToken),
    },
  });
}

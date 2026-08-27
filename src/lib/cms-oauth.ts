import { siteContent } from "@/lib/site";

/**
 * Server-side half of the Sveltia CMS sign-in flow.
 *
 * Sveltia (like Decap) expects an OAuth client that exposes an authorize endpoint and a callback
 * endpoint, and that hands the access token back to the CMS window via `postMessage`. Hosting both
 * endpoints here keeps the GitHub OAuth app secret in the deployment environment instead of a
 * third-party service, which matters because this repository is public.
 *
 * @see https://github.com/sveltia/sveltia-cms-auth
 */

export const OAUTH_PROVIDER = "github";
export const OAUTH_STATE_COOKIE = "cms-oauth-state";
/** Ten minutes is plenty for a sign-in round trip and keeps the CSRF window small. */
const OAUTH_STATE_MAX_AGE_SECONDS = 600;

/** Scopes the CMS is allowed to ask for. Anything else falls back to `DEFAULT_SCOPE`. */
const ALLOWED_SCOPES = ["repo", "public_repo", "user", "read:user", "user:email"];
const DEFAULT_SCOPE = "public_repo,user";

export type OAuthErrorCode =
  | "UNSUPPORTED_BACKEND"
  | "UNSUPPORTED_DOMAIN"
  | "MISCONFIGURED_CLIENT"
  | "AUTH_CODE_REQUEST_FAILED"
  | "CSRF_DETECTED"
  | "TOKEN_REQUEST_FAILED"
  | "MALFORMED_RESPONSE";

export type OAuthClientConfig = {
  clientId: string;
  clientSecret: string;
};

/** Read the GitHub OAuth app credentials, or `null` when the deployment has not been configured. */
export function readOAuthClientConfig(): OAuthClientConfig | null {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Hostnames allowed to start a sign-in and to receive a token, as anchored regex sources.
 *
 * `CMS_ALLOWED_DOMAINS` accepts a comma-separated list and `*` wildcards. It defaults to the
 * canonical site hostname, so a copy of the CMS hosted elsewhere cannot mint tokens with these
 * credentials. Add `localhost` there if you want to run the CMS locally against this endpoint.
 */
export function getAllowedDomainPatterns(): string[] {
  const configured = process.env.CMS_ALLOWED_DOMAINS?.trim();
  const fallback = new URL(siteContent.url).hostname;

  return (configured || fallback)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => `^${escapeRegExp(entry).replaceAll("\\*", ".+")}$`);
}

export function isAllowedHostname(hostname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => new RegExp(pattern).test(hostname));
}

/** Narrow a requested scope to the allowlist so this endpoint cannot be used to mint wider tokens. */
export function resolveScope(requested: string | null): string {
  const scopes = (requested ?? "").split(/[\s,]+/).filter(Boolean);
  if (!scopes.length) return DEFAULT_SCOPE;
  if (scopes.every((scope) => ALLOWED_SCOPES.includes(scope))) return scopes.join(",");
  return DEFAULT_SCOPE;
}

export function createStateToken(): string {
  return crypto.randomUUID().replaceAll("-", "");
}

export function buildStateCookie(token: string): string {
  return [
    `${OAUTH_STATE_COOKIE}=${OAUTH_PROVIDER}_${token}`,
    "HttpOnly",
    "Path=/",
    `Max-Age=${OAUTH_STATE_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
    "Secure",
  ].join("; ");
}

export const CLEARED_STATE_COOKIE = `${OAUTH_STATE_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure`;

/** Pull the provider and CSRF token back out of the cookie set by the authorize endpoint. */
export function readStateCookie(cookieHeader: string | null): { provider: string; token: string } | null {
  const match = cookieHeader?.match(
    new RegExp(`(?:^|;\\s*)${OAUTH_STATE_COOKIE}=([a-z]+)_([0-9a-f]{32})(?:;|$)`),
  );

  if (!match?.[1] || !match[2]) return null;
  return { provider: match[1], token: match[2] };
}

function serializeForScript(value: unknown): string {
  return JSON.stringify(value ?? null).replaceAll("<", "\\u003c");
}

type HandshakeArgs = {
  token?: string;
  error?: string;
  errorCode?: OAuthErrorCode;
};

/**
 * Render the popup page that completes the handshake with the CMS window.
 *
 * The CMS replies to our `authorizing:<provider>` ping, and the browser stamps the reply's origin,
 * so that origin -- not the caller-supplied `site_id` -- is what gates the token. Errors carry no
 * secret and are always passed through so the sign-in screen can explain what went wrong.
 */
export function renderHandshakeResponse({ token, error, errorCode }: HandshakeArgs): Response {
  const state = error ? "error" : "success";
  const content = error
    ? { provider: OAUTH_PROVIDER, error, errorCode }
    : { provider: OAUTH_PROVIDER, token };

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Signing in…</title></head><body><script>
(() => {
  const trustedPatterns = ${serializeForScript(getAllowedDomainPatterns())};
  const hasToken = ${serializeForScript(Boolean(token))};
  const message = ${serializeForScript(`authorization:${OAUTH_PROVIDER}:${state}:${JSON.stringify(content)}`)};

  const isTrusted = (origin) => {
    try {
      const { hostname } = new URL(origin);
      return trustedPatterns.some((pattern) => new RegExp(pattern).test(hostname));
    } catch {
      return false;
    }
  };

  window.addEventListener('message', ({ data, origin }) => {
    if (data !== ${serializeForScript(`authorizing:${OAUTH_PROVIDER}`)}) return;
    if (hasToken && !isTrusted(origin)) return;
    window.opener?.postMessage(message, origin);
  });

  window.opener?.postMessage(${serializeForScript(`authorizing:${OAUTH_PROVIDER}`)}, '*');
})();
</script></body></html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html;charset=UTF-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Set-Cookie": CLEARED_STATE_COOKIE,
    },
  });
}

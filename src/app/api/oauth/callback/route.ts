import {
  OAUTH_PROVIDER,
  readOAuthClientConfig,
  readStateCookie,
  renderHandshakeResponse,
} from "@/lib/cms-oauth";

export const dynamic = "force-dynamic";

type GitHubTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

/**
 * Step two of the Sveltia CMS sign-in: exchange the authorization code for an access token and
 * hand it to the CMS window. This is the only place the OAuth client secret is used.
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieState = readStateCookie(request.headers.get("cookie"));

  if (!cookieState || cookieState.provider !== OAUTH_PROVIDER) {
    return renderHandshakeResponse({
      error: "Your Git backend is not supported by this authenticator.",
      errorCode: "UNSUPPORTED_BACKEND",
    });
  }

  if (!code || !state) {
    return renderHandshakeResponse({
      error: "Failed to receive an authorization code. Please try again later.",
      errorCode: "AUTH_CODE_REQUEST_FAILED",
    });
  }

  if (state !== cookieState.token) {
    return renderHandshakeResponse({
      error: "Potential CSRF attack detected. Authentication flow aborted.",
      errorCode: "CSRF_DETECTED",
    });
  }

  const client = readOAuthClientConfig();

  if (!client) {
    return renderHandshakeResponse({
      error: "OAuth app client ID or secret is not configured.",
      errorCode: "MISCONFIGURED_CLIENT",
    });
  }

  let response: Response;

  try {
    response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        client_id: client.clientId,
        client_secret: client.clientSecret,
      }),
    });
  } catch (cause) {
    console.error("[cms-oauth] token request to GitHub failed", cause);

    return renderHandshakeResponse({
      error: "Failed to request an access token. Please try again later.",
      errorCode: "TOKEN_REQUEST_FAILED",
    });
  }

  let payload: GitHubTokenResponse;

  try {
    payload = (await response.json()) as GitHubTokenResponse;
  } catch {
    return renderHandshakeResponse({
      error: "GitHub responded with malformed data. Please try again later.",
      errorCode: "MALFORMED_RESPONSE",
    });
  }

  if (!payload.access_token) {
    // Logged so the reason is recoverable from the Worker logs. The request body is never logged:
    // it carries the client secret.
    console.error("[cms-oauth] GitHub rejected the token exchange", {
      status: response.status,
      error: payload.error,
      description: payload.error_description,
    });

    // Deliberately no `errorCode`: Sveltia localizes a known code and would replace this text with
    // a generic "try again later", hiding the reason GitHub actually gave.
    return renderHandshakeResponse({
      error: payload.error
        ? `GitHub rejected the token request (${payload.error}): ${
            payload.error_description ?? "no description given"
          }`
        : "GitHub did not return an access token.",
    });
  }

  return renderHandshakeResponse({ token: payload.access_token });
}

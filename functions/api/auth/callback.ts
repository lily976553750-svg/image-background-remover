import {
  AuthEnv,
  GoogleProfile,
  clearCookie,
  createCookie,
  createSession,
  getCookie,
  getRedirectUri,
  getSiteUrl,
  jsonResponse,
  verifySignedValue,
  base64UrlDecode,
} from "../../_shared/auth";
import { saveGoogleLogin } from "../../_shared/db";

interface CloudflareContext {
  request: Request;
  env: AuthEnv;
}

export async function onRequestGet(context: CloudflareContext) {
  const { request, env } = context;
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const savedState = getCookie(request, "bg_oauth_state");

  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.AUTH_SECRET) {
    return jsonResponse({ error: "Google sign-in is not configured." }, { status: 500 });
  }

  if (!code || !state || !savedState || state !== savedState) {
    return redirectWithError(request, env, "invalid_state");
  }

  const statePayload = await verifySignedValue(env.AUTH_SECRET, state);
  if (!statePayload) {
    return redirectWithError(request, env, "invalid_state");
  }

  const next = getNextFromState(statePayload);

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: getRedirectUri(request, env),
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Google token exchange failed", await tokenResponse.text());
      return redirectWithError(request, env, "token_exchange_failed");
    }

    const tokenData = (await tokenResponse.json()) as { access_token?: string };
    if (!tokenData.access_token) {
      return redirectWithError(request, env, "missing_access_token");
    }

    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      console.error("Google profile request failed", await profileResponse.text());
      return redirectWithError(request, env, "profile_failed");
    }

    const profile = (await profileResponse.json()) as GoogleProfile;
    if (!profile.email || !profile.email_verified) {
      return redirectWithError(request, env, "email_not_verified");
    }

    await saveGoogleLogin(env, profile, request);

    const session = await createSession(env, {
      id: profile.sub,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    });

    const headers = new Headers({
      Location: new URL(next, getSiteUrl(request, env)).toString(),
    });
    headers.append("Set-Cookie", createCookie("bg_session", session, 60 * 60 * 24 * 7));
    headers.append("Set-Cookie", clearCookie("bg_oauth_state"));

    return new Response(null, {
      status: 302,
      headers,
    });
  } catch (error) {
    console.error("Google sign-in failed", error);
    return redirectWithError(request, env, "signin_failed");
  }
}

function getNextFromState(statePayload: string) {
  try {
    const payloadText = new TextDecoder().decode(base64UrlDecode(statePayload));
    const payload = JSON.parse(payloadText) as { next?: string };
    return payload.next?.startsWith("/") ? payload.next : "/";
  } catch {
    return "/";
  }
}

function redirectWithError(request: Request, env: AuthEnv, error: string) {
  const url = new URL("/", getSiteUrl(request, env));
  url.searchParams.set("auth_error", error);

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      "Set-Cookie": clearCookie("bg_oauth_state"),
    },
  });
}

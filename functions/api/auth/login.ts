import {
  AuthEnv,
  createCookie,
  getRedirectUri,
  getSiteUrl,
  randomToken,
  signValue,
} from "../../_shared/auth";

interface CloudflareContext {
  request: Request;
  env: AuthEnv;
}

export async function onRequestGet(context: CloudflareContext) {
  const { request, env } = context;

  if (!env.GOOGLE_CLIENT_ID || !env.AUTH_SECRET) {
    return new Response("Google sign-in is not configured.", { status: 500 });
  }

  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get("next") || "/";
  const stateValue = base64EncodeJson({
    nonce: randomToken(),
    next: next.startsWith("/") ? next : "/",
  });
  const state = await signValue(env.AUTH_SECRET, stateValue);

  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  googleUrl.searchParams.set("redirect_uri", getRedirectUri(request, env));
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", "openid email profile");
  googleUrl.searchParams.set("state", state);
  googleUrl.searchParams.set("prompt", "select_account");

  return new Response(null, {
    status: 302,
    headers: {
      Location: googleUrl.toString(),
      "Set-Cookie": createCookie("bg_oauth_state", state, 60 * 10),
      "Referrer-Policy": "origin",
      "Content-Security-Policy": `frame-ancestors 'none'; form-action 'self' ${getSiteUrl(
        request,
        env
      )}`,
    },
  });
}

function base64EncodeJson(value: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

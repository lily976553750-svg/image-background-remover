export interface AuthEnv {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  AUTH_SECRET: string;
  AUTH_REDIRECT_URI?: string;
  SITE_URL?: string;
  DB?: D1Database;
}

export interface GoogleProfile {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<unknown>;
}

const encoder = new TextEncoder();

export function getCookie(request: Request, name: string) {
  const cookie = request.headers.get("Cookie");
  if (!cookie) return null;

  const match = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export function createCookie(name: string, value: string, maxAge: number) {
  return [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ].join("; ");
}

export function clearCookie(name: string) {
  return createCookie(name, "", 0);
}

export function getRedirectUri(request: Request, env: AuthEnv) {
  if (env.AUTH_REDIRECT_URI) {
    return env.AUTH_REDIRECT_URI;
  }

  return new URL("/api/auth/callback", request.url).toString();
}

export function getSiteUrl(request: Request, env: AuthEnv) {
  if (env.SITE_URL) {
    return env.SITE_URL;
  }

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

export function base64UrlEncode(input: ArrayBuffer | Uint8Array | string) {
  const bytes =
    typeof input === "string"
      ? encoder.encode(input)
      : input instanceof Uint8Array
        ? input
        : new Uint8Array(input);

  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function base64UrlDecode(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return base64UrlEncode(signature);
}

export async function signValue(secret: string, value: string) {
  return `${value}.${await hmac(secret, value)}`;
}

export async function verifySignedValue(secret: string, signedValue: string) {
  const separatorIndex = signedValue.lastIndexOf(".");
  if (separatorIndex === -1) return null;

  const value = signedValue.slice(0, separatorIndex);
  const signature = signedValue.slice(separatorIndex + 1);
  const expected = await hmac(secret, value);

  return signature === expected ? value : null;
}

export async function createSession(env: AuthEnv, user: SessionUser) {
  const payload = {
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    user,
  };

  return signValue(env.AUTH_SECRET, base64UrlEncode(JSON.stringify(payload)));
}

export async function readSession(request: Request, env: AuthEnv) {
  const sessionCookie = getCookie(request, "bg_session");
  if (!sessionCookie || !env.AUTH_SECRET) return null;

  const payloadValue = await verifySignedValue(env.AUTH_SECRET, sessionCookie);
  if (!payloadValue) return null;

  try {
    const payloadText = new TextDecoder().decode(base64UrlDecode(payloadValue));
    const payload = JSON.parse(payloadText) as { exp: number; user: SessionUser };

    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload.user;
  } catch {
    return null;
  }
}

export function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}

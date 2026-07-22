import { AuthEnv, GoogleProfile, SessionUser } from "./auth";

interface StoredUser extends SessionUser {
  plan: string;
  role: string;
  loginCount: number;
}

export async function saveGoogleLogin(
  env: AuthEnv,
  profile: GoogleProfile,
  request: Request
) {
  if (!env.DB) return null;

  const now = new Date().toISOString();
  const country = request.headers.get("CF-IPCountry") || null;
  const userAgent = request.headers.get("User-Agent") || null;

  await env.DB
    .prepare(
      `
      INSERT INTO users (
        id, google_sub, email, email_verified, name, picture,
        provider, plan, role, created_at, updated_at, last_login_at, login_count
      )
      VALUES (?, ?, ?, ?, ?, ?, 'google', 'free', 'user', ?, ?, ?, 1)
      ON CONFLICT(id) DO UPDATE SET
        email = excluded.email,
        email_verified = excluded.email_verified,
        name = excluded.name,
        picture = excluded.picture,
        updated_at = excluded.updated_at,
        last_login_at = excluded.last_login_at,
        login_count = users.login_count + 1
      `
    )
    .bind(
      profile.sub,
      profile.sub,
      profile.email,
      profile.email_verified ? 1 : 0,
      profile.name || null,
      profile.picture || null,
      now,
      now,
      now
    )
    .run();

  await env.DB
    .prepare(
      `
      INSERT INTO auth_login_events (
        user_id, provider, email, country, user_agent, created_at
      )
      VALUES (?, 'google', ?, ?, ?, ?)
      `
    )
    .bind(profile.sub, profile.email, country, userAgent, now)
    .run();

  return getUserById(env, profile.sub);
}

export async function getUserById(env: AuthEnv, userId: string) {
  if (!env.DB) return null;

  const row = await env.DB
    .prepare(
      `
      SELECT
        id,
        email,
        name,
        picture,
        plan,
        role,
        login_count AS loginCount
      FROM users
      WHERE id = ?
      `
    )
    .bind(userId)
    .first<StoredUser>();

  return row;
}

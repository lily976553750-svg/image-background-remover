import { AuthEnv, GoogleProfile, SessionUser } from "./auth";

interface StoredUser extends SessionUser {
  plan: string;
  role: string;
  loginCount: number;
}

export const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  starter: 25,
  creator: 80,
  pro: 220,
  business: 500,
};

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

export async function ensureUserFromSession(env: AuthEnv, user: SessionUser) {
  if (!env.DB) return null;

  const existingUser = await getUserById(env, user.id);
  if (existingUser) return existingUser;

  const now = new Date().toISOString();

  await env.DB
    .prepare(
      `
      INSERT INTO users (
        id, google_sub, email, email_verified, name, picture,
        provider, plan, role, created_at, updated_at, last_login_at, login_count
      )
      VALUES (?, ?, ?, 1, ?, ?, 'google', 'free', 'user', ?, ?, ?, 0)
      `
    )
    .bind(user.id, user.id, user.email, user.name || null, user.picture || null, now, now, now)
    .run();

  return getUserById(env, user.id);
}

export function getPlanLimit(plan: string) {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

export function getCurrentMonthStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function getMonthlySuccessfulRemovals(env: AuthEnv, userId: string) {
  if (!env.DB) return 0;

  const row = await env.DB
    .prepare(
      `
      SELECT COALESCE(SUM(quantity), 0) AS used
      FROM usage_events
      WHERE user_id = ?
        AND event_name = 'background_removed'
        AND created_at >= ?
      `
    )
    .bind(userId, getCurrentMonthStart())
    .first<{ used: number }>();

  return row?.used ?? 0;
}

export async function recordSuccessfulRemoval(
  env: AuthEnv,
  userId: string,
  metadata: Record<string, unknown>
) {
  if (!env.DB) return;

  await env.DB
    .prepare(
      `
      INSERT INTO usage_events (
        user_id, event_name, quantity, metadata_json, created_at
      )
      VALUES (?, 'background_removed', 1, ?, ?)
      `
    )
    .bind(userId, JSON.stringify(metadata), new Date().toISOString())
    .run();
}

import { AuthEnv, jsonResponse, readSession } from "../../_shared/auth";
import {
  ensureUserFromSession,
  getCurrentMonthStart,
  getMonthlySuccessfulRemovals,
  getPlanLimit,
} from "../../_shared/db";

interface CloudflareContext {
  request: Request;
  env: AuthEnv;
}

export async function onRequestGet(context: CloudflareContext) {
  const { request, env } = context;
  const sessionUser = await readSession(request, env);

  if (!sessionUser) {
    return jsonResponse({
      authenticated: false,
    });
  }

  if (!env.DB) {
    return jsonResponse(
      {
        authenticated: true,
        error: "usage_tracking_unavailable",
        message: "Usage tracking is temporarily unavailable.",
      },
      { status: 503 }
    );
  }

  const account = await ensureUserFromSession(env, sessionUser);

  if (!account) {
    return jsonResponse(
      {
        authenticated: true,
        error: "account_unavailable",
        message: "Could not load your account.",
      },
      { status: 503 }
    );
  }

  const limit = getPlanLimit(account.plan);
  const used = await getMonthlySuccessfulRemovals(env, account.id);

  return jsonResponse({
    authenticated: true,
    user: account,
    usage: {
      plan: account.plan,
      limit,
      used,
      remaining: Math.max(0, limit - used),
      monthStart: getCurrentMonthStart(),
      resetPolicy: "monthly_no_rollover",
    },
  });
}

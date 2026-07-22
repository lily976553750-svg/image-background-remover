import { AuthEnv, jsonResponse, readSession } from "../../_shared/auth";
import { getUserById } from "../../_shared/db";

interface CloudflareContext {
  request: Request;
  env: AuthEnv;
}

export async function onRequestGet(context: CloudflareContext) {
  const user = await readSession(context.request, context.env);
  const account = user ? await getUserById(context.env, user.id) : null;

  return jsonResponse({
    authenticated: Boolean(user),
    user: account || user,
  });
}

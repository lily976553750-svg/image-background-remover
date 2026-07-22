import { AuthEnv, jsonResponse, readSession } from "../../_shared/auth";

interface CloudflareContext {
  request: Request;
  env: AuthEnv;
}

export async function onRequestGet(context: CloudflareContext) {
  const user = await readSession(context.request, context.env);

  return jsonResponse({
    authenticated: Boolean(user),
    user,
  });
}

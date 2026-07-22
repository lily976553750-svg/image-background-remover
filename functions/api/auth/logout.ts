import { clearCookie } from "../../_shared/auth";

export async function onRequestPost() {
  return new Response(null, {
    status: 204,
    headers: {
      "Set-Cookie": clearCookie("bg_session"),
    },
  });
}

import { AuthEnv } from "./auth";
import { PaidPlan } from "./db";

export const PAYPAL_PLANS: Record<
  PaidPlan,
  { name: string; price: string; images: number }
> = {
  starter: {
    name: "Starter",
    price: "8.99",
    images: 25,
  },
  creator: {
    name: "Creator",
    price: "19.99",
    images: 80,
  },
};

export function getPayPalApiBase(env: AuthEnv) {
  return env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export function getPayPalPlanId(env: AuthEnv, plan: PaidPlan) {
  return plan === "starter" ? env.PAYPAL_STARTER_PLAN_ID : env.PAYPAL_CREATOR_PLAN_ID;
}

export async function getPayPalAccessToken(env: AuthEnv) {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal credentials are not configured.");
  }

  const credentials = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`);
  const response = await fetch(`${getPayPalApiBase(env)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`PayPal token request failed with ${response.status}.`);
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("PayPal did not return an access token.");
  }

  return data.access_token;
}

export async function paypalRequest<T>(
  env: AuthEnv,
  path: string,
  init: RequestInit = {}
) {
  const accessToken = await getPayPalAccessToken(env);
  const response = await fetch(`${getPayPalApiBase(env)}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(
      `PayPal request failed with ${response.status}: ${JSON.stringify(data)}`
    );
  }

  return data as T;
}

export function amountToCents(value?: string) {
  if (!value) return 0;
  return Math.round(Number(value) * 100);
}

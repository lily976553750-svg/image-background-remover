import { AuthEnv, getSiteUrl, jsonResponse, readSession } from "../../_shared/auth";
import { ensureUserFromSession, isPaidPlan, upsertSubscription } from "../../_shared/db";
import { getPayPalPlanId, paypalRequest } from "../../_shared/paypal";

interface CloudflareContext {
  request: Request;
  env: AuthEnv;
}

interface CreateSubscriptionResponse {
  id: string;
  status: string;
  links?: Array<{
    href: string;
    rel: string;
  }>;
}

export async function onRequestPost(context: CloudflareContext) {
  const { request, env } = context;
  const sessionUser = await readSession(request, env);

  if (!sessionUser) {
    return jsonResponse(
      {
        error: "login_required",
        message: "Please sign in before choosing a paid plan.",
      },
      { status: 401 }
    );
  }

  if (!env.DB) {
    return jsonResponse(
      {
        error: "database_unavailable",
        message: "Subscription storage is temporarily unavailable.",
      },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as { plan?: string } | null;
  const plan = body?.plan?.toLowerCase() || "";

  if (!isPaidPlan(plan)) {
    return jsonResponse(
      {
        error: "invalid_plan",
        message: "Please choose Starter or Creator.",
      },
      { status: 400 }
    );
  }

  const paypalPlanId = getPayPalPlanId(env, plan);
  if (!paypalPlanId) {
    return jsonResponse(
      {
        error: "paypal_plan_unavailable",
        message: "PayPal plan is not configured yet.",
      },
      { status: 503 }
    );
  }

  const account = await ensureUserFromSession(env, sessionUser);
  if (!account) {
    return jsonResponse(
      {
        error: "account_unavailable",
        message: "Could not load your account.",
      },
      { status: 503 }
    );
  }

  const siteUrl = getSiteUrl(request, env);
  const subscription = await paypalRequest<CreateSubscriptionResponse>(
    env,
    "/v1/billing/subscriptions",
    {
      method: "POST",
      body: JSON.stringify({
        plan_id: paypalPlanId,
        custom_id: account.id,
        application_context: {
          brand_name: "BG Remover",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${siteUrl}/pricing?paypal=success`,
          cancel_url: `${siteUrl}/pricing?paypal=cancelled`,
        },
      }),
    }
  );

  const approvalUrl = subscription.links?.find((link) => link.rel === "approve")?.href;

  if (!approvalUrl) {
    return jsonResponse(
      {
        error: "paypal_approval_unavailable",
        message: "PayPal did not return an approval link.",
      },
      { status: 502 }
    );
  }

  await upsertSubscription(env, {
    id: `paypal:${subscription.id}`,
    userId: account.id,
    providerSubscriptionId: subscription.id,
    plan,
    status: subscription.status || "APPROVAL_PENDING",
  });

  return jsonResponse({
    subscriptionId: subscription.id,
    approvalUrl,
  });
}

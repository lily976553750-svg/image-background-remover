import { AuthEnv, jsonResponse } from "../../_shared/auth";
import {
  getSubscriptionByProviderId,
  isPaidPlan,
  recordPayment,
  updateUserPlan,
  upsertSubscription,
} from "../../_shared/db";
import { amountToCents, getPayPalPlanId, paypalRequest } from "../../_shared/paypal";

interface CloudflareContext {
  request: Request;
  env: AuthEnv;
}

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource?: {
    id?: string;
    custom_id?: string;
    status?: string;
    plan_id?: string;
    billing_info?: {
      next_billing_time?: string;
    };
    create_time?: string;
    update_time?: string;
    billing_agreement_id?: string;
    amount?: {
      total?: string;
      value?: string;
      currency?: string;
      currency_code?: string;
    };
  };
}

async function verifyWebhookSignature(
  env: AuthEnv,
  request: Request,
  webhookEvent: PayPalWebhookEvent
) {
  if (!env.PAYPAL_WEBHOOK_ID) {
    return false;
  }

  const verification = await paypalRequest<{ verification_status?: string }>(
    env,
    "/v1/notifications/verify-webhook-signature",
    {
      method: "POST",
      body: JSON.stringify({
        auth_algo: request.headers.get("PAYPAL-AUTH-ALGO"),
        cert_url: request.headers.get("PAYPAL-CERT-URL"),
        transmission_id: request.headers.get("PAYPAL-TRANSMISSION-ID"),
        transmission_sig: request.headers.get("PAYPAL-TRANSMISSION-SIG"),
        transmission_time: request.headers.get("PAYPAL-TRANSMISSION-TIME"),
        webhook_id: env.PAYPAL_WEBHOOK_ID,
        webhook_event: webhookEvent,
      }),
    }
  );

  return verification.verification_status === "SUCCESS";
}

function planFromPayPalPlanId(env: AuthEnv, paypalPlanId?: string) {
  if (!paypalPlanId) return null;
  if (paypalPlanId === getPayPalPlanId(env, "starter")) return "starter";
  if (paypalPlanId === getPayPalPlanId(env, "creator")) return "creator";
  return null;
}

export async function onRequestPost(context: CloudflareContext) {
  const { request, env } = context;

  if (!env.DB) {
    return jsonResponse({ error: "database_unavailable" }, { status: 503 });
  }

  const event = (await request.json().catch(() => null)) as PayPalWebhookEvent | null;
  if (!event?.event_type || !event.resource) {
    return jsonResponse({ error: "invalid_webhook_event" }, { status: 400 });
  }

  const signatureIsValid = await verifyWebhookSignature(env, request, event).catch(() => false);
  if (!signatureIsValid) {
    return jsonResponse({ error: "invalid_webhook_signature" }, { status: 400 });
  }

  const resource = event.resource;

  if (
    event.event_type === "BILLING.SUBSCRIPTION.ACTIVATED" ||
    event.event_type === "BILLING.SUBSCRIPTION.UPDATED"
  ) {
    const providerSubscriptionId = resource.id;
    const userId = resource.custom_id;
    const plan = planFromPayPalPlanId(env, resource.plan_id);

    if (providerSubscriptionId && userId && plan && isPaidPlan(plan)) {
      await upsertSubscription(env, {
        id: `paypal:${providerSubscriptionId}`,
        userId,
        providerSubscriptionId,
        plan,
        status: resource.status || "ACTIVE",
        currentPeriodStart: resource.create_time || null,
        currentPeriodEnd: resource.billing_info?.next_billing_time || null,
      });

      if ((resource.status || "ACTIVE").toUpperCase() === "ACTIVE") {
        await updateUserPlan(env, userId, plan);
      }
    }
  }

  if (
    event.event_type === "BILLING.SUBSCRIPTION.CANCELLED" ||
    event.event_type === "BILLING.SUBSCRIPTION.SUSPENDED" ||
    event.event_type === "BILLING.SUBSCRIPTION.EXPIRED"
  ) {
    const providerSubscriptionId = resource.id;
    if (providerSubscriptionId) {
      const subscription = await getSubscriptionByProviderId(env, providerSubscriptionId);

      if (subscription) {
        await upsertSubscription(env, {
          id: subscription.id,
          userId: subscription.userId,
          providerSubscriptionId,
          plan: subscription.plan,
          status: resource.status || event.event_type.split(".").at(-1) || "INACTIVE",
          cancelAtPeriodEnd: true,
        });
        await updateUserPlan(env, subscription.userId, "free");
      }
    }
  }

  if (
    event.event_type === "PAYMENT.SALE.COMPLETED" ||
    event.event_type === "PAYMENT.CAPTURE.COMPLETED" ||
    event.event_type === "BILLING.SUBSCRIPTION.PAYMENT.SUCCEEDED"
  ) {
    const providerSubscriptionId = resource.billing_agreement_id || resource.id;
    const subscription = providerSubscriptionId
      ? await getSubscriptionByProviderId(env, providerSubscriptionId)
      : null;

    if (subscription && resource.id) {
      const amount = resource.amount;
      await recordPayment(env, {
        id: `paypal:${resource.id}`,
        userId: subscription.userId,
        providerPaymentId: resource.id,
        amountCents: amountToCents(amount?.value || amount?.total),
        currency: amount?.currency_code || amount?.currency || "USD",
        status: "COMPLETED",
        metadata: {
          eventId: event.id,
          eventType: event.event_type,
          subscriptionId: providerSubscriptionId,
        },
      });
    }
  }

  return jsonResponse({ received: true });
}

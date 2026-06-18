import { headers } from "next/headers";
import Stripe from "stripe";
import { getStripe, getPlanFromPriceId } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import type { Subscription, SubscriptionPlan, SubscriptionStatus } from "@/types";

export const runtime = "nodejs";

async function findUserIdByCustomerId(customerId: string) {
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  return data?.user_id ?? null;
}

function resolveUserId(
  metadataUserId: string | undefined,
  customerId: string | Stripe.Customer | Stripe.DeletedCustomer | null
) {
  if (metadataUserId) return Promise.resolve(metadataUserId);
  if (typeof customerId === "string") return findUserIdByCustomerId(customerId);
  return Promise.resolve(null);
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  const statusMap: Record<string, SubscriptionStatus> = {
    active: "active",
    canceled: "canceled",
    past_due: "past_due",
    trialing: "trialing",
    incomplete: "incomplete",
    incomplete_expired: "canceled",
    unpaid: "past_due",
    paused: "canceled",
  };
  return statusMap[status] || "incomplete";
}

async function updateSubscription(
  userId: string,
  data: {
    plan?: SubscriptionPlan;
    status?: SubscriptionStatus;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string | null;
    stripePriceId?: string | null;
    currentPeriodStart?: string | null;
    currentPeriodEnd?: string | null;
    cancelAtPeriodEnd?: boolean;
  }
) {
  const supabase = await createServiceClient();

  const updatePayload: Partial<Subscription> = {};
  if (data.plan !== undefined) updatePayload.plan = data.plan;
  if (data.status !== undefined) updatePayload.status = data.status;
  if (data.stripeCustomerId !== undefined) updatePayload.stripe_customer_id = data.stripeCustomerId;
  if (data.stripeSubscriptionId !== undefined) updatePayload.stripe_subscription_id = data.stripeSubscriptionId;
  if (data.stripePriceId !== undefined) updatePayload.stripe_price_id = data.stripePriceId;
  if (data.currentPeriodStart !== undefined) updatePayload.current_period_start = data.currentPeriodStart;
  if (data.currentPeriodEnd !== undefined) updatePayload.current_period_end = data.currentPeriodEnd;
  if (data.cancelAtPeriodEnd !== undefined) updatePayload.cancel_at_period_end = data.cancelAtPeriodEnd;

  const { error } = await supabase
    .from("subscriptions")
    .update(updatePayload)
    .eq("user_id", userId);

  if (error) {
    console.error("Subscription update error:", error);
    throw error;
  }
}

async function syncSubscriptionFromStripe(
  userId: string,
  subscription: Stripe.Subscription,
  stripeCustomerId?: string
) {
  const priceId = subscription.items.data[0]?.price.id;
  const plan = priceId ? getPlanFromPriceId(priceId) : "free";

  await updateSubscription(userId, {
    plan,
    status: mapStripeStatus(subscription.status),
    ...(stripeCustomerId ? { stripeCustomerId } : {}),
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;

        if (!userId || session.mode !== "subscription") break;

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (!subscriptionId) break;

        const subscription = await getStripe().subscriptions.retrieve(subscriptionId);

        await syncSubscriptionFromStripe(
          userId,
          subscription,
          session.customer as string
        );
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;

        if (!subscriptionId) break;

        const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
        const userId =
          subscription.metadata?.supabase_user_id ||
          (await resolveUserId(undefined, subscription.customer));

        if (!userId) break;

        const customerId =
          typeof subscription.customer === "string" ? subscription.customer : undefined;

        await syncSubscriptionFromStripe(userId, subscription, customerId);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId =
          subscription.metadata?.supabase_user_id ||
          (await resolveUserId(undefined, subscription.customer));

        if (!userId) break;

        await syncSubscriptionFromStripe(userId, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId =
          subscription.metadata?.supabase_user_id ||
          (await resolveUserId(undefined, subscription.customer));

        if (!userId) break;

        await updateSubscription(userId, {
          plan: "free",
          status: "canceled",
          stripeSubscriptionId: null,
          stripePriceId: null,
          currentPeriodStart: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;

        if (!subscriptionId) break;

        const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
        const userId =
          subscription.metadata?.supabase_user_id ||
          (await resolveUserId(undefined, subscription.customer));

        if (!userId) break;

        await updateSubscription(userId, {
          status: "past_due",
        });
        break;
      }

      default:
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new Response("Webhook handler failed", { status: 500 });
  }
}

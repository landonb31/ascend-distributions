import Stripe from "stripe";
import { getStripe, PLANS, getStripePriceId } from "@/lib/stripe";
import type { SubscriptionPlan } from "@/types";

type BillingInterval = "monthly" | "yearly";

export function getRecurringBillingLabel(interval: BillingInterval) {
  return interval === "monthly"
    ? "Billed monthly, renews automatically"
    : "Billed yearly, renews automatically";
}

async function assertRecurringPrice(stripe: Stripe, priceId: string, interval: BillingInterval) {
  const price = await stripe.prices.retrieve(priceId);

  if (price.type !== "recurring" || !price.recurring) {
    throw new Error("Configured price is not a recurring subscription price");
  }

  const expectedInterval = interval === "monthly" ? "month" : "year";
  if (price.recurring.interval !== expectedInterval) {
    throw new Error(`Price interval mismatch: expected ${expectedInterval}`);
  }

  return price;
}

export async function createSubscriptionPayment({
  customerId,
  userId,
  plan,
  interval,
}: {
  customerId: string;
  userId: string;
  plan: SubscriptionPlan;
  interval: BillingInterval;
}) {
  const planConfig = PLANS[plan];
  const priceId = getStripePriceId(plan, interval);

  if (!priceId) {
    throw new Error("Price not configured for this plan");
  }

  const stripe = getStripe();
  await assertRecurringPrice(stripe, priceId, interval);

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    collection_method: "charge_automatically",
    payment_behavior: "default_incomplete",
    payment_settings: {
      save_default_payment_method: "on_subscription",
      payment_method_types: ["card"],
    },
    expand: ["latest_invoice.payment_intent"],
    metadata: {
      supabase_user_id: userId,
      plan,
      interval,
      billing_type: "recurring",
    },
  });

  const invoice = subscription.latest_invoice as Stripe.Invoice | null;
  const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent | null;

  if (!paymentIntent?.client_secret) {
    throw new Error("Payment intent could not be created");
  }

  return {
    clientSecret: paymentIntent.client_secret,
    subscriptionId: subscription.id,
    plan: {
      id: plan,
      name: planConfig.name,
      amount: interval === "monthly" ? planConfig.monthlyPrice : planConfig.yearlyPrice,
      interval,
      royaltySplit: planConfig.royaltySplit,
      recurringLabel: getRecurringBillingLabel(interval),
    },
  };
}

export async function cancelIncompleteSubscription(subscriptionId: string) {
  const stripe = getStripe();

  try {
    const current = await stripe.subscriptions.retrieve(subscriptionId);

    if (
      current.status === "incomplete" ||
      current.status === "incomplete_expired" ||
      current.status === "past_due"
    ) {
      await stripe.subscriptions.cancel(current.id);
    }
  } catch (error) {
    console.error("Could not clean up previous subscription:", error);
  }
}

import Stripe from "stripe";
import { getStripe, PLANS } from "@/lib/stripe";
import type { SubscriptionPlan } from "@/types";

type BillingInterval = "monthly" | "yearly";

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
  const priceId = planConfig.stripePriceIds[interval];

  if (!priceId) {
    throw new Error("Price not configured for this plan");
  }

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: {
      save_default_payment_method: "on_subscription",
    },
    expand: ["latest_invoice.payment_intent"],
    metadata: {
      supabase_user_id: userId,
      plan,
      interval,
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

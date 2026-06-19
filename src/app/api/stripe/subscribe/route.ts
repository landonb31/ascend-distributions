import { checkoutSchema } from "@/lib/validations";
import { isStripeConfigured } from "@/lib/stripe/config";
import { ensureStripeCustomer } from "@/lib/stripe/customer";
import {
  cancelIncompleteSubscription,
  createSubscriptionPayment,
} from "@/lib/stripe/subscription";
import { createServiceClient } from "@/lib/supabase/server";
import { apiError, apiSuccess, getAuthContext } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input", 400);
    }

    if (!isStripeConfigured()) {
      return apiError("Billing is not configured yet. Contact support.", 503);
    }

    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      return apiError("Stripe publishable key is not configured.", 503);
    }

    const { plan, interval } = parsed.data;

    const { data: existingSubscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("plan, status, stripe_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subscriptionError) {
      console.warn("Could not read subscription:", subscriptionError.message);
    }

    if (
      existingSubscription?.stripe_subscription_id &&
      existingSubscription.plan !== "free" &&
      existingSubscription.status === "active"
    ) {
      return apiError(
        "You already have an active subscription. Manage it in Settings.",
        400
      );
    }

    const service = await createServiceClient();
    const customerId = await ensureStripeCustomer(
      user.id,
      user.email!,
      supabase,
      service
    );

    if (existingSubscription?.stripe_subscription_id) {
      await cancelIncompleteSubscription(existingSubscription.stripe_subscription_id);
    }

    const payment = await createSubscriptionPayment({
      customerId,
      userId: user.id,
      plan,
      interval,
    });

    return apiSuccess({
      ...payment,
      publishableKey,
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    const message =
      error instanceof Error && error.message.includes("Price not configured")
        ? "This plan is not available yet. Please try again later."
        : error instanceof Error && error.message.includes("Payment intent")
          ? "Could not start payment. Please try again."
          : "Failed to initialize subscription payment";
    return apiError(message, 500);
  }
}

import { checkoutSchema } from "@/lib/validations";
import { getStripe, PLANS, getOrCreateStripeCustomer } from "@/lib/stripe";
import { apiError, apiSuccess, getAuthContext } from "@/lib/api";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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

    const { plan, interval } = parsed.data;
    const planConfig = PLANS[plan];
    const priceId = planConfig.stripePriceIds[interval];

    if (!priceId) {
      return apiError("Price not configured for this plan", 500);
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    const customerId = await getOrCreateStripeCustomer(
      user.id,
      user.email!,
      subscription?.stripe_customer_id
    );

    if (!subscription?.stripe_customer_id) {
      await supabase
        .from("subscriptions")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id);
    }

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/dashboard/settings?checkout=success`,
      cancel_url: `${APP_URL}/pricing?checkout=canceled`,
      metadata: {
        supabase_user_id: user.id,
        plan,
        interval,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan,
        },
      },
    });

    return apiSuccess({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Checkout error:", error);
    return apiError("Failed to create checkout session", 500);
  }
}

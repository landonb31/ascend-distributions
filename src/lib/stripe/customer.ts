import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";
import { getOrCreateStripeCustomer } from "@/lib/stripe";

type Supabase = SupabaseClient<Database>;

export async function ensureStripeCustomer(
  userId: string,
  email: string,
  userClient: Supabase,
  serviceClient: Supabase
) {
  const { data: subscription, error: readError } = await userClient
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) {
    console.warn("Could not read subscription record:", readError.message);
  }

  const customerId = await getOrCreateStripeCustomer(
    userId,
    email,
    subscription?.stripe_customer_id
  );

  if (readError) {
    return customerId;
  }

  if (!subscription) {
    const { error } = await serviceClient.from("subscriptions").insert({
      user_id: userId,
      plan: "free",
      status: "active",
      stripe_customer_id: customerId,
    });

    if (error) {
      console.warn("Could not create subscription record:", error.message);
    }
  } else if (!subscription.stripe_customer_id) {
    const { error } = await serviceClient
      .from("subscriptions")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", userId);

    if (error) {
      console.warn("Could not update subscription record:", error.message);
    }
  }

  return customerId;
}

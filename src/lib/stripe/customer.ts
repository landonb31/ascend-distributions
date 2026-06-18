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
  const { data: subscription } = await userClient
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  const customerId = await getOrCreateStripeCustomer(
    userId,
    email,
    subscription?.stripe_customer_id
  );

  if (!subscription) {
    const { error } = await serviceClient.from("subscriptions").insert({
      user_id: userId,
      plan: "free",
      status: "active",
      stripe_customer_id: customerId,
    });

    if (error) {
      throw error;
    }
  } else if (!subscription.stripe_customer_id) {
    const { error } = await serviceClient
      .from("subscriptions")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", userId);

    if (error) {
      throw error;
    }
  }

  return customerId;
}

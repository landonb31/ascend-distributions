"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { stripeAppearance } from "@/lib/stripe/appearance";
import { EmbeddedPaymentForm } from "@/components/billing/embedded-payment-form";
import type { SubscriptionPlan } from "@/types";

const stripePromiseCache = new Map<string, ReturnType<typeof loadStripe>>();

function getStripePromise(publishableKey: string) {
  if (!stripePromiseCache.has(publishableKey)) {
    stripePromiseCache.set(publishableKey, loadStripe(publishableKey));
  }

  return stripePromiseCache.get(publishableKey)!;
}

interface StripePaymentProviderProps {
  clientSecret: string;
  publishableKey: string;
  plan: {
    id: SubscriptionPlan;
    name: string;
    amount: number;
    interval: "monthly" | "yearly";
    royaltySplit: string;
  };
}

export function StripePaymentProvider({
  clientSecret,
  publishableKey,
  plan,
}: StripePaymentProviderProps) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: stripeAppearance,
  };

  return (
    <Elements stripe={getStripePromise(publishableKey)} options={options}>
      <EmbeddedPaymentForm plan={plan} />
    </Elements>
  );
}

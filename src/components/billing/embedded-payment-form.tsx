"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Check, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/stripe/plans";
import type { SubscriptionPlan } from "@/types";

interface EmbeddedPaymentFormProps {
  plan: {
    id: SubscriptionPlan;
    name: string;
    amount: number;
    interval: "monthly" | "yearly";
    royaltySplit: string;
  };
}

export function EmbeddedPaymentForm({ plan }: EmbeddedPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planDetails = PLANS[plan.id];
  const intervalLabel = plan.interval === "monthly" ? "month" : "year";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);

    const returnUrl = `${window.location.origin}/dashboard/settings?checkout=success`;

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
      redirect: "if_required",
    });

    if (submitError) {
      setError(submitError.message || "Payment could not be completed.");
      setSubmitting(false);
      return;
    }

    router.push("/dashboard/settings?checkout=success");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-ascend-purple">
              Selected plan
            </p>
            <h3 className="mt-1 text-2xl font-bold">{plan.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {plan.royaltySplit} royalty split · billed per {intervalLabel}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">${plan.amount}</p>
            <p className="text-sm text-muted-foreground">/{intervalLabel}</p>
          </div>
        </div>

        <ul className="mt-5 space-y-2 border-t border-white/10 pt-5">
          {planDetails.features.slice(0, 4).map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4 text-ascend-purple" />
          <h3 className="font-semibold">Payment details</h3>
        </div>
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full shadow-lg shadow-purple-500/20"
        disabled={!stripe || !elements || submitting}
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing payment...
          </>
        ) : (
          <>Subscribe to {plan.name}</>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" />
        Secured by Stripe · Cancel anytime from Settings
      </div>
    </form>
  );
}

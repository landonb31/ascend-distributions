"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { StripePaymentProvider } from "@/components/billing/stripe-payment-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { SubscriptionPlan } from "@/types";

interface SubscribeCheckoutProps {
  plan: SubscriptionPlan;
  interval: "monthly" | "yearly";
}

type SubscribeResponse = {
  clientSecret: string;
  publishableKey: string;
  plan: {
    id: SubscriptionPlan;
    name: string;
    amount: number;
    interval: "monthly" | "yearly";
    royaltySplit: string;
  };
};

export function SubscribeCheckout({ plan, interval }: SubscribeCheckoutProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<SubscribeResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initializePayment() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/stripe/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, interval }),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (!cancelled) {
            setError(result.error || "Could not start checkout.");
          }
          return;
        }

        if (!cancelled) {
          setPayload(result);
        }
      } catch {
        if (!cancelled) {
          setError("Could not connect to billing. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initializePayment();

    return () => {
      cancelled = true;
    };
  }, [plan, interval]);

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/pricing">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to pricing
        </Link>
      </Button>

      <Card glass className="overflow-hidden border-white/10">
        <CardHeader className="border-b border-white/10 bg-white/[0.02]">
          <CardTitle className="text-2xl">
            Complete your <span className="gradient-text">subscription</span>
          </CardTitle>
          <CardDescription>
            Enter your payment details below. Your plan activates immediately after payment.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-ascend-purple" />
              <p className="mt-4 text-sm text-muted-foreground">
                Preparing secure checkout...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="space-y-4 py-8 text-center">
              <div className="rounded-lg border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-400">
                {error}
              </div>
              <Button asChild>
                <Link href="/dashboard/settings">Go to Settings</Link>
              </Button>
            </div>
          )}

          {!loading && payload && (
            <StripePaymentProvider
              clientSecret={payload.clientSecret}
              publishableKey={payload.publishableKey}
              plan={payload.plan}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

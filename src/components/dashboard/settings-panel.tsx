"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/stripe/plans";
import { cn, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import type { Subscription, SubscriptionPlan } from "@/types";

interface SettingsPanelProps {
  subscription: Subscription | null;
}

export function SettingsPanel({ subscription }: SettingsPanelProps) {
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");

  const currentPlan: SubscriptionPlan = subscription?.plan || "free";
  const planDetails = PLANS[currentPlan];

  async function openBillingPortal() {
    setLoadingPortal(true);
    setPortalError(null);

    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setPortalError(data.error || "Unable to open billing portal.");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setPortalError("Unable to connect to billing. Please try again later.");
    } finally {
      setLoadingPortal(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card glass className="gradient-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Current Plan</CardTitle>
              <CardDescription className="mt-1">
                {subscription?.current_period_end
                  ? `Renews ${formatDate(subscription.current_period_end)}`
                  : "Manage your subscription and billing"}
              </CardDescription>
            </div>
            <Badge className={cn("text-sm", getStatusColor(subscription?.status || "active"))}>
              {getStatusLabel(subscription?.status || "active")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-2xl font-bold">{planDetails.name}</p>
              <p className="text-sm text-ascend-purple font-medium mt-1">
                {planDetails.royaltySplit} Royalty Split
              </p>
              {subscription?.cancel_at_period_end && (
                <p className="text-xs text-yellow-400 mt-2">
                  Cancels at end of billing period
                </p>
              )}
            </div>
            {subscription?.stripe_customer_id && currentPlan !== "free" && (
              <Button variant="outline" onClick={openBillingPortal} disabled={loadingPortal}>
                {loadingPortal ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                Billing Portal
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            )}
          </div>
          {portalError && (
            <p className="text-sm text-red-400 mt-3">{portalError}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setBillingInterval("monthly")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            billingInterval === "monthly"
              ? "bg-gradient-to-r from-ascend-purple to-ascend-blue text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setBillingInterval("yearly")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            billingInterval === "yearly"
              ? "bg-gradient-to-r from-ascend-purple to-ascend-blue text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Yearly
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {(Object.entries(PLANS) as [SubscriptionPlan, typeof PLANS.free][]).map(([id, plan]) => {
          const isCurrent = id === currentPlan;
          const isPopular = id === "standard";
          const displayPrice =
            billingInterval === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

          return (
            <Card
              key={id}
              glass
              className={cn(
                "relative flex flex-col",
                isPopular && "gradient-border shadow-lg shadow-purple-500/10",
                isCurrent && "ring-1 ring-ascend-purple/50"
              )}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-ascend-purple to-ascend-blue px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrent && (
                    <Badge variant="outline" className="text-ascend-purple border-ascend-purple/30">
                      Current
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">${displayPrice}</span>
                  {displayPrice > 0 && (
                    <span className="text-muted-foreground">
                      {billingInterval === "monthly" ? "/month" : "/year"}
                    </span>
                  )}
                </CardDescription>
                <p className="text-sm font-medium text-ascend-purple mt-2">
                  {plan.royaltySplit} Royalty Split
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {!isCurrent && (
                  <CheckoutButton
                    plan={id}
                    interval={billingInterval}
                    isAuthenticated
                    className="w-full"
                    variant={isPopular ? "default" : "outline"}
                  >
                    Upgrade to {plan.name}
                  </CheckoutButton>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

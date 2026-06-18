"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PLANS } from "@/lib/stripe/plans";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/types";

interface PricingSectionProps {
  showAll?: boolean;
  isAuthenticated?: boolean;
}

function PricingContent({ showAll = false, isAuthenticated = false }: PricingSectionProps) {
  const searchParams = useSearchParams();
  const highlightedPlan = searchParams.get("plan") as SubscriptionPlan | null;
  const defaultInterval = searchParams.get("interval") === "yearly" ? "yearly" : "monthly";
  const [interval, setInterval] = useState<"monthly" | "yearly">(defaultInterval);

  const plans = Object.entries(PLANS).map(([id, plan]) => ({
    id: id as SubscriptionPlan,
    ...plan,
    popular: id === "standard",
  }));

  const displayPlans = showAll ? plans : plans;

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium text-ascend-purple">Pricing</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Simple, transparent{" "}
            <span className="gradient-text">pricing</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Start free and upgrade as you grow. No hidden fees, no surprises.
          </p>

          <div className="mt-8 inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => setInterval("monthly")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                interval === "monthly"
                  ? "bg-gradient-to-r from-ascend-purple to-ascend-blue text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setInterval("yearly")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                interval === "yearly"
                  ? "bg-gradient-to-r from-ascend-purple to-ascend-blue text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {displayPlans.map((plan, i) => {
            const price = interval === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            const priceSuffix = interval === "monthly" ? "/month" : "/year";
            const isHighlighted = highlightedPlan === plan.id;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
              >
                <Card
                  glass
                  className={cn(
                    "relative flex h-full flex-col",
                    (plan.popular || isHighlighted) &&
                      "gradient-border shadow-lg shadow-purple-500/10"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-gradient-to-r from-ascend-purple to-ascend-blue px-4 py-1 text-xs font-semibold text-white">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      <span className="text-3xl font-bold text-foreground">${price}</span>
                      {price > 0 && <span className="text-muted-foreground">{priceSuffix}</span>}
                      {interval === "monthly" && plan.yearlyPrice > 0 && (
                        <span className="mt-1 block text-sm">
                          or ${plan.yearlyPrice}/year
                        </span>
                      )}
                      {interval === "yearly" && plan.monthlyPrice > 0 && (
                        <span className="mt-1 block text-sm">
                          ${plan.monthlyPrice}/month billed monthly
                        </span>
                      )}
                    </CardDescription>
                    <p className="mt-2 text-sm font-medium text-ascend-purple">
                      {plan.royaltySplit} Royalty Split
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <ul className="flex-1 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <CheckoutButton
                      plan={plan.id}
                      interval={interval}
                      isAuthenticated={isAuthenticated}
                      className="mt-8 w-full"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.id === "free"
                        ? "Start Free"
                        : isAuthenticated
                          ? `Upgrade to ${plan.name}`
                          : "Get Started"}
                    </CheckoutButton>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function PricingSection(props: PricingSectionProps) {
  return (
    <Suspense>
      <PricingContent {...props} />
    </Suspense>
  );
}

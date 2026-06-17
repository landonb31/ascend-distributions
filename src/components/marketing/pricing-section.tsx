"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PLANS } from "@/lib/stripe/plans";
import { cn } from "@/lib/utils";

export function PricingSection({ showAll = false }: { showAll?: boolean }) {
  const plans = Object.entries(PLANS).map(([id, plan]) => ({
    id,
    ...plan,
    popular: id === "standard",
  }));

  const displayPlans = showAll ? plans : plans;

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-ascend-purple mb-3">Pricing</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Simple, transparent{" "}
            <span className="gradient-text">pricing</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Start free and upgrade as you grow. No hidden fees, no surprises.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {displayPlans.map((plan, i) => (
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
                  "relative h-full flex flex-col",
                  plan.popular && "gradient-border shadow-lg shadow-purple-500/10"
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
                    <span className="text-3xl font-bold text-foreground">
                      ${plan.monthlyPrice}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                    {plan.yearlyPrice > 0 && (
                      <span className="block text-sm mt-1">
                        or ${plan.yearlyPrice}/year
                      </span>
                    )}
                  </CardDescription>
                  <p className="text-sm font-medium text-ascend-purple mt-2">
                    {plan.royaltySplit} Royalty Split
                  </p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-8 w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href={plan.id === "free" ? "/register" : `/register?plan=${plan.id}`}>
                      {plan.id === "free" ? "Start Free" : "Get Started"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

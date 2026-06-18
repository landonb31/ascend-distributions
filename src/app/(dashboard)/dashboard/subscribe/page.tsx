import { redirect } from "next/navigation";
import { SubscribeCheckout } from "@/components/billing/subscribe-checkout";
import { PLANS } from "@/lib/stripe/plans";
import type { SubscriptionPlan } from "@/types";

export const metadata = { title: "Subscribe" };

const VALID_PLANS: SubscriptionPlan[] = ["standard", "pro"];

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; interval?: string }>;
}) {
  const params = await searchParams;
  const plan = params.plan as SubscriptionPlan | undefined;
  const interval = params.interval === "yearly" ? "yearly" : "monthly";

  if (!plan || !VALID_PLANS.includes(plan)) {
    redirect("/pricing");
  }

  const planConfig = PLANS[plan];

  return (
    <div className="relative space-y-8 animate-fade-in">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-ascend-purple/10 to-transparent" />

      <div className="relative text-center">
        <p className="text-sm font-medium text-ascend-purple">Ascend Distributions Billing</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Upgrade to <span className="gradient-text">{planConfig.name}</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Secure embedded checkout powered by Stripe. No redirects — pay right here on Ascend.
        </p>
      </div>

      <SubscribeCheckout plan={plan} interval={interval} />
    </div>
  );
}

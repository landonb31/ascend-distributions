import type { SubscriptionPlan } from "@/types";

function priceId(key: string) {
  return process.env[key] || null;
}

export function getStripePriceId(
  plan: SubscriptionPlan,
  interval: "monthly" | "yearly"
): string | null {
  if (plan === "standard") {
    return interval === "monthly"
      ? priceId("STRIPE_PRICE_STANDARD_MONTHLY")
      : priceId("STRIPE_PRICE_STANDARD_YEARLY");
  }

  if (plan === "pro") {
    return interval === "monthly"
      ? priceId("STRIPE_PRICE_PRO_MONTHLY")
      : priceId("STRIPE_PRICE_PRO_YEARLY");
  }

  return null;
}

export const PLANS: Record<
  SubscriptionPlan,
  {
    name: string;
    monthlyPrice: number;
    yearlyPrice: number;
    royaltySplit: string;
    features: string[];
    stripePriceIds: { monthly: string | null; yearly: string | null };
  }
> = {
  free: {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    royaltySplit: "80/20",
    features: [
      "80/20 Royalty Split",
      "Unlimited Uploads",
      "Basic Analytics",
      "Worldwide Distribution",
    ],
    stripePriceIds: { monthly: null, yearly: null },
  },
  standard: {
    name: "Standard",
    monthlyPrice: 5,
    yearlyPrice: 20,
    royaltySplit: "90/10",
    features: [
      "90/10 Royalty Split",
      "Release Scheduling",
      "Advanced Analytics",
      "Worldwide Distribution",
      "Artist Profiles",
    ],
    get stripePriceIds() {
      return {
        monthly: priceId("STRIPE_PRICE_STANDARD_MONTHLY"),
        yearly: priceId("STRIPE_PRICE_STANDARD_YEARLY"),
      };
    },
  },
  pro: {
    name: "Pro",
    monthlyPrice: 10,
    yearlyPrice: 70,
    royaltySplit: "100%",
    features: [
      "Keep 100% Royalties",
      "Priority Support",
      "Team Accounts",
      "Premium Analytics",
      "Release Scheduling",
      "Worldwide Distribution",
    ],
    get stripePriceIds() {
      return {
        monthly: priceId("STRIPE_PRICE_PRO_MONTHLY"),
        yearly: priceId("STRIPE_PRICE_PRO_YEARLY"),
      };
    },
  },
};

export function getPlanFromPriceId(priceId: string): SubscriptionPlan {
  if (
    priceId === process.env.STRIPE_PRICE_STANDARD_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_STANDARD_YEARLY
  ) {
    return "standard";
  }
  if (
    priceId === process.env.STRIPE_PRICE_PRO_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_PRO_YEARLY
  ) {
    return "pro";
  }
  return "free";
}

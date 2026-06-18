"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { SubscriptionPlan } from "@/types";

type BillingInterval = "monthly" | "yearly";

interface CheckoutButtonProps {
  plan: SubscriptionPlan;
  interval?: BillingInterval;
  isAuthenticated?: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}

export function CheckoutButton({
  plan,
  interval = "monthly",
  isAuthenticated = false,
  children,
  className,
  variant = "default",
}: CheckoutButtonProps) {
  const router = useRouter();

  if (plan === "free") {
    return (
      <Button className={className} variant={variant} asChild>
        <Link href="/register">{children}</Link>
      </Button>
    );
  }

  function handleCheckout() {
    if (!isAuthenticated) {
      router.push(`/register?plan=${plan}&interval=${interval}`);
      return;
    }

    router.push(`/dashboard/subscribe?plan=${plan}&interval=${interval}`);
  }

  return (
    <Button className={className} variant={variant} onClick={handleCheckout}>
      {children}
    </Button>
  );
}

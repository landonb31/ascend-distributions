"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle } from "lucide-react";

function CheckoutSuccessBanner() {
  const searchParams = useSearchParams();

  if (searchParams.get("checkout") !== "success") {
    return null;
  }

  return (
    <div className="rounded-lg border border-green-400/20 bg-green-400/10 p-4 text-sm text-green-400">
      <div className="flex items-center gap-2 font-medium">
        <CheckCircle className="h-4 w-4" />
        Subscription updated successfully
      </div>
      <p className="mt-1 text-green-400/80">
        Your plan changes may take a few seconds to appear.
      </p>
    </div>
  );
}

export function SettingsCheckoutNotice() {
  return (
    <Suspense>
      <CheckoutSuccessBanner />
    </Suspense>
  );
}

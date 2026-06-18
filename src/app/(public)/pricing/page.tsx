import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";
import { PricingSection } from "@/components/marketing/pricing-section";
import { CTASection } from "@/components/marketing/cta-section";

export const metadata = {
  title: "Pricing",
};

export default async function PricingPage() {
  let isAuthenticated = false;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = !!user;
  }

  return (
    <>
      <div className="py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Choose your <span className="gradient-text">plan</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Start free and scale as your career grows. Every plan includes worldwide distribution.
        </p>
      </div>
      <PricingSection showAll isAuthenticated={isAuthenticated} />
      <CTASection />
    </>
  );
}

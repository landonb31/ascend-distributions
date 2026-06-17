import { PricingSection } from "@/components/marketing/pricing-section";
import { CTASection } from "@/components/marketing/cta-section";

export const metadata = {
  title: "Pricing",
};

export default function PricingPage() {
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
      <PricingSection showAll />
      <CTASection />
    </>
  );
}

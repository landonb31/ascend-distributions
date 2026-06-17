import { HeroSection } from "@/components/marketing/hero-section";
import { PlatformMarquee } from "@/components/marketing/platform-marquee";
import { StatsSection } from "@/components/marketing/stats-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { ComparisonSection } from "@/components/marketing/comparison-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { CTASection } from "@/components/marketing/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PlatformMarquee />
      <StatsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ComparisonSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
    </>
  );
}

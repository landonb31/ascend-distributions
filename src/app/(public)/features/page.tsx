import { FeaturesSection } from "@/components/marketing/features-section";
import { CTASection } from "@/components/marketing/cta-section";

export const metadata = {
  title: "Features",
};

export default function FeaturesPage() {
  return (
    <>
      <div className="py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Powerful features for{" "}
          <span className="gradient-text">modern artists</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Everything you need to distribute, promote, and monetize your music — all in one platform.
        </p>
      </div>
      <FeaturesSection />
      <CTASection />
    </>
  );
}

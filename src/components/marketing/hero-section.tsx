"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardMockup } from "@/components/marketing/dashboard-mockup";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 noise pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-ascend-purple/10 blur-[120px] animate-aurora" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-ascend-blue/10 blur-[100px] animate-aurora" />
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32 w-full">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ascend-purple/30 bg-ascend-purple/10 px-4 py-1.5 text-sm backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-ascend-purple" />
              <span className="text-ascend-purple font-medium">Ascend Systems LLC</span>
              <span className="text-muted-foreground">· Premium Distribution</span>
            </div>

            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl leading-[1.05]">
              Distribute Your Music{" "}
              <span className="gradient-text text-glow">Everywhere.</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground sm:text-xl max-w-lg leading-relaxed">
              Upload once. Release everywhere. Keep more of your royalties.
              The distributor built for artists who expect more.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button size="xl" className="animate-pulse-glow group" asChild>
                <Link href="/register">
                  Start Free
                  <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="xl" variant="glass" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              No credit card required · Free plan available · Cancel anytime
            </p>
          </motion.div>

          {/* Right: Dashboard mockup */}
          <div className="relative lg:pl-8">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

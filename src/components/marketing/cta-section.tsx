"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-ascend-purple via-ascend-blue to-ascend-cyan opacity-90 animate-gradient-x bg-[length:200%_200%]" />
          <div className="absolute inset-0 noise opacity-30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />

          <div className="relative px-8 py-20 sm:px-16 sm:py-28 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl text-white">
              Your music deserves a better home.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80 text-lg">
              Join the next generation of independent artists. Start free, release everywhere, ascend.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90 shadow-xl h-14 px-8 text-base font-semibold group"
                asChild
              >
                <Link href="/register">
                  Start Free Today
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 h-14 px-8 text-base"
                asChild
              >
                <Link href="/contact">Talk to Us</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { COMPARISON } from "@/lib/constants";

export function ComparisonSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Not your average{" "}
            <span className="gradient-text">distributor</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Other platforms feel like spreadsheets. Ascend feels like the future.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Ascend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl gradient-border p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-ascend-purple/5 to-ascend-blue/5" />
            <div className="relative">
              <h3 className="text-lg font-bold gradient-text mb-6">Ascend Distributions</h3>
              <ul className="space-y-4">
                {COMPARISON.ascend.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Others */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-8"
          >
            <h3 className="text-lg font-bold text-muted-foreground mb-6">Other Distributors</h3>
            <ul className="space-y-4">
              {COMPARISON.others.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <X className="h-5 w-5 text-red-400/60 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

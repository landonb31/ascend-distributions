"use client";

import { motion } from "framer-motion";
import { Upload, Rocket, Wallet } from "lucide-react";
import { HOW_IT_WORKS } from "@/lib/constants";

const icons = [Upload, Rocket, Wallet];

export function HowItWorksSection() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-ascend-purple/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-ascend-purple mb-3">How it works</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Three steps to{" "}
            <span className="gradient-text">worldwide</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            DistroKid makes you fill out forms. We make you feel like a headliner.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-ascend-purple/40 to-transparent" />

          {HOW_IT_WORKS.map((item, i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative text-center group"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] group-hover:border-ascend-purple/40 group-hover:shadow-lg group-hover:shadow-purple-500/10 transition-all duration-300">
                  <Icon className="h-7 w-7 text-ascend-purple" />
                </div>
                <span className="text-xs font-mono text-ascend-purple/60">{item.step}</span>
                <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

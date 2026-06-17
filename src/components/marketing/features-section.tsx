"use client";

import { motion } from "framer-motion";
import {
  Globe,
  BarChart3,
  DollarSign,
  Zap,
  User,
  Users,
  FileText,
} from "lucide-react";
import { FEATURES } from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  BarChart3,
  DollarSign,
  Zap,
  User,
  Users,
  FileText,
};

const bentoSizes = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-2",
  "md:col-span-2",
];

export function FeaturesSection() {
  return (
    <section className="py-24 sm:py-32 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-ascend-purple mb-3">Platform</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Everything DistroKid wishes{" "}
            <span className="gradient-text">it had</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Professional-grade tools wrapped in an interface so clean it hurts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-fr">
          {FEATURES.map((feature, i) => {
            const Icon = iconMap[feature.icon];
            const isLarge = i === 0 || i === 5;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-500 ${bentoSizes[i] || ""}`}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-ascend-purple/0 to-ascend-blue/0 group-hover:from-ascend-purple/5 group-hover:to-ascend-blue/5 transition-all duration-500" />

                <div className="relative">
                  <div className={`mb-4 flex items-center justify-center rounded-xl bg-gradient-to-br from-ascend-purple/20 to-ascend-blue/20 group-hover:from-ascend-purple/30 group-hover:to-ascend-blue/30 transition-colors ${isLarge ? "h-14 w-14" : "h-10 w-10"}`}>
                    {Icon && <Icon className={`${isLarge ? "h-7 w-7" : "h-5 w-5"} text-ascend-purple`} />}
                  </div>
                  <h3 className={`font-semibold ${isLarge ? "text-xl" : "text-base"}`}>
                    {feature.title}
                  </h3>
                  <p className={`mt-2 text-muted-foreground leading-relaxed ${isLarge ? "text-base" : "text-sm"}`}>
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

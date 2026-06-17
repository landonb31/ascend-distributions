"use client";

import { DISTRIBUTION_PLATFORMS } from "@/lib/constants";

export function PlatformMarquee() {
  const platforms = [...DISTRIBUTION_PLATFORMS, ...DISTRIBUTION_PLATFORMS];

  return (
    <section className="relative py-12 overflow-hidden border-y border-white/5">
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10 pointer-events-none" />
      <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-8">
        Delivered to every major platform
      </p>
      <div className="flex animate-marquee whitespace-nowrap">
        {platforms.map((platform, i) => (
          <div
            key={`${platform.name}-${i}`}
            className="mx-8 flex items-center gap-3 shrink-0 group"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] transition-all duration-300 group-hover:scale-110 group-hover:border-white/20"
              style={{ boxShadow: `0 0 24px ${platform.color}15` }}
            >
              <span className="text-sm font-bold" style={{ color: platform.color }}>
                {platform.name.charAt(0)}
              </span>
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {platform.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { DISTRIBUTION_PLATFORMS } from "@/lib/constants";

type Platform = (typeof DISTRIBUTION_PLATFORMS)[number];

function platformIconUrl(icon: string, color: string, iconColor?: string) {
  const hex = (iconColor ?? color).replace("#", "");
  return `https://cdn.simpleicons.org/${icon}/${hex}`;
}

function PlatformLogo({ platform }: { platform: Platform }) {
  const iconColor = "iconColor" in platform ? platform.iconColor : undefined;

  if ("logo" in platform) {
    return (
      <Image
        src={platform.logo}
        alt={`${platform.name} logo`}
        width={20}
        height={20}
        className="h-5 w-5 object-contain opacity-70 transition-opacity hover:opacity-100"
      />
    );
  }

  return (
    <Image
      src={platformIconUrl(platform.icon, platform.color, iconColor)}
      alt={`${platform.name} logo`}
      width={20}
      height={20}
      className="h-5 w-5 object-contain opacity-70 transition-opacity hover:opacity-100"
      unoptimized
    />
  );
}

export function DashboardPlatformBar() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-black to-transparent" />
      <p className="mb-3 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Distributed to
      </p>
      <div className="flex animate-marquee items-center gap-10 whitespace-nowrap px-4">
        {[...DISTRIBUTION_PLATFORMS, ...DISTRIBUTION_PLATFORMS].map((platform, i) => (
          <div key={`${platform.name}-${i}`} className="flex items-center gap-2.5">
            <PlatformLogo platform={platform} />
            <span className="text-sm text-muted-foreground">{platform.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

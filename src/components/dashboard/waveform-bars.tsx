import { cn } from "@/lib/utils";

interface WaveformBarsProps {
  className?: string;
  bars?: number;
  animated?: boolean;
}

export function WaveformBars({ className, bars = 24, animated = false }: WaveformBarsProps) {
  const heights = Array.from({ length: bars }, (_, i) => {
    const wave = Math.sin(i * 0.55) * 0.35 + Math.cos(i * 0.3) * 0.25;
    return Math.max(0.15, Math.min(1, 0.45 + wave));
  });

  return (
    <div className={cn("flex items-end gap-[3px]", className)} aria-hidden>
      {heights.map((height, i) => (
        <div
          key={i}
          className={cn(
            "w-1 origin-bottom rounded-full bg-gradient-to-t from-ascend-purple/40 via-ascend-blue/60 to-ascend-cyan/80",
            animated && "animate-wave-bar"
          )}
          style={{
            height: `${height * 100}%`,
            animationDelay: animated ? `${i * 0.07}s` : undefined,
          }}
        />
      ))}
    </div>
  );
}

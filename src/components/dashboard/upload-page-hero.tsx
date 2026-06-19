import { Sparkles, Zap } from "lucide-react";
import { WaveformBars } from "@/components/dashboard/waveform-bars";

interface UploadPageHeroProps {
  editing?: boolean;
}

export function UploadPageHero({ editing }: UploadPageHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 upload-card-glow">
      <div className="pointer-events-none absolute inset-0 upload-aurora" />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-ascend-purple/20 blur-3xl animate-glow-pulse" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-ascend-cyan/15 blur-3xl animate-float-delayed" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-ascend-purple/25 bg-ascend-purple/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ascend-purple">
            <Sparkles className="h-3.5 w-3.5" />
            {editing ? "Edit mode" : "Release studio"}
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {editing ? (
                <>
                  Polish your <span className="gradient-text text-glow">release</span>
                </>
              ) : (
                <>
                  Ship your <span className="gradient-text text-glow">sound</span>
                </>
              )}
            </h1>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed sm:text-lg">
              {editing
                ? "Four quick steps — update your tracks, stores, and metadata, then send it live."
                : "Upload singles, EPs, or full albums. Pick your stores. Hit release. Done."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              <Zap className="h-3.5 w-3.5 text-ascend-cyan" />
              Direct to stores
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              150+ platforms
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              No gatekeepers
            </span>
          </div>
        </div>

        <div className="relative flex h-28 w-full max-w-xs items-end rounded-2xl border border-white/10 bg-black/30 px-5 pb-4 pt-8 backdrop-blur-sm lg:shrink-0">
          <WaveformBars className="h-16 w-full" animated />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ascend-purple/50 to-transparent" />
        </div>
      </div>
    </div>
  );
}

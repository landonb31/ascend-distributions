import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardWelcomeProps {
  displayName: string;
  activeReleases: number;
  totalStreams: string;
}

export function DashboardWelcome({
  displayName,
  activeReleases,
  totalStreams,
}: DashboardWelcomeProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-ascend-purple/20 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-ascend-blue/15 blur-[60px]" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-ascend-purple/30 bg-ascend-purple/10 px-3 py-1 text-xs backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-ascend-purple" />
            <span className="font-medium text-ascend-purple">Your music, everywhere</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back,{" "}
            <span className="gradient-text text-glow">{displayName}</span>
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            {activeReleases > 0
              ? `You have ${activeReleases} live release${activeReleases === 1 ? "" : "s"} and ${totalStreams} total streams across every major platform.`
              : "Upload your first track and we'll deliver it to Spotify, Apple Music, and 150+ platforms worldwide."}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Button size="lg" className="shadow-lg shadow-purple-500/20 group" asChild>
            <Link href="/dashboard/upload">
              Upload Music
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button size="lg" variant="glass" asChild>
            <Link href="/dashboard/analytics">View Analytics</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

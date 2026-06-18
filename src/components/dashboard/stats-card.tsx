import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  className?: string;
  accent?: "purple" | "blue" | "cyan";
}

const accentStyles = {
  purple: "from-ascend-purple/30 to-ascend-purple/5 text-ascend-purple",
  blue: "from-ascend-blue/30 to-ascend-blue/5 text-ascend-blue",
  cyan: "from-ascend-cyan/30 to-ascend-cyan/5 text-ascend-cyan",
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
  accent = "purple",
}: StatsCardProps) {
  return (
    <Card
      glass
      className={cn(
        "group relative overflow-hidden border-white/10 transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/5",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-ascend-purple/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-0" />
      <CardContent className="relative p-6">
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br",
              accentStyles[accent]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <span className="rounded-full border border-green-400/20 bg-green-400/10 px-2 py-0.5 text-xs font-medium text-green-400">
              {trend}
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

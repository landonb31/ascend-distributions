import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          "bg-primary/10 text-primary": variant === "default",
          "bg-white/5 text-muted-foreground": variant === "secondary",
          "border border-white/10 text-foreground": variant === "outline",
          "bg-green-400/10 text-green-400": variant === "success",
          "bg-yellow-400/10 text-yellow-400": variant === "warning",
          "bg-red-400/10 text-red-400": variant === "destructive",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };

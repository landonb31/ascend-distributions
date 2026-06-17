import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function Logo({ size = 32, className, showText = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/logo.png"
        alt="Ascend Distributions"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
      {showText && (
        <span className="text-lg font-bold gradient-text">Ascend Distributions</span>
      )}
    </span>
  );
}

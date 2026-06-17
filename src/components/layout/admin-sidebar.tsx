"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Disc3,
  DollarSign,
  CreditCard,
  Wallet,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  Disc3,
  DollarSign,
  CreditCard,
  Wallet,
  FileText,
};

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col glass border-r border-white/10 lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-500">
          <span className="text-sm font-bold text-white">A</span>
        </div>
        <div>
          <span className="text-sm font-bold">Admin Panel</span>
          <p className="text-xs text-muted-foreground">Ascend Distributions</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {ADMIN_NAV.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-red-500/10 text-foreground border border-red-500/20"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
        >
          &larr; Back to Dashboard
        </Link>
      </div>
    </aside>
  );
}

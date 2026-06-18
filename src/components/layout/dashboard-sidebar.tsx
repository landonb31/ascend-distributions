"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Disc3,
  Upload,
  BarChart3,
  DollarSign,
  Wallet,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { DASHBOARD_NAV, APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Disc3,
  Upload,
  BarChart3,
  DollarSign,
  Wallet,
  User,
  Settings,
};

interface DashboardSidebarProps {
  user?: {
    displayName: string;
    avatarUrl?: string | null;
    email: string;
  };
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo size={32} />
          <span className="hidden text-sm font-bold gradient-text lg:block">{APP_NAME}</span>
        </Link>
      </div>

      <div className="px-4 pt-4">
        <Button className="w-full shadow-lg shadow-purple-500/15" asChild>
          <Link href="/dashboard/upload" onClick={() => setMobileOpen(false)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Music
          </Link>
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {DASHBOARD_NAV.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "border border-white/10 bg-gradient-to-r from-ascend-purple/25 to-ascend-blue/15 text-foreground shadow-sm shadow-purple-500/10"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback>{user.displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-white/10 glass px-4 lg:hidden">
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-bold gradient-text">{APP_NAME}</span>
        <Link href="/dashboard/notifications">
          <Bell className="h-5 w-5 text-muted-foreground" />
        </Link>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 glass flex flex-col animate-slide-down">
            <div className="flex justify-end p-4">
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col border-r border-white/10 bg-black/50 backdrop-blur-xl">
        {sidebarContent}
      </aside>
    </>
  );
}

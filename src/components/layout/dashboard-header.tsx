"use client";

import Link from "next/link";
import { Bell, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DashboardHeaderProps {
  displayName: string;
}

export function DashboardHeader({ displayName }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 hidden h-16 items-center justify-between gap-4 border-b border-white/10 bg-black/40 px-6 backdrop-blur-xl lg:flex lg:px-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-ascend-purple">
          Artist Portal
        </p>
        <h2 className="text-sm font-semibold">
          Hey, <span className="gradient-text">{displayName}</span>
        </h2>
      </div>

      <div className="mx-8 flex max-w-md flex-1 items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search releases..."
            className="border-white/10 bg-white/[0.03] pl-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </Button>
        <Button asChild className="shadow-lg shadow-purple-500/20">
          <Link href="/dashboard/upload">
            <Plus className="mr-1 h-4 w-4" />
            New Release
          </Link>
        </Button>
      </div>
    </header>
  );
}

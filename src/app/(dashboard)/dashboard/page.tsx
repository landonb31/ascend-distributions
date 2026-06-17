import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { StatsCard } from "@/components/dashboard/stats-card";
import { StreamsChart } from "@/components/dashboard/streams-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentReleases } from "@/components/dashboard/recent-releases";
import {
  Play,
  DollarSign,
  TrendingUp,
  Disc3,
  Calendar,
} from "lucide-react";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: releases } = await supabase
    .from("releases")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: analytics } = await supabase
    .from("analytics_daily")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: true })
    .limit(30);

  const totalStreams = releases?.reduce((sum, r) => sum + (r.total_streams || 0), 0) || 0;
  const totalRevenue = releases?.reduce((sum, r) => sum + Number(r.total_revenue || 0), 0) || 0;
  const activeReleases = releases?.filter((r) => r.status === "live").length || 0;
  const upcomingReleases = releases?.filter((r) => r.status === "scheduled").length || 0;

  const lastMonthStreams = analytics?.slice(-15).reduce((sum, a) => sum + a.streams, 0) || 0;
  const prevMonthStreams = analytics?.slice(0, 15).reduce((sum, a) => sum + a.streams, 0) || 0;
  const monthlyGrowth = prevMonthStreams > 0
    ? Math.round(((lastMonthStreams - prevMonthStreams) / prevMonthStreams) * 100)
    : 0;

  const streamsChartData = analytics?.map((a) => ({
    date: a.date,
    value: a.streams,
  })) || [];

  const revenueChartData = analytics?.map((a) => ({
    date: a.date,
    value: Number(a.revenue),
  })) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back. Here&apos;s an overview of your music performance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Total Streams"
          value={formatNumber(totalStreams)}
          icon={Play}
          trend={monthlyGrowth > 0 ? `+${monthlyGrowth}%` : undefined}
        />
        <StatsCard
          title="Estimated Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
        />
        <StatsCard
          title="Monthly Growth"
          value={`${monthlyGrowth > 0 ? "+" : ""}${monthlyGrowth}%`}
          icon={TrendingUp}
        />
        <StatsCard
          title="Active Releases"
          value={String(activeReleases)}
          icon={Disc3}
        />
        <StatsCard
          title="Upcoming Releases"
          value={String(upcomingReleases)}
          icon={Calendar}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StreamsChart data={streamsChartData} />
        <RevenueChart data={revenueChartData} />
      </div>

      <RecentReleases releases={releases || []} />
    </div>
  );
}

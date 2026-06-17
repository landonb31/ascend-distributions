import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Users,
  Disc3,
  DollarSign,
  CreditCard,
  Clock,
} from "lucide-react";

export const metadata = { title: "Admin Overview" };

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: userCount },
    { count: releaseCount },
    { count: pendingCount },
    { data: subscriptions },
    { data: recentReleases },
    { data: royalties },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("releases").select("*", { count: "exact", head: true }),
    supabase
      .from("releases")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending_review"),
    supabase.from("subscriptions").select("plan, status"),
    supabase
      .from("releases")
      .select("id, title, status, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("royalties").select("amount, artist_share"),
  ]);

  const totalRevenue =
    royalties?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
  const activeSubscriptions =
    subscriptions?.filter((s) => s.status === "active" && s.plan !== "free")
      .length || 0;
  const proCount = subscriptions?.filter((s) => s.plan === "pro").length || 0;
  const standardCount =
    subscriptions?.filter((s) => s.plan === "standard").length || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Admin Overview
        </h1>
        <p className="text-muted-foreground mt-1">
          Platform metrics and recent activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Total Users"
          value={formatNumber(userCount || 0)}
          icon={Users}
        />
        <StatsCard
          title="Total Releases"
          value={formatNumber(releaseCount || 0)}
          icon={Disc3}
        />
        <StatsCard
          title="Pending Review"
          value={String(pendingCount || 0)}
          icon={Clock}
        />
        <StatsCard
          title="Platform Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
        />
        <StatsCard
          title="Paid Subscriptions"
          value={String(activeSubscriptions)}
          icon={CreditCard}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card glass>
          <CardHeader>
            <CardTitle className="text-base">Subscription Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pro Plan</span>
              <span className="font-semibold">{proCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Standard Plan</span>
              <span className="font-semibold">{standardCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Free Plan</span>
              <span className="font-semibold">
                {(subscriptions?.length || 0) - proCount - standardCount}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle className="text-base">Recent Releases</CardTitle>
          </CardHeader>
          <CardContent>
            {recentReleases && recentReleases.length > 0 ? (
              <div className="space-y-3">
                {recentReleases.map((release) => (
                  <div
                    key={release.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{release.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(release.created_at)}
                      </p>
                    </div>
                    <Badge className={cn("shrink-0", getStatusColor(release.status))}>
                      {getStatusLabel(release.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No releases yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

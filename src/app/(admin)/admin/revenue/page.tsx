import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { DollarSign, TrendingUp, Music, Users } from "lucide-react";

export const metadata = { title: "Admin — Revenue" };

export default async function AdminRevenuePage() {
  const supabase = await createClient();

  const [{ data: royalties }, { data: analytics }] = await Promise.all([
    supabase.from("royalties").select("amount, artist_share, platform, status"),
    supabase
      .from("analytics_daily")
      .select("date, revenue")
      .order("date", { ascending: true })
      .limit(30),
  ]);

  const totalGross =
    royalties?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
  const totalArtistShare =
    royalties?.reduce((sum, r) => sum + Number(r.artist_share), 0) || 0;
  const platformShare = totalGross - totalArtistShare;
  const pendingPayouts =
    royalties
      ?.filter((r) => r.status === "pending")
      .reduce((sum, r) => sum + Number(r.artist_share), 0) || 0;

  const platformBreakdown = royalties?.reduce(
    (acc, r) => {
      acc[r.platform] = (acc[r.platform] || 0) + Number(r.amount);
      return acc;
    },
    {} as Record<string, number>
  );

  const revenueByDate = analytics?.reduce(
    (acc, a) => {
      const existing = acc.find((d) => d.date === a.date);
      if (existing) {
        existing.value += Number(a.revenue);
      } else {
        acc.push({ date: a.date, value: Number(a.revenue) });
      }
      return acc;
    },
    [] as { date: string; value: number }[]
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Revenue
        </h1>
        <p className="text-muted-foreground mt-1">
          Platform revenue overview and breakdowns.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Gross Revenue"
          value={formatCurrency(totalGross)}
          icon={DollarSign}
        />
        <StatsCard
          title="Artist Payouts"
          value={formatCurrency(totalArtistShare)}
          icon={Users}
        />
        <StatsCard
          title="Platform Share"
          value={formatCurrency(platformShare)}
          icon={TrendingUp}
        />
        <StatsCard
          title="Pending Payouts"
          value={formatCurrency(pendingPayouts)}
          icon={Music}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart data={revenueByDate || []} />

        <Card glass>
          <CardHeader>
            <CardTitle className="text-base">Revenue by Platform</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {platformBreakdown &&
              Object.entries(platformBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([platform, amount]) => (
                  <div
                    key={platform}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-muted-foreground">
                      {platform}
                    </span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                ))}
            {(!platformBreakdown ||
              Object.keys(platformBreakdown).length === 0) && (
              <p className="text-sm text-muted-foreground">No revenue data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

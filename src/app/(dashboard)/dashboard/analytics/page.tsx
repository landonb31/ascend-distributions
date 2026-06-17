import { createClient } from "@/lib/supabase/server";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: analytics } = await supabase
    .from("analytics_daily")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track streams, revenue, and audience insights across platforms.
        </p>
      </div>

      <AnalyticsDashboard analytics={analytics || []} />
    </div>
  );
}

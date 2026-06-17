import { createClient } from "@/lib/supabase/server";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Users, Disc3, DollarSign } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Admin — Reports" };

export default async function AdminReportsPage() {
  const supabase = await createClient();

  const [
    { count: userCount },
    { count: releaseCount },
    { count: liveCount },
    { data: royalties },
    { data: payouts },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("releases").select("*", { count: "exact", head: true }),
    supabase
      .from("releases")
      .select("*", { count: "exact", head: true })
      .eq("status", "live"),
    supabase.from("royalties").select("amount, streams, platform"),
    supabase.from("payouts").select("amount, status"),
  ]);

  const totalRevenue =
    royalties?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
  const totalStreams =
    royalties?.reduce((sum, r) => sum + Number(r.streams), 0) || 0;
  const totalPaidOut =
    payouts
      ?.filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  const reports = [
    {
      title: "User Growth Report",
      description: "Total registered users and sign-up trends.",
      icon: Users,
      stats: `${formatNumber(userCount || 0)} total users`,
    },
    {
      title: "Release Distribution Report",
      description: "Release counts by status and distribution metrics.",
      icon: Disc3,
      stats: `${formatNumber(liveCount || 0)} live of ${formatNumber(releaseCount || 0)} total`,
    },
    {
      title: "Revenue Summary Report",
      description: "Gross revenue, platform share, and artist payouts.",
      icon: DollarSign,
      stats: `${formatCurrency(totalRevenue)} gross · ${formatCurrency(totalPaidOut)} paid out`,
    },
    {
      title: "Streaming Analytics Report",
      description: "Total streams across all platforms and territories.",
      icon: FileText,
      stats: `${formatNumber(totalStreams)} total streams`,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Reports
        </h1>
        <p className="text-muted-foreground mt-1">
          Platform reports and data exports.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <Card glass key={report.title} className="glass-hover">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                  <report.icon className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium mb-4">{report.stats}</p>
              <Button variant="outline" size="sm" disabled>
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card glass>
        <CardHeader>
          <CardTitle className="text-base">Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/revenue">Revenue Dashboard</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/payouts">Payout Management</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/subscriptions">Subscription Data</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/users">User Directory</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

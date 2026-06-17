import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Wallet, Clock, CheckCircle } from "lucide-react";

export const metadata = { title: "Admin — Payouts" };

export default async function AdminPayoutsPage() {
  const supabase = await createClient();

  const { data: payouts } = await supabase
    .from("payouts")
    .select("*")
    .order("created_at", { ascending: false });

  const userIds = [...new Set((payouts || []).map((p) => p.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, display_name")
    .in("user_id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);

  const profileMap = new Map(profiles?.map((p) => [p.user_id, p.display_name]) || []);

  const pending =
    payouts?.filter((p) => p.status === "pending" || p.status === "processing") ||
    [];
  const totalPending = pending.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPaid =
    payouts
      ?.filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Payouts
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and manage artist payout requests.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          title="Pending Payouts"
          value={formatCurrency(totalPending)}
          icon={Clock}
        />
        <StatsCard
          title="Total Paid Out"
          value={formatCurrency(totalPaid)}
          icon={CheckCircle}
        />
        <StatsCard
          title="Pending Requests"
          value={String(pending.length)}
          icon={Wallet}
        />
      </div>

      <Card glass>
        <CardHeader>
          <CardTitle className="text-base">All Payout Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Artist</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 pr-4 font-medium">Method</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Requested</th>
                </tr>
              </thead>
              <tbody>
                {payouts?.map((payout) => (
                  <tr
                    key={payout.id}
                    className="border-b border-white/5 hover:bg-white/[0.02]"
                  >
                    <td className="py-3 pr-4 font-medium">
                      {profileMap.get(payout.user_id) || payout.user_id.slice(0, 8)}
                    </td>
                    <td className="py-3 pr-4">
                      {formatCurrency(Number(payout.amount))}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground capitalize">
                      {payout.method.replace("_", " ")}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge className={cn(getStatusColor(payout.status))}>
                        {getStatusLabel(payout.status)}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDate(payout.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!payouts || payouts.length === 0) && (
              <p className="py-8 text-center text-muted-foreground">
                No payout requests yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

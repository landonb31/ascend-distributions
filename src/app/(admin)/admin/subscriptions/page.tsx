import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/stripe/plans";

export const metadata = { title: "Admin — Subscriptions" };

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient();

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  const userIds = subscriptions?.map((s) => s.user_id) || [];
  const { data: users } = await supabase
    .from("users")
    .select("id, email")
    .in("id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);

  const emailMap = new Map(users?.map((u) => [u.id, u.email]) || []);

  const activePaid =
    subscriptions?.filter((s) => s.status === "active" && s.plan !== "free") ||
    [];

  const mrr = activePaid.reduce((sum, s) => {
    const plan = PLANS[s.plan as keyof typeof PLANS];
    return sum + (plan?.monthlyPrice || 0);
  }, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Subscriptions
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage subscription plans and billing status.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card glass>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Active Paid</p>
            <p className="text-2xl font-bold mt-1">{activePaid.length}</p>
          </CardContent>
        </Card>
        <Card glass>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Est. MRR</p>
            <p className="text-2xl font-bold mt-1">${mrr}/mo</p>
          </CardContent>
        </Card>
        <Card glass>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Accounts</p>
            <p className="text-2xl font-bold mt-1">{subscriptions?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card glass>
        <CardHeader>
          <CardTitle className="text-base">All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">User</th>
                  <th className="pb-3 pr-4 font-medium">Plan</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Period End</th>
                  <th className="pb-3 font-medium">Cancel at End</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions?.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-white/5 hover:bg-white/[0.02]"
                  >
                    <td className="py-3 pr-4 text-muted-foreground">
                      {emailMap.get(sub.user_id) || sub.user_id.slice(0, 8)}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="outline">{sub.plan}</Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        variant={
                          sub.status === "active"
                            ? "success"
                            : sub.status === "past_due"
                              ? "warning"
                              : "secondary"
                        }
                      >
                        {sub.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {sub.current_period_end
                        ? formatDate(sub.current_period_end)
                        : "—"}
                    </td>
                    <td className="py-3">
                      {sub.cancel_at_period_end ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!subscriptions || subscriptions.length === 0) && (
              <p className="py-8 text-center text-muted-foreground">
                No subscriptions found.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

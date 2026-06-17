import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Admin — Users" };

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("users")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: false });

  const userIds = users?.map((u) => u.id) || [];

  const [{ data: profiles }, { data: subscriptions }] = await Promise.all([
    supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]),
    supabase
      .from("subscriptions")
      .select("user_id, plan, status")
      .in("user_id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]),
  ]);

  const profileMap = new Map(profiles?.map((p) => [p.user_id, p.display_name]) || []);
  const subMap = new Map(
    subscriptions?.map((s) => [s.user_id, { plan: s.plan, status: s.status }]) || []
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Users</h1>
        <p className="text-muted-foreground mt-1">
          Manage platform users and roles.
        </p>
      </div>

      <Card glass>
        <CardHeader>
          <CardTitle className="text-base">
            All Users ({users?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Name</th>
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 pr-4 font-medium">Role</th>
                  <th className="pb-3 pr-4 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user) => {
                  const subscription = subMap.get(user.id);

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-white/5 hover:bg-white/[0.02]"
                    >
                      <td className="py-3 pr-4 font-medium">
                        {profileMap.get(user.id) || "—"}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={user.role === "admin" ? "destructive" : "secondary"}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline">
                          {subscription?.plan || "free"}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {(!users || users.length === 0) && (
              <p className="py-8 text-center text-muted-foreground">No users found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { PayoutForm } from "@/components/dashboard/payout-form";

export const metadata = { title: "Payouts" };

export default async function PayoutsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: royalties }, { data: payouts }] = await Promise.all([
    supabase
      .from("royalties")
      .select("artist_share, status")
      .eq("user_id", user.id)
      .eq("status", "pending"),
    supabase
      .from("payouts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const pendingRoyalties =
    royalties?.reduce((sum, r) => sum + Number(r.artist_share), 0) || 0;

  const pendingPayouts =
    payouts
      ?.filter((p) => p.status === "pending" || p.status === "processing")
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  const availableBalance = Math.max(0, pendingRoyalties - pendingPayouts);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Payouts</h1>
        <p className="text-muted-foreground mt-1">
          Request withdrawals via PayPal or bank transfer. Minimum payout is $1.
        </p>
      </div>

      <PayoutForm availableBalance={availableBalance} payouts={payouts || []} />
    </div>
  );
}

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { SettingsPanel } from "@/components/dashboard/settings-panel";
import { SettingsCheckoutNotice } from "@/components/dashboard/settings-checkout-notice";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription plan and billing preferences.
        </p>
      </div>

      <SettingsCheckoutNotice />
      <SettingsPanel subscription={subscription} />
    </div>
  );
}

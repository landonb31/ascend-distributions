import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { SupabaseSetupNotice } from "@/components/auth/supabase-setup-notice";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return <SupabaseSetupNotice title="Dashboard requires Supabase" />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("user_id", user.id)
    .single();

  const displayName = profile?.display_name || user.email?.split("@")[0] || "Artist";

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 noise opacity-50" />
      <div className="pointer-events-none fixed top-0 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-ascend-purple/8 blur-[120px] animate-aurora" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-ascend-blue/8 blur-[100px] animate-aurora" />
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-20" />

      <DashboardSidebar
        user={{
          displayName,
          avatarUrl: profile?.avatar_url,
          email: user.email || "",
        }}
      />
      <div className="relative lg:pl-64">
        <DashboardHeader displayName={displayName} />
        <div className="pt-14 lg:pt-0">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

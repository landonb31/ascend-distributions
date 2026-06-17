import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { SupabaseSetupNotice } from "@/components/auth/supabase-setup-notice";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return <SupabaseSetupNotice title="Community requires Supabase" />;
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

  return (
    <div className="min-h-screen bg-black">
      <DashboardSidebar
        user={{
          displayName: profile?.display_name || user.email?.split("@")[0] || "Artist",
          avatarUrl: profile?.avatar_url,
          email: user.email || "",
        }}
      />
      <div className="lg:pl-64">
        <div className="pt-14 lg:pt-0">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

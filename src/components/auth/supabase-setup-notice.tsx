import Link from "next/link";
import { ExternalLink, KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

interface SupabaseSetupNoticeProps {
  title?: string;
  description?: string;
}

export function SupabaseSetupNotice({
  title = "Authentication not configured",
  description = "Add your Supabase credentials to enable sign up, login, and the artist dashboard.",
}: SupabaseSetupNoticeProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card glass className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Logo size={48} className="mx-auto mb-4" />
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ascend-purple/10">
            <KeyRound className="h-6 w-6 text-ascend-purple" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 font-mono text-xs text-muted-foreground space-y-1">
            <p>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</p>
            <p>SUPABASE_SERVICE_ROLE_KEY=your-service-role-key</p>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Add these to <code className="text-foreground">.env.local</code> and restart the dev server.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
            <Button className="flex-1" asChild>
              <a
                href="https://supabase.com/dashboard/project/_/settings/api"
                target="_blank"
                rel="noopener noreferrer"
              >
                Supabase API Settings
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

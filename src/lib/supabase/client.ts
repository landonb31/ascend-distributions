import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types";
import { getSupabaseConfig } from "./config";

export function createClient() {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
    );
  }

  return createBrowserClient<Database>(config.url, config.anonKey);
}

export { isSupabaseConfigured } from "./config";

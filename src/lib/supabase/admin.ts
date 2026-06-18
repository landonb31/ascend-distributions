import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types";
import { getSupabaseConfig } from "./config";

export function createAdminClient() {
  const config = getSupabaseConfig();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!config || !serviceKey) {
    throw new Error(
      "Supabase service role is not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local"
    );
  }

  return createClient<Database>(config.url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

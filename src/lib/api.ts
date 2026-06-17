import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/types";

type Supabase = SupabaseClient<Database>;

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export async function getAuthContext(): Promise<
  { supabase: Supabase; user: User } | { error: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: apiError("Unauthorized", 401) };
  }

  return { supabase, user };
}

export async function requireAdmin(): Promise<
  { supabase: Supabase; user: User } | { error: NextResponse }
> {
  const auth = await getAuthContext();
  if ("error" in auth) return auth;

  const { data: userData } = await auth.supabase
    .from("users")
    .select("role")
    .eq("id", auth.user.id)
    .single();

  if (userData?.role !== "admin") {
    return { error: apiError("Forbidden", 403) };
  }

  return auth;
}

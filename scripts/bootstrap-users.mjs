#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const ENV_PATH = path.join(process.cwd(), ".env.local");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    process.env[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim();
  }
}

loadEnvFile(ENV_PATH);

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (error) {
  console.error("Could not list users:", error.message);
  process.exit(1);
}

for (const user of data.users) {
  const displayName =
    user.user_metadata?.display_name || user.email?.split("@")[0] || "Artist";
  const artistName =
    user.user_metadata?.artist_name || user.email?.split("@")[0] || "Artist";

  const { error: userError } = await admin.from("users").upsert(
    {
      id: user.id,
      email: user.email || "",
      role: user.user_metadata?.role || "artist",
    },
    { onConflict: "id" }
  );
  if (userError) console.warn("users", user.email, userError.message);
  else console.log("users ok", user.email);

  const { error: profileError } = await admin.from("profiles").upsert(
    { user_id: user.id, display_name: displayName },
    { onConflict: "user_id" }
  );
  if (profileError) console.warn("profiles", user.email, profileError.message);

  const { error: artistError } = await admin.from("artists").upsert(
    { user_id: user.id, artist_name: artistName },
    { onConflict: "user_id" }
  );
  if (artistError) console.warn("artists", user.email, artistError.message);

  const { error: subError } = await admin.from("subscriptions").upsert(
    { user_id: user.id, plan: "free", status: "active" },
    { onConflict: "user_id" }
  );
  if (subError) console.warn("subscriptions", user.email, subError.message);
  else console.log("subscriptions ok", user.email);
}

console.log("\nBootstrap complete.");

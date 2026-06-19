#!/usr/bin/env node

import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env.local");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (value && !process.env[key]) process.env[key] = value;
  }
}

function run(script) {
  const result = spawnSync("node", [path.join("scripts", script)], {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

loadEnvFile(ENV_PATH);

console.log("Ascend Distributions setup\n");

if (!process.env.STRIPE_SECRET_KEY) {
  console.log("⚠️  STRIPE_SECRET_KEY missing — add Stripe keys to .env.local first.");
} else if (!process.env.STRIPE_PRICE_STANDARD_MONTHLY) {
  console.log("→ Creating Stripe products and prices...");
  run("setup-stripe.mjs");
} else {
  console.log("✓ Stripe price IDs already configured");
}

if (!process.env.DATABASE_URL) {
  console.log("\n⚠️  DATABASE_URL missing — database tables not created yet.");
  console.log("   1. Open Supabase → Project Settings → Database");
  console.log("   2. Copy the Connection string (URI)");
  console.log("   3. Add DATABASE_URL=... to .env.local");
  console.log("   4. Run: npm run setup:db && npm run setup:bootstrap");
  console.log("\n   Or paste supabase/setup-all.sql into the Supabase SQL Editor and run it.");
  console.log("   Then run: npm run setup:bootstrap");
  process.exit(0);
}

console.log("\n→ Running database migrations...");
run("run-migrations.mjs");

console.log("\n→ Backfilling existing auth users...");
run("bootstrap-users.mjs");

console.log("\n✓ Setup complete.");

/**
 * Run Supabase migrations using DATABASE_URL from .env.local
 * Usage: DATABASE_URL=postgresql://... node scripts/run-migrations.mjs
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvLocal() {
  try {
    const env = readFileSync(join(root, ".env.local"), "utf8");
    for (const line of env.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      const value = trimmed.slice(eq + 1);
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // ignore
  }
}

loadEnvLocal();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required in .env.local");
  console.error("Get it from Supabase Dashboard → Connect → ORM → URI");
  process.exit(1);
}

const migrations = [
  "supabase/migrations/001_initial_schema.sql",
  "supabase/migrations/002_storage_policies.sql",
];

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log("Connected to database");

  for (const file of migrations) {
    const sql = readFileSync(join(root, file), "utf8");
    console.log(`Running ${file}...`);
    await client.query(sql);
    console.log(`✓ ${file}`);
  }

  console.log("All migrations completed successfully");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exit(1);
} finally {
  await client.end();
}

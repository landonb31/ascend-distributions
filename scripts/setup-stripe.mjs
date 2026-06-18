#!/usr/bin/env node

import fs from "fs";
import path from "path";
import Stripe from "stripe";

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
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function upsertEnvValue(filePath, key, value) {
  const line = `${key}=${value}`;
  let contents = "";

  if (fs.existsSync(filePath)) {
    contents = fs.readFileSync(filePath, "utf8");
    const pattern = new RegExp(`^${key}=.*$`, "m");
    if (pattern.test(contents)) {
      contents = contents.replace(pattern, line);
    } else {
      contents = `${contents.trimEnd()}\n${line}\n`;
    }
  } else {
    contents = `${line}\n`;
  }

  fs.writeFileSync(filePath, contents.endsWith("\n") ? contents : `${contents}\n`);
}

const PLAN_DEFINITIONS = [
  {
    key: "standard",
    name: "Ascend Distributions — Standard",
    description: "90/10 royalty split, release scheduling, and advanced analytics.",
    monthlyAmount: 500,
    yearlyAmount: 2000,
    monthlyLookup: "ascend_standard_monthly",
    yearlyLookup: "ascend_standard_yearly",
    envMonthly: "STRIPE_PRICE_STANDARD_MONTHLY",
    envYearly: "STRIPE_PRICE_STANDARD_YEARLY",
  },
  {
    key: "pro",
    name: "Ascend Distributions — Pro",
    description: "Keep 100% of royalties with priority support and team accounts.",
    monthlyAmount: 1000,
    yearlyAmount: 7000,
    monthlyLookup: "ascend_pro_monthly",
    yearlyLookup: "ascend_pro_yearly",
    envMonthly: "STRIPE_PRICE_PRO_MONTHLY",
    envYearly: "STRIPE_PRICE_PRO_YEARLY",
  },
];

async function findOrCreateProduct(stripe, definition) {
  const existing = await stripe.products.search({
    query: `metadata['ascend_plan']:'${definition.key}'`,
    limit: 1,
  });

  if (existing.data[0]) {
    return existing.data[0];
  }

  return stripe.products.create({
    name: definition.name,
    description: definition.description,
    metadata: {
      ascend_plan: definition.key,
      app: "ascend-distributions",
    },
  });
}

async function findOrCreatePrice(stripe, productId, amount, interval, lookupKey) {
  const existing = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
  });

  const match = existing.data.find(
    (price) =>
      price.lookup_key === lookupKey ||
      (price.recurring?.interval === interval &&
        price.unit_amount === amount &&
        price.currency === "usd")
  );

  if (match) {
    if (!match.lookup_key) {
      return stripe.prices.update(match.id, { lookup_key: lookupKey });
    }
    return match;
  }

  return stripe.prices.create({
    product: productId,
    currency: "usd",
    unit_amount: amount,
    lookup_key: lookupKey,
    recurring: { interval },
    metadata: {
      app: "ascend-distributions",
      lookup_key: lookupKey,
    },
  });
}

async function main() {
  loadEnvFile(ENV_PATH);

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("Missing STRIPE_SECRET_KEY. Add it to .env.local first.");
    process.exit(1);
  }

  const stripe = new Stripe(secretKey);
  const envUpdates = {};

  console.log("Setting up Ascend Distributions Stripe products and prices...\n");

  for (const definition of PLAN_DEFINITIONS) {
    const product = await findOrCreateProduct(stripe, definition);
    const monthlyPrice = await findOrCreatePrice(
      stripe,
      product.id,
      definition.monthlyAmount,
      "month",
      definition.monthlyLookup
    );
    const yearlyPrice = await findOrCreatePrice(
      stripe,
      product.id,
      definition.yearlyAmount,
      "year",
      definition.yearlyLookup
    );

    envUpdates[definition.envMonthly] = monthlyPrice.id;
    envUpdates[definition.envYearly] = yearlyPrice.id;

    console.log(`${definition.name}`);
    console.log(`  Product: ${product.id}`);
    console.log(`  Monthly: ${monthlyPrice.id} ($${definition.monthlyAmount / 100}/mo)`);
    console.log(`  Yearly:  ${yearlyPrice.id} ($${definition.yearlyAmount / 100}/yr)\n`);
  }

  for (const [key, value] of Object.entries(envUpdates)) {
    upsertEnvValue(ENV_PATH, key, value);
  }

  console.log("Updated .env.local with Stripe price IDs.");
  console.log("\nNext steps:");
  console.log("1. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local");
  console.log("2. Create a webhook endpoint in Stripe:");
  console.log("   https://ascenddistributions.com/api/stripe/webhook");
  console.log("3. Listen for:");
  console.log("   checkout.session.completed");
  console.log("   customer.subscription.updated");
  console.log("   customer.subscription.deleted");
  console.log("   invoice.payment_failed");
  console.log("4. Copy the webhook signing secret to STRIPE_WEBHOOK_SECRET");
  console.log("5. Enable the Stripe Customer Portal in Stripe Dashboard → Settings → Billing");
}

main().catch((error) => {
  console.error("Stripe setup failed:", error.message);
  process.exit(1);
});

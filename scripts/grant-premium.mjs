#!/usr/bin/env node
/**
 * Grant premium status to a user by email.
 * Dry-run by default. Pass --execute to actually update.
 *
 * Usage:
 *   node scripts/grant-premium.mjs rorounifix@gmail.com
 *   node scripts/grant-premium.mjs rorounifix@gmail.com --execute
 *   node scripts/grant-premium.mjs rorounifix@gmail.com --execute --plan monthly --expires-at 2027-07-28T00:00:00Z --reason "Support override"
 */

import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2];
const execute = process.argv.includes("--execute");
const planArg = process.argv.find((arg, i) => i > 2 && arg === "--plan" && process.argv[i + 1]) ? process.argv[process.argv.indexOf("--plan") + 1] : null;
const expiresArg = process.argv.find((arg, i) => i > 2 && arg === "--expires-at" && process.argv[i + 1]) ? process.argv[process.argv.indexOf("--expires-at") + 1] : null;
const reasonArg = process.argv.find((arg, i) => i > 2 && arg === "--reason" && process.argv[i + 1]) ? process.argv[process.argv.indexOf("--reason") + 1] : "Manual admin grant";

if (!email) {
  console.error("Usage: node scripts/grant-premium.mjs <email> [--execute] [--plan monthly|yearly] [--expires-at ISO] [--reason \"note\"]");
  process.exit(1);
}

const plan = planArg === "yearly" ? "yearly" : "monthly";
const productId = plan === "yearly" ? "yearly" : "monthly";

// Default expiration: 1 year from now, aligned to start of day UTC
const defaultExpiresAt = new Date();
defaultExpiresAt.setUTCFullYear(defaultExpiresAt.getUTCFullYear() + 1);
defaultExpiresAt.setUTCHours(23, 59, 59, 999);
const expiresAt = expiresArg ? new Date(expiresArg) : defaultExpiresAt;

if (Number.isNaN(expiresAt.getTime())) {
  console.error(`Invalid --expires-at value: ${expiresArg}`);
  process.exit(1);
}

const expiresAtIso = expiresAt.toISOString();

function loadEnvFile(path = ".env") {
  if (!fs.existsSync(path)) return;
  const text = fs.readFileSync(path, "utf-8");
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const now = new Date().toISOString();
  console.log(`[${now}] ${execute ? "EXECUTE" : "DRY RUN"}: granting premium to ${email}`);
  console.log(`  plan: ${plan}`);
  console.log(`  premium_expires_at: ${expiresAtIso}`);
  console.log(`  reason: ${reasonArg}`);

  // Resolve user by email
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Failed to list users:", listError.message);
    process.exit(1);
  }

  const users = usersData?.users ?? [];
  const user = users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  console.log(`Resolved user id: ${user.id}`);

  // Read current profile
  const { data: profileRows, error: readError } = await supabase
    .from("profiles")
    .select("id, is_premium, premium_expires_at, subscription_status, subscription_plan, verification_status, full_name")
    .eq("id", user.id);

  if (readError) {
    console.error("Failed to read profile:", readError.message);
    process.exit(1);
  }

  const current = profileRows?.[0] ?? null;
  console.log("\nCurrent profile state:");
  console.log(JSON.stringify(current, null, 2));

  console.log("\nProposed profile update:");
  console.log(JSON.stringify({
    is_premium: true,
    subscription_status: "active",
    subscription_plan: productId,
    premium_expires_at: expiresAtIso,
  }, null, 2));

  if (!execute) {
    console.log("\nDry run complete. Pass --execute to apply the update.");
    return;
  }

  // Update profile
  const { data: updatedRows, error: updateError } = await supabase
    .from("profiles")
    .update({
      is_premium: true,
      subscription_status: "active",
      subscription_plan: productId,
      premium_expires_at: expiresAtIso,
    })
    .eq("id", user.id)
    .select("id, is_premium, premium_expires_at, subscription_status, subscription_plan");

  if (updateError) {
    console.error("Failed to update profile:", updateError.message);
    process.exit(1);
  }

  console.log("\nUpdated profile:");
  console.log(JSON.stringify(updatedRows?.[0], null, 2));

  // Insert audit event
  const { error: eventError } = await supabase.from("subscription_events").insert({
    user_id: user.id,
    event_type: "ADMIN_GRANT",
    product_id: productId,
    entitlement_ids: ["Switch My Home Pro"],
    is_premium: true,
    subscription_status: "active",
    premium_expires_at: expiresAtIso,
    environment: "PRODUCTION",
    store: "ADMIN",
    price: 0,
    currency: "USD",
    raw_event: {
      granted_at: now,
      granted_by: process.env.USER || "unknown",
      reason: reasonArg,
      expires_at: expiresAtIso,
    },
  });

  if (eventError) {
    console.error("Profile updated, but failed to insert subscription_events audit row:", eventError.message);
    process.exit(1);
  }

  console.log(`\nPremium granted to ${email} until ${expiresAtIso}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

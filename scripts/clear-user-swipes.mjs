#!/usr/bin/env node
/**
 * Clear swipes for a given user email.
 * Dry-run by default. Pass --execute to actually delete.
 * Usage:
 *   node scripts/clear-user-swipes.mjs rorounifix@gmail.com
 *   node scripts/clear-user-swipes.mjs rorounifix@gmail.com --execute
 */

import { createClient } from "@supabase/supabase-js";

const email = process.argv[2];
const execute = process.argv.includes("--execute");

if (!email) {
  console.error("Usage: node scripts/clear-user-swipes.mjs <email> [--execute]");
  process.exit(1);
}

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
  console.log(`[${now}] ${execute ? "EXECUTE" : "DRY RUN"}: clearing swipes for ${email}`);

  // Resolve user ID by email
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Failed to list users:", listError.message);
    process.exit(1);
  }

  const user = users.users.find((u) => u.email === email);
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  console.log(`Resolved user id: ${user.id}`);

  // Count swipes before delete
  const { data: swipes, error: countError } = await supabase
    .from("swipes")
    .select("id, swiped_property_id, direction, created_at")
    .eq("swiper_id", user.id);

  if (countError) {
    console.error("Failed to fetch swipes:", countError.message);
    process.exit(1);
  }

  console.log(`Found ${swipes.length} swipe(s)`);

  if (swipes.length === 0) {
    console.log("Nothing to delete.");
    return;
  }

  for (const s of swipes.slice(0, 10)) {
    console.log(`  - ${s.id} | property=${s.swiped_property_id} | ${s.direction} | ${s.created_at}`);
  }
  if (swipes.length > 10) {
    console.log(`  ... and ${swipes.length - 10} more`);
  }

  if (!execute) {
    console.log("\nDry run complete. Pass --execute to delete these swipes.");
    return;
  }

  const { error: deleteError } = await supabase
    .from("swipes")
    .delete()
    .eq("swiper_id", user.id);

  if (deleteError) {
    console.error("Failed to delete swipes:", deleteError.message);
    process.exit(1);
  }

  console.log(`Deleted ${swipes.length} swipe(s) for ${email}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ALLOWED_FLOWS = new Set([
  'buymeacoffee',
  'kofi',
  'external',
  'stripe',
  'stripe-hosted',
  'shopify',
  'paypal-invoice',
  'paypal-unclaimed',
  'paypal-direct',
  'paypal-api',
]);

function usage() {
  console.log(`
Usage:
  node scripts/update-checkout-flow.mjs --from stripe --to stripe-hosted --dry-run
  node scripts/update-checkout-flow.mjs --slug product-slug --to paypal-api
  node scripts/update-checkout-flow.mjs --file slugs.txt --to stripe-hosted

Options:
  --from <flow>       Current checkout_flow to match.
  --to <flow>         New checkout_flow. Required.
  --slug <slug>       Product slug. Can be repeated.
  --file <path>       Newline/comma separated slug list.
  --dry-run           Print targets without updating.
`);
}

function parseArgs(args) {
  const options = { from: null, to: null, slugs: [], file: null, dryRun: false };
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--from') options.from = args[++index];
    else if (arg === '--to') options.to = args[++index];
    else if (arg === '--slug') options.slugs.push(args[++index]);
    else if (arg === '--file') options.file = args[++index];
    else if (arg === '--dry-run') options.dryRun = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  return options;
}

const options = parseArgs(process.argv.slice(2));
if (!options.to || !ALLOWED_FLOWS.has(options.to) || (options.from && !ALLOWED_FLOWS.has(options.from))) {
  usage();
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const db = createClient(supabaseUrl, supabaseKey);

async function readSlugFile(filePath) {
  if (!filePath) return [];
  const body = await fs.readFile(path.resolve(process.cwd(), filePath), 'utf8');
  return body
    .split(/[\r\n,]+/)
    .map((slug) => slug.trim().toLowerCase())
    .filter(Boolean);
}

async function fetchTargets() {
  const fileSlugs = await readSlugFile(options.file);
  const slugs = [...new Set([...options.slugs, ...fileSlugs].map((slug) => slug?.trim().toLowerCase()).filter(Boolean))];
  const rows = [];

  if (slugs.length > 0) {
    for (let index = 0; index < slugs.length; index += 100) {
      const batch = slugs.slice(index, index + 100);
      let query = db.from('products').select('id,slug,title,checkout_flow').in('slug', batch);
      if (options.from) query = query.eq('checkout_flow', options.from);
      const { data, error } = await query;
      if (error) throw error;
      rows.push(...(data || []));
    }
    return rows;
  }

  if (!options.from) {
    console.error('Provide --from when no --slug or --file is supplied.');
    process.exit(1);
  }

  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from('products')
      .select('id,slug,title,checkout_flow')
      .eq('checkout_flow', options.from)
      .order('created_at')
      .range(from, from + 999);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < 1000) break;
  }

  return rows;
}

const targets = await fetchTargets();
console.log(`${options.dryRun ? 'Would update' : 'Updating'} ${targets.length} product(s) to checkout_flow=${options.to}`);

let updated = 0;
let failed = 0;
for (const product of targets) {
  if (options.dryRun) {
    console.log(`- ${product.slug} | ${product.checkout_flow} -> ${options.to} | ${product.title}`);
    continue;
  }

  const { error } = await db
    .from('products')
    .update({ checkout_flow: options.to, updated_at: new Date().toISOString() })
    .eq('id', product.id);

  if (error) {
    failed++;
    console.error(`Failed ${product.slug}: ${error.message}`);
  } else {
    updated++;
    console.log(`Updated ${product.slug}`);
  }
}

console.log(JSON.stringify({ targeted: targets.length, updated, failed, to: options.to, dryRun: options.dryRun }, null, 2));

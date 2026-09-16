#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const [command, ...rawArgs] = process.argv.slice(2);
const enabled = command === 'enable' ? true : command === 'disable' ? false : null;

function usage() {
  console.log(`
Usage:
  node scripts/catalog-gmc.mjs enable --slug product-slug
  node scripts/catalog-gmc.mjs disable --file slugs.txt
  node scripts/catalog-gmc.mjs enable --category "Lawn Mowers"
  node scripts/catalog-gmc.mjs disable --all --dry-run

Options:
  --slug <slug>       Product slug. Can be repeated.
  --file <path>       Newline/comma separated slug list.
  --category <name>   Match products by category.
  --all               Apply to all products.
  --dry-run           Print targets without updating.
`);
}

function parseArgs(args) {
  const options = { slugs: [], file: null, category: null, all: false, dryRun: false };
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--slug') options.slugs.push(args[++index]);
    else if (arg === '--file') options.file = args[++index];
    else if (arg === '--category') options.category = args[++index];
    else if (arg === '--all') options.all = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  return options;
}

if (enabled === null) {
  usage();
  process.exit(command ? 1 : 0);
}

const options = parseArgs(rawArgs);
if (!options.all && !options.category && options.slugs.length === 0 && !options.file) {
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
      const { data, error } = await db.from('products').select('id,slug,title,category,meta').in('slug', batch);
      if (error) throw error;
      rows.push(...(data || []));
    }
  }

  if (options.category || options.all) {
    for (let from = 0; ; from += 1000) {
      let query = db.from('products').select('id,slug,title,category,meta').order('created_at').range(from, from + 999);
      if (options.category) query = query.ilike('category', options.category);
      const { data, error } = await query;
      if (error) throw error;
      rows.push(...(data || []));
      if (!data || data.length < 1000) break;
    }
  }

  return [...new Map(rows.map((row) => [row.slug, row])).values()];
}

const targets = await fetchTargets();
console.log(`${options.dryRun ? 'Would update' : 'Updating'} ${targets.length} product(s): gmc_enabled=${enabled}`);

let updated = 0;
let failed = 0;
for (const product of targets) {
  const meta = { ...(product.meta || {}), gmc_enabled: enabled };
  if (options.dryRun) {
    console.log(`- ${product.slug} | ${product.title}`);
    continue;
  }

  const { error } = await db.from('products').update({ meta, updated_at: new Date().toISOString() }).eq('id', product.id);
  if (error) {
    failed++;
    console.error(`Failed ${product.slug}: ${error.message}`);
  } else {
    updated++;
    console.log(`Updated ${product.slug}`);
  }
}

console.log(JSON.stringify({ targeted: targets.length, updated, failed, enabled, dryRun: options.dryRun }, null, 2));

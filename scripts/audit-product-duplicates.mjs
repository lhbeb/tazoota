#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const db = createClient(supabaseUrl, supabaseKey);
const fields = 'id,slug,title,description,price,images,brand,category,meta,in_stock,is_featured,published,created_at';

const normalize = (value) =>
  String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[×]/g, 'x')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const normalizeUrl = (value) => {
  if (!value) return '';
  try {
    const url = new URL(value);
    return `${url.hostname.replace(/^www\./, '')}${url.pathname.replace(/\/+$/, '')}`.toLowerCase();
  } catch {
    return String(value).trim().toLowerCase();
  }
};

const compactDescription = (value) =>
  normalize(value)
    .replace(/\bshipping free standard across all 50 u s states[\s\S]*$/, '')
    .trim();

const groupBy = (items, keyFn) => {
  const groups = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups.entries()].filter(([, rows]) => rows.length > 1);
};

const summary = (product) => ({
  id: product.id,
  slug: product.slug,
  title: product.title,
  price: product.price,
  brand: product.brand,
  category: product.category,
  source: product.meta?.source || null,
  sourceSku: product.meta?.source_sku || null,
  sourceUrl: product.meta?.source_url || null,
  primaryImage: product.images?.[0] || null,
});

const serializeGroups = (groups) =>
  groups.map(([key, rows]) => ({ key, count: rows.length, products: rows.map(summary) }));

const products = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await db.from('products').select(fields).order('created_at').range(from, from + 999);
  if (error) throw error;
  products.push(...(data || []));
  if (!data || data.length < 1000) break;
}

const duplicateSlugs = groupBy(products, (product) => normalize(product.slug));
const duplicateExactTitles = groupBy(products, (product) => String(product.title || '').trim().toLowerCase());
const duplicateNormalizedTitles = groupBy(products, (product) => normalize(product.title));
const duplicateSourceUrls = groupBy(products, (product) => normalizeUrl(product.meta?.source_url));
const duplicateSourceSkus = groupBy(products, (product) =>
  product.meta?.source_sku ? `${product.meta.source || 'source'}:${normalize(product.meta.source_sku)}` : '',
);
const duplicateDescriptions = groupBy(products, (product) => {
  const description = compactDescription(product.description);
  return description.length >= 100 ? description : '';
});
const duplicatePrimaryImages = groupBy(products, (product) => normalizeUrl(product.images?.[0]));

const parent = new Map(products.map((product) => [product.id, product.id]));
const find = (id) => (parent.get(id) === id ? id : (parent.set(id, find(parent.get(id))), parent.get(id)));
const union = (left, right) => {
  const a = find(left);
  const b = find(right);
  if (a !== b) parent.set(b, a);
};

for (const [, rows] of duplicateSourceUrls) {
  for (let index = 1; index < rows.length; index++) union(rows[0].id, rows[index].id);
}
for (const [, rows] of duplicateNormalizedTitles) {
  for (let left = 0; left < rows.length; left++) {
    for (let right = left + 1; right < rows.length; right++) {
      const sameDescription = compactDescription(rows[left].description) === compactDescription(rows[right].description);
      const sameImage = normalizeUrl(rows[left].images?.[0]) === normalizeUrl(rows[right].images?.[0]);
      if (sameDescription || sameImage) union(rows[left].id, rows[right].id);
    }
  }
}

const confirmedDuplicateGroups = groupBy(products, (product) => find(product.id)).map(([key, rows]) => ({
  key,
  count: rows.length,
  products: rows.map(summary),
  evidence: [
    new Set(rows.map((row) => normalizeUrl(row.meta?.source_url))).size === 1 ? 'same source URL' : null,
    new Set(rows.map((row) => normalize(row.title))).size === 1 ? 'same normalized title' : null,
    new Set(rows.map((row) => compactDescription(row.description))).size === 1 ? 'same description' : null,
    new Set(rows.map((row) => normalizeUrl(row.images?.[0]))).size === 1 ? 'same primary image' : null,
  ].filter(Boolean),
}));

const confirmedExtraRows = confirmedDuplicateGroups.reduce((count, group) => count + group.count - 1, 0);
const report = {
  generatedAt: new Date().toISOString(),
  catalog: {
    totalProducts: products.length,
    publishedByMeta: products.filter((product) => product.meta?.published !== false).length,
    gmcEnabled: products.filter((product) => product.meta?.gmc_enabled === true).length,
    inStock: products.filter((product) => product.in_stock !== false).length,
    categories: Object.fromEntries(
      [...new Set(products.map((product) => product.category || 'uncategorized'))]
        .sort()
        .map((category) => [category, products.filter((product) => (product.category || 'uncategorized') === category).length]),
    ),
  },
  conclusion: {
    confirmedDuplicateGroups: confirmedDuplicateGroups.length,
    confirmedDuplicateRowsBeyondFirst: confirmedExtraRows,
    estimatedUniqueProductsAfterConfirmedDeduplication: products.length - confirmedExtraRows,
  },
  checks: {
    duplicateSlugs: serializeGroups(duplicateSlugs),
    duplicateExactTitles: serializeGroups(duplicateExactTitles),
    duplicateNormalizedTitles: serializeGroups(duplicateNormalizedTitles),
    duplicateSourceUrls: serializeGroups(duplicateSourceUrls),
    duplicateSourceSkus: serializeGroups(duplicateSourceSkus),
    duplicateDescriptions: serializeGroups(duplicateDescriptions),
    duplicatePrimaryImages: serializeGroups(duplicatePrimaryImages),
    confirmedDuplicateGroups,
  },
};

const outputDir = path.resolve(process.cwd(), 'scratch', 'product-audits');
await fs.mkdir(outputDir, { recursive: true });
const date = new Date().toISOString().slice(0, 10);
const jsonPath = path.join(outputDir, `duplicate-audit-${date}.json`);
await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));

console.log(
  JSON.stringify(
    {
      ...report.catalog,
      ...report.conclusion,
      duplicateSlugGroups: duplicateSlugs.length,
      duplicateSourceUrlGroups: duplicateSourceUrls.length,
      duplicateSourceSkuGroups: duplicateSourceSkus.length,
      duplicateNormalizedTitleGroups: duplicateNormalizedTitles.length,
      duplicateDescriptionGroups: duplicateDescriptions.length,
      duplicatePrimaryImageGroups: duplicatePrimaryImages.length,
      report: jsonPath,
    },
    null,
    2,
  ),
);

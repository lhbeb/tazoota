#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const ROOT = process.cwd();
const ENV_FALLBACK = path.resolve(ROOT, '..', 'new env vars tazoota.txt');
dotenv.config({ path: path.join(ROOT, '.env.local'), quiet: true });
dotenv.config({ path: ENV_FALLBACK, quiet: true, override: false });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STORAGE_BUCKET = 'product-images';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36';
const SHOP_PAGES = [1, 2, 3, 4];
const OUTPUT_ROOT = path.join(ROOT, 'imports', 'aklart-popular');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const knownBrands = [
  'Westinghouse', 'Triumph', 'Lifetime', 'DR Power Equipment', 'EcoFlow', 'Guardian', 'Toro',
  'Husqvarna', 'Navien', 'Ford', 'BendPak', 'Cub Cadet', 'Craftsman', 'Ryobi', 'Yoshino',
  'EGO', 'STIHL', 'Troy-Bilt', 'DeWalt', 'Generac', 'Honda', 'Kawasaki', 'Briggs & Stratton',
  'Champion', 'DuroMax', 'Greenworks', 'Bad Boy', 'Gravely', 'DK2', 'Dolphin', 'Delonghi',
];

function decodeHtml(value = '') {
  return String(value)
    .replace(/\\\//g, '/')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#36;/g, '$')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)));
}

function stripTags(html = '') {
  return decodeHtml(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
}

function cleanText(value = '') {
  return stripTags(value)
    .replace(/Aklart/gi, 'Tazoota')
    .replace(/[✅🌱⚡🚚📦⛳]/g, '')
    .replace(/[™®]/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .replace(/[\uD800-\uDFFF]/g, '')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function slugify(value) {
  return decodeHtml(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 130);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`GET ${url} failed: ${response.status}`);
  return response.text();
}

function extractProductUrls(html) {
  const urls = [...html.matchAll(/https:\/\/aklart\.com\/product\/[^"'\s<>]+/g)].map((match) => decodeHtml(match[0]));
  return unique(urls.map((url) => url.replace(/[?#].*$/, '')));
}

function extractJsonLd(html) {
  const scripts = [...html.matchAll(/<script type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const parsed = [];
  for (const script of scripts) {
    try {
      parsed.push(JSON.parse(decodeHtml(script[1]).trim()));
    } catch {
      // Ignore malformed analytics/schema fragments.
    }
  }
  return parsed;
}

function flattenGraph(node) {
  if (!node) return [];
  if (Array.isArray(node)) return node.flatMap(flattenGraph);
  if (node['@graph']) return flattenGraph(node['@graph']);
  return [node];
}

function findProductSchema(html) {
  return flattenGraph(extractJsonLd(html)).find((item) => {
    const type = item?.['@type'];
    return type === 'Product' || (Array.isArray(type) && type.includes('Product'));
  });
}

function findBreadcrumbCategory(html) {
  const breadcrumb = flattenGraph(extractJsonLd(html)).find((item) => item?.['@type'] === 'BreadcrumbList');
  const elements = breadcrumb?.itemListElement || [];
  const names = elements
    .map((item) => item?.item?.name || item?.name)
    .map((name) => cleanText(name))
    .filter(Boolean);
  const category = names.length >= 3 ? names[names.length - 2] : '';
  return category && !/^shop$/i.test(category) ? category : '';
}

function extractHtmlTitle(html) {
  return cleanText(html.match(/<h1[^>]*product_title[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '');
}

function extractHtmlPrice(html) {
  const metaPrice = html.match(/property=["']product:price:amount["'][^>]*content=["']([^"']+)/i)?.[1];
  const priceText = metaPrice || html.match(/<p class=["']price["'][\s\S]*?([\d,]+\.\d{2})[\s\S]*?<\/p>/i)?.[1];
  return Number.parseFloat(String(priceText || '').replace(/,/g, ''));
}

function extractHtmlCategory(html) {
  const posted = html.match(/<span class=["']posted_in["'][\s\S]*?<\/span>/i)?.[0] || '';
  const matches = [...posted.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)].map((match) => cleanText(match[1]));
  return matches[0] || '';
}

function extractGalleryImages(html, schemaImage) {
  const images = [];
  for (const match of html.matchAll(/class=["'][^"']*woocommerce-product-gallery__image[^"']*["'][\s\S]*?<a[^>]+href=["']([^"']+)["']/gi)) {
    images.push(decodeHtml(match[1]));
  }
  for (const match of html.matchAll(/data-large_image=["']([^"']+)["']/gi)) {
    images.push(decodeHtml(match[1]));
  }
  if (Array.isArray(schemaImage)) images.push(...schemaImage.map(String));
  else if (schemaImage) images.push(String(schemaImage));

  return unique(images)
    .map((url) => url.replace(/-\d+x\d+(?=\.[a-z]{3,4}$)/i, ''))
    .filter((url) => /^https:\/\/aklart\.com\/wp-content\/uploads\/.+\.(png|jpe?g|webp)$/i.test(url))
    .filter((url) => !/cropped-|Group-|support\.svg|worldwide\.svg/i.test(url));
}

function extractPrice(schema, html) {
  const offer = Array.isArray(schema?.offers) ? schema.offers[0] : schema?.offers;
  const spec = Array.isArray(offer?.priceSpecification) ? offer.priceSpecification[0] : offer?.priceSpecification;
  const value = spec?.price || offer?.price || extractHtmlPrice(html);
  return Number.parseFloat(String(value || '').replace(/,/g, ''));
}

function inferCategory(title, sourceCategory) {
  const combined = `${sourceCategory} ${title}`.toLowerCase();
  if (/pressure washer|power washer/.test(combined)) return 'Pressure Washers';
  if (/mower|mowers|tractor|zero turn|timemaster|automower/.test(combined)) return 'Lawn Mowers';
  if (/vacuum|cleaner/.test(combined)) return 'Vacuum Cleaners';
  if (/blower|trimmer|chainsaw|generator|power station|snow blower|wood chipper|brush mower/.test(combined)) {
    return 'Outdoor Power Equipment';
  }
  return 'Hardware';
}

function inferBrand(title) {
  const normalized = decodeHtml(title).toLowerCase();
  const brand = knownBrands.find((candidate) => normalized.startsWith(candidate.toLowerCase()));
  if (brand) return brand;
  return decodeHtml(title).split(/\s+/).slice(0, 2).join(' ').replace(/[^a-z0-9 &.-]/gi, '').trim() || 'Tazoota';
}

function cleanDescription(description, title) {
  const cleaned = cleanText(description)
    .replace(/\bKey Features:\s*/gi, 'Key features:\n')
    .replace(/\bGet yours today!?/gi, '')
    .replace(/\bShop now\.?/gi, '')
    .trim();

  if (cleaned.length >= 80) return cleaned;
  return `${title}\n\nReliable equipment selected for residential, backyard, workshop, acreage, and farm maintenance.`;
}

function sanitizeJsonValue(value) {
  if (typeof value === 'string') {
    return value
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
      .replace(/[\uD800-\uDFFF]/g, '')
      .trim();
  }

  if (Array.isArray(value)) return value.map(sanitizeJsonValue);

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([key, entryValue]) => [key, sanitizeJsonValue(entryValue)]),
    );
  }

  if (typeof value === 'number' && !Number.isFinite(value)) return null;
  return value;
}

function extensionFromUrl(url, contentType) {
  const pathname = new URL(url).pathname;
  const ext = path.extname(pathname).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return ext;
  if (/png/i.test(contentType || '')) return '.png';
  if (/webp/i.test(contentType || '')) return '.webp';
  return '.jpg';
}

async function downloadAndUploadImage(slug, imageUrl, index) {
  const response = await fetch(imageUrl, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`Image download failed ${response.status}: ${imageUrl}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  const hash = createHash('sha1').update(buffer).digest('hex').slice(0, 12);
  const ext = extensionFromUrl(imageUrl, response.headers.get('content-type'));
  const fileName = `${String(index + 1).padStart(2, '0')}-${hash}${ext}`;
  const storagePath = `aklart-popular/${slug}/${fileName}`;
  const localDir = path.join(OUTPUT_ROOT, 'images', slug);
  await fs.mkdir(localDir, { recursive: true });
  await fs.writeFile(path.join(localDir, fileName), buffer);

  const { error } = await db.storage.from(STORAGE_BUCKET).upload(storagePath, buffer, {
    contentType: response.headers.get('content-type') || undefined,
    upsert: true,
  });
  if (error) throw new Error(`Supabase upload failed for ${storagePath}: ${error.message}`);

  return db.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

async function scrapeProduct(url, sourceRank) {
  const html = await fetchText(url);
  const schema = findProductSchema(html) || {};
  const title = cleanText(schema.name || extractHtmlTitle(html));
  const sourceCategory = findBreadcrumbCategory(html) || extractHtmlCategory(html);
  const price = extractPrice(schema, html);
  const images = extractGalleryImages(html, schema.image);

  if (!title) throw new Error(`Missing title for ${url}`);
  if (!Number.isFinite(price) || price <= 0) throw new Error(`Missing price for ${url}`);
  if (images.length === 0) throw new Error(`Missing images for ${url}`);

  const sourceSlug = new URL(url).pathname.split('/').filter(Boolean).pop() || slugify(title);
  const slug = slugify(sourceSlug);
  const uploadedImages = [];
  for (let index = 0; index < images.length; index++) {
    uploadedImages.push(await downloadAndUploadImage(slug, images[index], index));
  }

  const description = cleanDescription(schema.description || '', title);
  return {
    id: slug,
    slug,
    title,
    description,
    price,
    images: uploadedImages,
    condition: 'New',
    category: inferCategory(title, sourceCategory),
    brand: inferBrand(title),
    payee_email: 'admin@tazoota.com',
    checkout_link: '',
    checkout_flow: 'stripe-hosted',
    currency: 'USD',
    rating: 4.8,
    review_count: 0,
    reviews: [],
    in_stock: true,
    is_featured: sourceRank <= 8,
    listed_by: 'Tazoota',
    collections: ['popular', 'aklart-popular'],
    meta: {
      source: 'aklart',
      source_url: url,
      source_slug: sourceSlug,
      source_category: sourceCategory || null,
      source_rank: sourceRank,
      gmc_enabled: false,
      gmc_review_status: 'pending_manual_review',
      published: true,
      imported_at: new Date().toISOString(),
    },
  };
}

async function collectProductUrls() {
  const failedFileIndex = process.argv.indexOf('--failed-file');
  const failedFile = failedFileIndex >= 0 ? process.argv[failedFileIndex + 1] : '';
  if (failedFile) {
    const previousSummary = JSON.parse(await fs.readFile(path.resolve(ROOT, failedFile), 'utf8'));
    const failedUrls = unique((previousSummary.failed || []).map((item) => item.url));
    console.log(`Retrying ${failedUrls.length} failed product link(s) from ${failedFile}`);
    return failedUrls;
  }

  const urls = [];
  for (const page of SHOP_PAGES) {
    const pageUrl = `https://aklart.com/shop/page/${page}/?orderby=popularity`;
    console.log(`Scraping listing page ${page}: ${pageUrl}`);
    const html = await fetchText(pageUrl);
    const pageUrls = extractProductUrls(html);
    console.log(`  Found ${pageUrls.length} unique product links`);
    urls.push(...pageUrls);
  }
  return unique(urls);
}

async function upsertProduct(product) {
  const payload = sanitizeJsonValue(product);
  const { error } = await db.from('products').upsert(payload, { onConflict: 'slug' });
  if (error) throw new Error(`Database upsert failed for ${product.slug}: ${error.message}`);
}

async function main() {
  await fs.mkdir(OUTPUT_ROOT, { recursive: true });
  const urls = await collectProductUrls();
  console.log(`Total unique products from pages 1-4: ${urls.length}`);

  const imported = [];
  const failed = [];
  for (let index = 0; index < urls.length; index++) {
    const url = urls[index];
    try {
      console.log(`\n[${index + 1}/${urls.length}] ${url}`);
      const product = await scrapeProduct(url, index + 1);
      await upsertProduct(product);
      imported.push({ slug: product.slug, title: product.title, price: product.price, images: product.images.length });
      console.log(`  Imported ${product.slug} | $${product.price} | ${product.images.length} image(s)`);
    } catch (error) {
      failed.push({ url, error: error.message });
      console.error(`  Failed: ${error.message}`);
    }
  }

  const summary = { generatedAt: new Date().toISOString(), importedCount: imported.length, failedCount: failed.length, imported, failed };
  const summaryPath = path.join(OUTPUT_ROOT, 'import-summary.json');
  await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
  console.log('\nImport summary:', JSON.stringify({ imported: imported.length, failed: failed.length, summaryPath }, null, 2));
  if (failed.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

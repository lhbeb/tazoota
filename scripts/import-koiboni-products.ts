import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { getCollectionsForCategory } from '../src/lib/productCollections';

const SUPABASE_URL = process.env.TAZOOTA_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.TAZOOTA_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing TAZOOTA_SUPABASE_URL or TAZOOTA_SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface KoiboniProduct {
  id: number;
  title: string;
  handle: string;
  url: string;
  price: string;
  compare_at_price: string | null;
  currency: string;
  sku: string;
  available: boolean;
  vendor: string;
  product_type: string;
  tags: string;
  image_url: string;
  images: string[];
  description: string;
  created_at: string;
  updated_at: string;
  number_of_variants: number;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function generateUniqueSlug(baseSlug: string): Promise<string> {
  const { data: existingProducts, error: checkError } = await supabase
    .from('products')
    .select('slug')
    .eq('slug', baseSlug)
    .limit(1);

  if (checkError && checkError.code !== 'PGRST116') {
    throw new Error(`Error checking slug existence: ${checkError.message}`);
  }

  if (!existingProducts || existingProducts.length === 0) {
    return baseSlug;
  }

  let counter = 2;
  let uniqueSlug = `${baseSlug}-${counter}`;
  while (true) {
    const { data: checkProducts, error: slugCheckError } = await supabase
      .from('products')
      .select('slug')
      .eq('slug', uniqueSlug)
      .limit(1);

    if (slugCheckError && slugCheckError.code !== 'PGRST116') {
      throw new Error(`Error checking slug existence: ${slugCheckError.message}`);
    }

    if (!checkProducts || checkProducts.length === 0) {
      return uniqueSlug;
    }

    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
    if (counter > 1000) {
      throw new Error(`Unable to generate unique slug for ${baseSlug} after 1000 attempts`);
    }
  }
}

async function importProducts(jsonPath: string) {
  console.log(`Reading ${jsonPath}...`);
  const content = fs.readFileSync(jsonPath, 'utf-8');
  const products: KoiboniProduct[] = JSON.parse(content);

  if (!Array.isArray(products) || products.length === 0) {
    console.error('No products found in JSON file.');
    process.exit(1);
  }

  console.log(`Total products to import: ${products.length}`);

  let successCount = 0;
  let errorCount = 0;
  let skipCount = 0;

  for (const product of products) {
    const baseSlug = product.handle || slugify(product.title);
    let slug: string;
    try {
      slug = await generateUniqueSlug(baseSlug);
    } catch (err: any) {
      console.error(`  [ERROR] ${baseSlug}: ${err.message}`);
      errorCount++;
      continue;
    }

    const price = parseFloat(product.price);
    if (!product.title || isNaN(price) || price <= 0) {
      console.warn(`  [SKIP] ${baseSlug}: Invalid data (title="${product.title?.substring(0, 40)}", price=${product.price})`);
      skipCount++;
      continue;
    }

    const originalPrice = product.compare_at_price && !isNaN(parseFloat(product.compare_at_price))
      ? parseFloat(product.compare_at_price)
      : null;

    const collections = getCollectionsForCategory(product.product_type);

    const productPayload = {
      id: slug,
      slug,
      title: product.title,
      description: product.description,
      price,
      images: product.images && product.images.length ? product.images : (product.image_url ? [product.image_url] : []),
      condition: 'Brand New',
      category: product.product_type || 'Lawn Mowers',
      brand: product.vendor || 'Tazoota',
      payee_email: 'admin@tazoota.com',
      checkout_link: product.url,
      checkout_flow: 'paypal-direct' as const,
      currency: product.currency || 'USD',
      rating: 0,
      review_count: 0,
      reviews: [],
      meta: {
        published: true,
        sku: product.sku ? String(product.sku) : undefined,
        source_url: product.url,
      },
      in_stock: product.available !== false,
      is_featured: false,
      original_price: originalPrice,
      published: true,
      collections,
    };

    try {
      const { data, error } = await supabase
        .from('products')
        .insert(productPayload)
        .select();

      if (error) {
        if (error.code === '23505') {
          console.warn(`  [SKIP] ${slug}: Already exists (duplicate key)`);
          skipCount++;
        } else {
          console.error(`  [ERROR] ${slug}: ${error.message}`);
          errorCount++;
        }
      } else {
        successCount++;
        console.log(`  [OK] ${slug} ($${price})`);
      }
    } catch (err: any) {
      console.error(`  [ERROR] ${slug}: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\nImport complete:`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Skipped: ${skipCount}`);
  console.log(`  Errors:  ${errorCount}`);
}

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error('Usage: npx tsx scripts/import-koiboni-products.ts <path-to-json>');
  process.exit(1);
}

importProducts(jsonPath).catch(console.error);
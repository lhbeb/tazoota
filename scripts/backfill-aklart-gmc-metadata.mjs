#!/usr/bin/env node
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const ROOT = process.cwd();
dotenv.config({ path: path.join(ROOT, '.env.local'), quiet: true });
dotenv.config({ path: path.resolve(ROOT, '..', 'new env vars tazoota.txt'), quiet: true, override: false });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function classifyProduct(product) {
  const haystack = `${product.title || ''} ${product.category || ''}`.toLowerCase();

  if (/pressure washer|power washer/.test(haystack)) {
    return {
      category: 'Pressure Washers',
      productType: 'Home & Garden > Lawn & Garden > Outdoor Power Equipment > Pressure Washers',
      googleProductCategory: '2211',
      group: 'pressure-washers',
    };
  }

  if (/mower|tractor|zero turn|timemaster|field and brush/.test(haystack)) {
    return {
      category: 'Lawn Mowers',
      productType: 'Home & Garden > Lawn & Garden > Outdoor Power Equipment > Lawn Mowers',
      googleProductCategory: '2962',
      group: 'lawn-mowers',
    };
  }

  if (/generator|power station/.test(haystack)) {
    return {
      category: 'Generators',
      productType: 'Home & Garden > Lawn & Garden > Outdoor Power Equipment > Generators',
      googleProductCategory: '696',
      group: 'generators',
    };
  }

  if (/chainsaw|blower|trimmer|skid steer|dump cart|brush mower/.test(haystack)) {
    return {
      category: 'Outdoor Power Equipment',
      productType: 'Home & Garden > Lawn & Garden > Outdoor Power Equipment',
      googleProductCategory: '2211',
      group: 'outdoor-power-equipment',
    };
  }

  if (/shed/.test(haystack)) {
    return {
      category: 'Storage Sheds',
      productType: 'Home & Garden > Lawn & Garden > Outdoor Structures > Storage Sheds',
      googleProductCategory: '536',
      group: 'storage-sheds',
    };
  }

  if (/barbecue|bbq|grill/.test(haystack)) {
    return {
      category: 'Outdoor Grills',
      productType: 'Home & Garden > Lawn & Garden > Outdoor Cooking > Outdoor Grills',
      googleProductCategory: '536',
      group: 'outdoor-grills',
    };
  }

  if (/water heater|boiler/.test(haystack)) {
    return {
      category: 'Water Heaters & Boilers',
      productType: 'Home & Garden > Household Appliances > Water Heaters & Boilers',
      googleProductCategory: '536',
      group: 'water-heaters-boilers',
    };
  }

  if (/lift|hoist/.test(haystack)) {
    return {
      category: 'Garage Equipment',
      productType: 'Vehicles & Parts > Vehicle Maintenance, Care & Decor > Garage Equipment',
      googleProductCategory: '888',
      group: 'garage-equipment',
    };
  }

  if (/snow plow|snow/.test(haystack)) {
    return {
      category: 'Snow Removal Equipment',
      productType: 'Home & Garden > Lawn & Garden > Snow Removal',
      googleProductCategory: '536',
      group: 'snow-removal-equipment',
    };
  }

  if (/refrigerator/.test(haystack)) {
    return {
      category: 'Kitchen Appliances',
      productType: 'Home & Garden > Kitchen & Dining > Kitchen Appliances > Refrigerators',
      googleProductCategory: '536',
      group: 'kitchen-appliances',
    };
  }

  if (/pump conversion|ford|vehicle|truck|car/.test(haystack)) {
    return {
      category: 'Vehicle Parts',
      productType: 'Vehicles & Parts > Vehicle Parts & Accessories',
      googleProductCategory: '888',
      group: 'vehicle-parts',
    };
  }

  return {
    category: product.category || 'Home & Garden',
    productType: `Home & Garden > ${product.category || 'General Equipment'}`,
    googleProductCategory: '536',
    group: slugify(product.category || 'home-garden'),
  };
}

async function main() {
  const { data: products, error } = await db
    .from('products')
    .select('slug,title,category,condition,meta')
    .eq('meta->>source', 'aklart')
    .order('slug', { ascending: true });

  if (error) throw error;
  if (!products?.length) {
    console.log('No Aklart-sourced products found.');
    return;
  }

  let updated = 0;
  const sortedProducts = [...products].sort((a, b) => {
    const rankA = Number(a.meta?.source_rank || Number.MAX_SAFE_INTEGER);
    const rankB = Number(b.meta?.source_rank || Number.MAX_SAFE_INTEGER);
    if (rankA !== rankB) return rankA - rankB;
    return String(a.slug).localeCompare(String(b.slug));
  });

  for (const [index, product] of sortedProducts.entries()) {
    const sku = `TAZOOTA-AKL-${String(index + 1).padStart(4, '0')}`;
    const mapping = classifyProduct(product);
    const meta = {
      ...(product.meta || {}),
      sku,
      item_id: sku,
      item_group_id: `TAZOOTA-${mapping.group}`.toUpperCase().slice(0, 50),
      google_product_category: mapping.googleProductCategory,
      product_type: mapping.productType,
      gender: 'unisex',
      sex: 'unisex',
      age_group: 'adult',
      adult: 'no',
      targetMarket: 'us',
      gmc_enabled: false,
      gmc_review_status: 'pending_manual_review',
      gmc_mapping_completed: true,
      gmc_mapping_sequence: index + 1,
      gmc_mapped_at: new Date().toISOString(),
    };

    const { error: updateError } = await db
      .from('products')
      .update({
        condition: 'Brand New',
        category: mapping.category,
        meta,
      })
      .eq('slug', product.slug);

    if (updateError) {
      throw new Error(`Failed to update ${product.slug}: ${updateError.message}`);
    }

    updated += 1;
    console.log(`Mapped ${sku} | ${mapping.category} | ${product.slug}`);
  }

  console.log(`Finished mapping ${updated} Aklart product(s) for GMC review.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

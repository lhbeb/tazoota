/**
 * Shopify Full Sync Script
 * ========================
 * Reusable script to sync any Supabase product catalog to any Shopify store.
 *
 * Usage:
 *   node scripts/shopify-full-sync.mjs \
 *     --store=mystore.myshopify.com \
 *     --token=shpat_xxxx \
 *     --supabase-url=https://xxx.supabase.co \
 *     --supabase-key=service_role_key
 *
 * Or set env vars:
 *   SHOPIFY_STORE_DOMAIN, SHOPIFY_API_ACCESS_TOKEN,
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * What it does:
 *   1. Fetches all products from Supabase
 *   2. Fetches all existing products from Shopify
 *   3. Matches by title (skips already-mapped products)
 *   4. Creates missing products in Shopify
 *   5. Sets inventory_policy=continue on all variants (never out of stock)
 *   6. Writes shopify_variant_id + shopify_product_id back to Supabase meta
 *   7. Sets checkout_flow='shopify' on all synced products
 */

import { createClient } from '@supabase/supabase-js';

// ── Config ──────────────────────────────────────────────────────────────────
function getArg(name) {
  const flag = `--${name}=`;
  const arg = process.argv.find(a => a.startsWith(flag));
  return arg ? arg.slice(flag.length) : null;
}

const SHOPIFY_DOMAIN   = getArg('store')         || process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_TOKEN    = getArg('token')          || process.env.SHOPIFY_API_ACCESS_TOKEN;
const SUPABASE_URL     = getArg('supabase-url')   || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY     = getArg('supabase-key')   || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing required config. Provide via args or env vars:');
  console.error('   --store=mystore.myshopify.com');
  console.error('   --token=shpat_xxxx');
  console.error('   --supabase-url=https://xxx.supabase.co');
  console.error('   --supabase-key=service_role_key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const shopifyHeaders = {
  'Content-Type': 'application/json',
  'X-Shopify-Access-Token': SHOPIFY_TOKEN,
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function normalize(title) {
  return (title || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function shopifyGet(path) {
  const res = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/${path}`, { headers: shopifyHeaders });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function shopifyPost(path, body) {
  const res = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/${path}`, {
    method: 'POST', headers: shopifyHeaders, body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function shopifyPut(path, body) {
  const res = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/${path}`, {
    method: 'PUT', headers: shopifyHeaders, body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function fetchAllShopifyProducts() {
  const products = [];
  let url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/products.json?limit=250&fields=id,title,variants`;
  while (url) {
    const res = await fetch(url, { headers: shopifyHeaders });
    if (!res.ok) throw new Error(`Shopify fetch error: ${res.status} ${await res.text()}`);
    const data = await res.json();
    products.push(...(data.products || []));
    const link = res.headers.get('Link') || '';
    const next = link.match(/<([^>]+)>;\s*rel="next"/);
    url = next ? next[1] : null;
  }
  return products;
}

async function createShopifyProduct(product) {
  const data = await shopifyPost('products.json', {
    product: {
      title: product.title,
      body_html: (product.description || '').substring(0, 5000),
      vendor: product.brand || 'Tazoota',
      product_type: product.category || '',
      status: 'active',
      variants: [{
        price: String(Number(product.price || 0).toFixed(2)),
        inventory_management: null,
        inventory_policy: 'continue',
        fulfillment_service: 'manual',
        requires_shipping: true,
      }],
      ...(product.images?.length > 0 ? { images: [{ src: product.images[0] }] } : {}),
    },
  });
  return {
    shopifyProductId: String(data.product.id),
    variantId: String(data.product.variants[0].id),
  };
}

async function fixVariantInventory(variantId) {
  await shopifyPut(`variants/${variantId}.json`, {
    variant: { id: variantId, inventory_management: null, inventory_policy: 'continue' },
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀 Shopify Full Sync`);
  console.log(`   Store:    ${SHOPIFY_DOMAIN}`);
  console.log(`   Supabase: ${SUPABASE_URL}\n`);

  // 1. Fetch Supabase products
  console.log('📦 Fetching Supabase products...');
  const { data: products, error } = await supabase
    .from('products')
    .select('slug, title, description, price, brand, category, images, meta, checkout_flow')
    .order('title');
  if (error) throw new Error(`Supabase: ${error.message}`);
  console.log(`   Found ${products.length} products\n`);

  // 2. Fetch existing Shopify products
  console.log('🛍️  Fetching Shopify products...');
  const shopifyProducts = await fetchAllShopifyProducts();
  console.log(`   Found ${shopifyProducts.length} products\n`);

  // Build title → shopify data map
  const shopifyMap = new Map();
  for (const sp of shopifyProducts) {
    shopifyMap.set(normalize(sp.title), {
      shopifyProductId: String(sp.id),
      variantId: String(sp.variants?.[0]?.id || ''),
    });
  }

  const stats = { matched: 0, created: 0, skipped: 0, failed: 0, inventoryFixed: 0 };

  // 3. Process each Supabase product
  for (const product of products) {
    const meta = product.meta || {};

    // Skip if already mapped to this store
    if (meta.shopify_variant_id && meta.shopify_store_domain === SHOPIFY_DOMAIN) {
      stats.skipped++;
      // Still fix inventory on already-mapped products
      try {
        await fixVariantInventory(meta.shopify_variant_id);
        stats.inventoryFixed++;
      } catch {}
      process.stdout.write(`⏭  ${product.slug}\n`);
      continue;
    }

    let variantId, shopifyProductId, action;

    // Match by title
    const existing = shopifyMap.get(normalize(product.title));
    if (existing) {
      variantId = existing.variantId;
      shopifyProductId = existing.shopifyProductId;
      action = 'matched';
      stats.matched++;
    } else {
      // Create in Shopify
      try {
        const created = await createShopifyProduct(product);
        variantId = created.variantId;
        shopifyProductId = created.shopifyProductId;
        shopifyMap.set(normalize(product.title), { variantId, shopifyProductId });
        action = 'created';
        stats.created++;
        await new Promise(r => setTimeout(r, 300)); // rate limit
      } catch (e) {
        console.error(`❌ Create failed for ${product.slug}: ${e.message}`);
        stats.failed++;
        continue;
      }
    }

    // Fix inventory policy
    try {
      await fixVariantInventory(variantId);
      stats.inventoryFixed++;
    } catch (e) {
      console.warn(`⚠️  Inventory fix failed for variant ${variantId}: ${e.message}`);
    }

    // Write back to Supabase
    const { error: updateErr } = await supabase
      .from('products')
      .update({
        meta: {
          ...meta,
          shopify_variant_id: variantId,
          shopify_product_id: shopifyProductId,
          shopify_store_domain: SHOPIFY_DOMAIN,
        },
        checkout_flow: 'shopify',
        updated_at: new Date().toISOString(),
      })
      .eq('slug', product.slug);

    if (updateErr) {
      console.error(`❌ Supabase update failed for ${product.slug}: ${updateErr.message}`);
      stats.failed++;
    } else {
      console.log(`✅ [${action}] ${product.slug} → variant ${variantId}`);
    }
  }

  console.log('\n=== SYNC COMPLETE ===');
  console.log(`✅ Matched:         ${stats.matched}`);
  console.log(`✅ Created:         ${stats.created}`);
  console.log(`⏭  Skipped:         ${stats.skipped}`);
  console.log(`🔧 Inventory fixed: ${stats.inventoryFixed}`);
  console.log(`❌ Failed:          ${stats.failed}`);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });

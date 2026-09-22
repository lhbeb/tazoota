import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'tazoota.myshopify.com';

function shopifyHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': process.env.SHOPIFY_API_ACCESS_TOKEN || '',
  };
}

// Fetch all products from Shopify with pagination
async function fetchAllShopifyProducts(): Promise<any[]> {
  const products: any[] = [];
  let nextUrl: string | null = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/products.json?limit=250&fields=id,title,variants`;

  while (nextUrl) {
    const res: Response = await fetch(nextUrl, { headers: shopifyHeaders() });
    if (!res.ok) throw new Error(`Shopify API error: ${res.status} ${await res.text()}`);
    const data = await res.json();
    products.push(...(data.products || []));

    // Check for next page via Link header
    const linkHeader = res.headers.get('Link') || '';
    const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    nextUrl = nextMatch ? nextMatch[1] : null;
  }

  return products;
}

// Create a product in Shopify
async function createShopifyProduct(product: any): Promise<{ shopifyId: string; variantId: string } | null> {
  const body = {
    product: {
      title: product.title,
      body_html: product.description || '',
      vendor: product.brand || 'Tazoota',
      product_type: product.category || '',
      status: 'active',
      variants: [{
        price: String(product.price || '0.00'),
        inventory_management: null,     // do not track quantity
        inventory_policy: 'continue',   // allow purchase even when qty = 0
        fulfillment_service: 'manual',
        requires_shipping: true,
      }],
      images: (product.images || []).slice(0, 1).map((src: string) => ({ src })),
    },
  };

  const res = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/products.json`, {
    method: 'POST',
    headers: shopifyHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error(`Failed to create product ${product.slug}:`, await res.text());
    return null;
  }

  const data = await res.json();
  const shopifyProduct = data.product;
  const variantId = String(shopifyProduct.variants?.[0]?.id || '');
  const shopifyId = String(shopifyProduct.id || '');
  return { shopifyId, variantId };
}

export async function POST(request: NextRequest) {
  // Auth check
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const accessToken = process.env.SHOPIFY_API_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json({
      error: 'SHOPIFY_API_ACCESS_TOKEN not set. Complete OAuth first at /api/shopify/auth'
    }, { status: 400 });
  }

  const results = { matched: 0, created: 0, failed: 0, skipped: 0, details: [] as any[] };

  try {
    // 1. Fetch all Supabase products with shopify flow (or all products)
    const { data: supabaseProducts, error } = await supabaseAdmin
      .from('products')
      .select('slug, title, description, price, brand, category, images, meta, checkout_flow, checkout_link')
      .order('title');

    if (error) throw new Error(`Supabase error: ${error.message}`);

    // 2. Fetch all existing Shopify products
    console.log('Fetching Shopify products...');
    const shopifyProducts = await fetchAllShopifyProducts();
    console.log(`Found ${shopifyProducts.length} Shopify products`);

    // Build a map: normalized title → shopify product
    const shopifyByTitle = new Map<string, any>();
    for (const sp of shopifyProducts) {
      const normalized = sp.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, ' ');
      shopifyByTitle.set(normalized, sp);
    }

    // 3. For each Supabase product, match or create in Shopify
    for (const product of supabaseProducts || []) {
      const normalizedTitle = product.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, ' ');
      const existingMeta = product.meta || {};

      // Skip if already has a variant ID
      if (existingMeta.shopify_variant_id) {
        results.skipped++;
        results.details.push({ slug: product.slug, status: 'skipped', reason: 'already has variant ID' });
        continue;
      }

      let variantId: string | null = null;
      let shopifyProductId: string | null = null;
      let action = '';

      // Try to match existing Shopify product by title
      const matched = shopifyByTitle.get(normalizedTitle);
      if (matched) {
        variantId = String(matched.variants?.[0]?.id || '');
        shopifyProductId = String(matched.id || '');
        action = 'matched';
        results.matched++;
      } else {
        // Create new product in Shopify
        const created = await createShopifyProduct(product);
        if (created) {
          variantId = created.variantId;
          shopifyProductId = created.shopifyId;
          action = 'created';
          results.created++;
        } else {
          results.failed++;
          results.details.push({ slug: product.slug, status: 'failed', reason: 'Shopify create failed' });
          continue;
        }
      }

      if (variantId) {
        // Write variant ID back to Supabase
        const { error: updateError } = await supabaseAdmin
          .from('products')
          .update({
            meta: { ...existingMeta, shopify_variant_id: variantId, shopify_product_id: shopifyProductId },
            checkout_flow: 'shopify',
            updated_at: new Date().toISOString(),
          })
          .eq('slug', product.slug);

        if (updateError) {
          results.failed++;
          results.details.push({ slug: product.slug, status: 'failed', reason: updateError.message });
        } else {
          results.details.push({ slug: product.slug, status: action, variantId, shopifyProductId });
        }
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error('Shopify sync error:', err);
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Sync failed',
      results,
    }, { status: 500 });
  }
}

// GET — just fetch Shopify products for preview
export async function GET(request: NextRequest) {
  const accessToken = process.env.SHOPIFY_API_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json({ error: 'SHOPIFY_API_ACCESS_TOKEN not set' }, { status: 400 });
  }

  try {
    const products = await fetchAllShopifyProducts();
    return NextResponse.json({ count: products.length, products: products.map(p => ({ id: p.id, title: p.title, variantId: p.variants?.[0]?.id })) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}

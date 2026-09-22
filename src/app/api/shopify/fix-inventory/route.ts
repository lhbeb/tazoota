/**
 * POST /api/shopify/fix-inventory
 *
 * Patches every Shopify variant that has a shopify_variant_id stored in
 * Supabase to set:
 *   inventory_management: null   (don't track quantity)
 *   inventory_policy: 'continue' (allow purchase even when qty = 0)
 *
 * This fixes the "sold out" error customers see on the generated checkout
 * link even though the product is marked "don't track quantity" in Shopify.
 * The root cause is that inventory_policy defaults to 'deny' unless explicitly
 * set to 'continue'.
 *
 * Run once from the admin: POST /api/shopify/fix-inventory
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'tazoota.myshopify.com';

function shopifyHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': process.env.SHOPIFY_API_ACCESS_TOKEN || '',
  };
}

async function patchVariant(variantId: string): Promise<{ ok: boolean; status?: number; error?: string }> {
  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/variants/${variantId}.json`,
    {
      method: 'PUT',
      headers: shopifyHeaders(),
      body: JSON.stringify({
        variant: {
          id: Number(variantId),
          inventory_management: null,   // stop tracking quantity
          inventory_policy: 'continue', // allow purchase when qty = 0
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, status: res.status, error: text };
  }
  return { ok: true };
}

export async function POST(request: NextRequest) {
  // Admin auth check
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const accessToken = process.env.SHOPIFY_API_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json({
      error: 'SHOPIFY_API_ACCESS_TOKEN not set. Complete OAuth first at /api/shopify/auth',
    }, { status: 400 });
  }

  // Fetch all products that have a shopify_variant_id
  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('slug, title, meta');

  if (error) {
    return NextResponse.json({ error: `Supabase error: ${error.message}` }, { status: 500 });
  }

  const results = { patched: 0, failed: 0, skipped: 0, details: [] as any[] };

  for (const product of products ?? []) {
    const meta = (product.meta ?? {}) as Record<string, unknown>;
    const variantId = meta.shopify_variant_id as string | undefined;

    if (!variantId) {
      results.skipped++;
      continue;
    }

    const result = await patchVariant(String(variantId));

    if (result.ok) {
      results.patched++;
      results.details.push({ slug: product.slug, variantId, status: 'patched' });
    } else {
      results.failed++;
      results.details.push({
        slug: product.slug,
        variantId,
        status: 'failed',
        httpStatus: result.status,
        error: result.error,
      });
    }

    // Shopify rate limit — 2 req/s on Basic, stay safe
    await new Promise(r => setTimeout(r, 550));
  }

  return NextResponse.json({ success: true, results });
}

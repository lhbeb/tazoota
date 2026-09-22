/**
 * POST /api/shopify/quick-checkout
 *
 * Generates a Shopify cart permalink directly from a product slug.
 * No shipping form, no order saved to Supabase.
 * The customer fills shipping info on Shopify's hosted checkout.
 *
 * Body: { slug: string }
 * Response: { url: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createShopifyCheckoutLink } from '@/lib/shopifyCheckout';

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    // Fetch the product from Supabase to get meta.shopify_variant_id
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('id, slug, title, description, price, images, condition, category, brand, payee_email, currency, checkout_link, checkout_flow, meta, in_stock, is_featured, listed_by, collections, seller_id, original_price')
      .eq('slug', slug)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.checkout_flow !== 'shopify') {
      return NextResponse.json({ error: 'Product is not on shopify checkout flow' }, { status: 400 });
    }

    // Map DB row to Product type
    const productForLink = {
      id: product.id,
      slug: product.slug,
      title: product.title,
      description: product.description,
      price: product.price,
      images: product.images || [],
      condition: product.condition,
      category: product.category,
      brand: product.brand,
      payeeEmail: product.payee_email,
      currency: product.currency || 'USD',
      checkoutLink: product.checkout_link,
      checkoutFlow: product.checkout_flow,
      meta: product.meta,
      inStock: product.in_stock,
    } as any;

    // Generate Shopify cart permalink — no orderId, no shipping pre-fill
    // Shopify will collect the customer's shipping info on their hosted checkout
    const url = createShopifyCheckoutLink({
      orderId: `quick-${Date.now()}`,
      product: productForLink,
      shippingData: {}, // empty — Shopify collects it
    });

    return NextResponse.json({ url });
  } catch (err: any) {
    console.error('[quick-checkout] Error:', err.message);
    return NextResponse.json(
      { error: err.message || 'Failed to generate checkout link' },
      { status: 500 }
    );
  }
}

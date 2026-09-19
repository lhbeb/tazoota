import 'server-only';

import type { Product } from '@/types/product';

interface ShopifyCheckoutInput {
  orderId: string;
  product: Product;
  shippingData: {
    email?: string;
    fullName?: string;
    streetAddress?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}

function firstNonEmpty(values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return '';
}

function normalizeShopifyDomain(value: string): string {
  const raw = value.trim();
  if (!raw) return '';

  try {
    const url = new URL(raw.includes('://') ? raw : `https://${raw}`);
    const hostname = url.hostname.toLowerCase();
    if (!hostname || hostname === 'localhost' || hostname.includes('@')) return '';
    return hostname;
  } catch {
    return '';
  }
}

function getProductMeta(product: Product): Record<string, unknown> {
  return product.meta && typeof product.meta === 'object'
    ? product.meta as Record<string, unknown>
    : {};
}

function extractVariantId(product: Product): string {
  const meta = getProductMeta(product);
  const candidates = [
    meta.shopify_variant_id,
    meta.shopifyVariantId,
    meta.variant_id,
    meta.variantId,
    meta.shopify_variant_gid,
    meta.shopifyVariantGid,
  ];

  for (const candidate of candidates) {
    const value = firstNonEmpty([candidate]);
    const match = value.match(/(?:ProductVariant\/)?(\d+)$/);
    if (match) return match[1];
  }

  // Existing Shopify cart permalinks are also a safe source of the variant ID.
  // Only consider URLs that belong to a myshopify.com domain — never koiboni.com
  // or any other unrelated storefront that may have been imported as legacy data.
  const existingLink = typeof product.checkoutLink === 'string' ? product.checkoutLink : '';
  const isShopifyCartLink = existingLink.includes('myshopify.com') || existingLink.match(/^https?:\/\/[^/]*\/cart\//);
  if (isShopifyCartLink) {
    const match = existingLink.match(/\/cart\/(?:[^/?#]*\/)?(\d+):\d+/);
    if (match) return match[1];
  }
  return '';
}

function getStoreDomain(product: Product): string {
  // Tazoota's checkout flow must never inherit a hostname from legacy
  // checkout_link values or unrelated environment/product metadata.
  return normalizeShopifyDomain('tazoota.myshopify.com');
}

function splitName(fullName: string, email: string): { firstName: string; lastName: string } {
  const normalized = fullName.trim() || email.split('@')[0] || 'Customer';
  const parts = normalized.split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || 'Customer',
    lastName: parts.slice(1).join(' ') || 'Customer',
  };
}

function appendParam(params: URLSearchParams, key: string, value: unknown): void {
  if (typeof value === 'string' && value.trim()) params.set(key, value.trim());
}

/**
 * Builds a fresh Shopify cart permalink for one order. Shopify creates a new
 * checkout from this reusable URL, while the order ID/ref values let the
 * merchant trace the checkout back to the local order intent.
 */
export function createShopifyCheckoutLink({ orderId, product, shippingData }: ShopifyCheckoutInput): string {
  const domain = getStoreDomain(product);
  const variantId = extractVariantId(product);

  if (!domain) {
    throw new Error(`Shopify store domain is missing for product ${product.slug}. Set SHOPIFY_STORE_DOMAIN or product meta.shopify_store_domain.`);
  }
  if (!variantId) {
    throw new Error(`Shopify variant ID is missing for product ${product.slug}. Set product meta.shopify_variant_id or checkout_link to a Shopify cart permalink.`);
  }

  const quantity = 1;
  const url = new URL(`https://${domain}/cart/${variantId}:${quantity}`);
  const email = shippingData.email?.trim() || '';
  const names = splitName(shippingData.fullName || '', email);

  appendParam(url.searchParams, 'checkout[email]', email);
  appendParam(url.searchParams, 'checkout[shipping_address][first_name]', names.firstName);
  appendParam(url.searchParams, 'checkout[shipping_address][last_name]', names.lastName);
  appendParam(url.searchParams, 'checkout[shipping_address][address1]', shippingData.streetAddress);
  appendParam(url.searchParams, 'checkout[shipping_address][address2]', shippingData.addressLine2);
  appendParam(url.searchParams, 'checkout[shipping_address][city]', shippingData.city);
  appendParam(url.searchParams, 'checkout[shipping_address][province]', shippingData.state);
  appendParam(url.searchParams, 'checkout[shipping_address][country]', shippingData.country);
  appendParam(url.searchParams, 'checkout[shipping_address][zip]', shippingData.zipCode);
  appendParam(url.searchParams, 'ref', `tazoota-order-${orderId}`);
  appendParam(url.searchParams, 'attributes[tazoota_order_id]', orderId);
  appendParam(url.searchParams, 'attributes[tazoota_product_slug]', product.slug);

  return url.toString();
}

export function canCreateShopifyCheckoutLink(product: Product): boolean {
  try {
    createShopifyCheckoutLink({ orderId: 'preview', product, shippingData: {} });
    return true;
  } catch {
    return false;
  }
}

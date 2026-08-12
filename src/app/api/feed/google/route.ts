import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/data';
import { formatValidSku, mapConditionToGmc } from '@/lib/conditions';
import type { Product } from '@/types/product';

const BASE_URL = 'https://tazoota.com';
const SUPPORTED_COUNTRIES = ['GB', 'US'] as const;
const SUPPORTED_CURRENCIES = ['GBP', 'USD'] as const;

type FeedCountry = (typeof SUPPORTED_COUNTRIES)[number];
type FeedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

const SHIPPING_BY_COUNTRY: Record<FeedCountry, {
  service: string;
  currency: FeedCurrency;
}> = {
  GB: { service: 'Free Standard Delivery', currency: 'GBP' },
  US: { service: 'Free Standard Shipping', currency: 'USD' },
};

/**
 * Maps store categories to Google's official product taxonomy IDs.
 * Full taxonomy: https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt
 */
const GOOGLE_PRODUCT_CATEGORY_MAP: Record<string, string> = {
  'Lawn Mowers': '2962',
  'Ride Mowers': '2962',
  'Power Tools': '1167',
  'Generators': '696',
  'Garden Equipment': '4217',
  'Garden Tools': '4217',
  'Pressure Washers': '2211',
  'Outdoor Power Equipment': '2211',
  'Electronics': '222',
  'Fashion': '1604',
  'Hobbies': '8',
  'Entertainment': '8',
  'Home & Garden': '536',
  'default': '536',
};

function getGoogleProductCategory(category: string | undefined): string {
  if (!category) return GOOGLE_PRODUCT_CATEGORY_MAP['default'];
  const exactMatch = GOOGLE_PRODUCT_CATEGORY_MAP[category];
  if (exactMatch) return exactMatch;
  const lowerCategory = category.toLowerCase();
  for (const [key, value] of Object.entries(GOOGLE_PRODUCT_CATEGORY_MAP)) {
    if (key !== 'default' && lowerCategory.includes(key.toLowerCase())) {
      return value;
    }
  }
  return GOOGLE_PRODUCT_CATEGORY_MAP['default'];
}

function escapeXml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function parseEnum<T extends string>(
  value: string | null,
  supportedValues: readonly T[],
): T | null | undefined {
  if (!value) return undefined;
  const normalized = value.toUpperCase();
  return supportedValues.includes(normalized as T) ? (normalized as T) : null;
}

function isFeedEligible(product: Product): boolean {
  return (
    product.meta?.gmc_enabled !== false &&
    product.meta?.published !== false &&
    product.published !== false &&
    Boolean(product.slug && product.title && product.images?.[0]) &&
    Number.isFinite(Number(product.price)) &&
    Number(product.price) > 0
  );
}

function buildShippingXml(
  countries: readonly FeedCountry[],
  itemCurrency: string,
): string {
  return countries
    .map((country) => {
      const shipping = SHIPPING_BY_COUNTRY[country];
      return `
      <g:shipping>
        <g:country>${country}</g:country>
        <g:service>${shipping.service}</g:service>
        <g:price>0.00 ${itemCurrency}</g:price>
        <g:min_handling_time>0</g:min_handling_time>
        <g:max_handling_time>1</g:max_handling_time>
        <g:min_transit_time>5</g:min_transit_time>
        <g:max_transit_time>9</g:max_transit_time>
      </g:shipping>`;
    })
    .join('');
}

export async function GET(request: NextRequest) {
  const country = parseEnum(
    request.nextUrl.searchParams.get('country'),
    SUPPORTED_COUNTRIES,
  );
  const currency = parseEnum(
    request.nextUrl.searchParams.get('currency'),
    SUPPORTED_CURRENCIES,
  );

  if (country === null) {
    return new NextResponse('Unsupported country. Use GB or US.', { status: 400 });
  }
  if (currency === null) {
    return new NextResponse('Unsupported currency. Use GBP or USD.', { status: 400 });
  }

  try {
    let products: Product[] = [];
    try {
      products = await getAllProducts();
    } catch (error) {
      console.error('Error fetching products for Google feed:', error);
    }

    const targetCountries: readonly FeedCountry[] = country
      ? [country]
      : SUPPORTED_COUNTRIES;

    const itemsXml = products
      .filter(isFeedEligible)
      .filter((product) => {
        if (!currency) return true;
        return (product.currency || 'USD').toUpperCase() === currency;
      })
      .map((product) => {
        const sku = escapeXml(formatValidSku(product));
        const title = escapeXml(product.title || 'Product');

        // GMC caps description at 5000 characters
        const rawDesc = product.description || product.title || '';
        const description = escapeXml(
          rawDesc.length > 5000 ? rawDesc.substring(0, 4997) + '...' : rawDesc
        );

        const link = escapeXml(`${BASE_URL}/products/${encodeURIComponent(product.slug)}`);
        const productCurrency = (product.currency || 'USD').toUpperCase();
        const price = `${Number(product.price).toFixed(2)} ${productCurrency}`;
        const availability = product.inStock === false ? 'out_of_stock' : 'in_stock';
        const condition = mapConditionToGmc(product.condition);
        const brand = escapeXml(product.brand || 'Tazoota');
        const category = escapeXml(product.category || 'Home & Garden');
        const googleProductCategory = getGoogleProductCategory(product.category);
        const imageLink = escapeXml(new URL(product.images[0], BASE_URL).toString());

        // Additional image links (GMC supports up to 10 extra images)
        const additionalImages = (product.images || [])
          .slice(1, 11)
          .map((img) => {
            try {
              return `\n      <g:additional_image_link>${escapeXml(new URL(img, BASE_URL).toString())}</g:additional_image_link>`;
            } catch { return ''; }
          })
          .join('');

        // GTIN / MPN — conditional: only emit identifier_exists=yes if we have real identifiers
        const hasGtin = product.meta?.gtin && String(product.meta.gtin).length >= 8;
        const hasMpn = product.meta?.mpn && String(product.meta.mpn).length >= 1;
        const identifierXml = hasGtin
          ? `\n      <g:gtin>${escapeXml(String(product.meta!.gtin))}</g:gtin>\n      <g:identifier_exists>yes</g:identifier_exists>`
          : hasMpn
            ? `\n      <g:mpn>${escapeXml(String(product.meta!.mpn))}</g:mpn>\n      <g:identifier_exists>yes</g:identifier_exists>`
            : `\n      <g:identifier_exists>no</g:identifier_exists>`;

        // priceValidUntil: 1 year from today (required by GMC)
        const priceValidUntil = new Date();
        priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);
        const priceValidUntilStr = priceValidUntil.toISOString().slice(0, 10);

        return `
    <item>
      <g:id>${sku}</g:id>
      <title>${title}</title>
      <description>${description}</description>
      <link>${link}</link>
      <g:image_link>${imageLink}</g:image_link>${additionalImages}
      <g:price>${price}</g:price>
      <g:availability>${availability}</g:availability>
      <g:condition>${condition}</g:condition>
      <g:brand>${brand}</g:brand>
      <g:product_type>${category}</g:product_type>
      <g:google_product_category>${googleProductCategory}</g:google_product_category>
      <g:custom_label_0>${escapeXml(product.condition || 'New')}</g:custom_label_0>
      <g:return_policy_label>default_return_policy</g:return_policy_label>
      <g:price_valid_until>${priceValidUntilStr}</g:price_valid_until>${identifierXml}${buildShippingXml(targetCountries, productCurrency)}
    </item>`;
      })
      .join('');

    const targetLabel = country ? ` (${country})` : ' (GB + US)';
    const currencyLabel = currency ? ` in ${currency}` : '';
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Tazoota Google Merchant Center Feed${targetLabel}${currencyLabel}</title>
    <link>${BASE_URL}</link>
    <description>Selected Tazoota products for ${country || 'United Kingdom and United States'}${currencyLabel}</description>
    ${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } catch (error) {
    console.error('Error generating GMC feed:', error);
    return new NextResponse('Error generating feed', { status: 500 });
  }
}

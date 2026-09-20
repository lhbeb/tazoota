import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

function escapeCsv(value: string | number | null | undefined): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const HEADERS = [
  'Title', 'URL handle', 'Description', 'Vendor', 'Product category', 'Type', 'Tags',
  'Published on online store', 'Status', 'SKU', 'Barcode',
  'Option1 name', 'Option1 value', 'Option1 Linked To',
  'Option2 name', 'Option2 value', 'Option2 Linked To',
  'Option3 name', 'Option3 value', 'Option3 Linked To',
  'Price', 'Compare-at price', 'Cost per item', 'Charge tax', 'Tax code',
  'Unit price total measure', 'Unit price total measure unit',
  'Unit price base measure', 'Unit price base measure unit',
  'Inventory tracker', 'Inventory quantity', 'Continue selling when out of stock',
  'Weight value (grams)', 'Weight unit for display', 'Requires shipping', 'Fulfillment service',
  'Product image URL', 'Image position', 'Image alt text', 'Variant image URL',
  'Gift card', 'SEO title', 'SEO description',
  'Color (product.metafields.shopify.color-pattern)',
  'Google Shopping / Google product category', 'Google Shopping / Gender',
  'Google Shopping / Age group', 'Google Shopping / Manufacturer part number (MPN)',
  'Google Shopping / Ad group name', 'Google Shopping / Ads labels',
  'Google Shopping / Condition', 'Google Shopping / Custom product',
  'Google Shopping / Custom label 0', 'Google Shopping / Custom label 1',
  'Google Shopping / Custom label 2', 'Google Shopping / Custom label 3',
  'Google Shopping / Custom label 4',
];

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(request: NextRequest) {
  // Simple auth check
  const token = request.cookies.get('admin_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('slug, title, description, price, original_price, brand, category, images, meta, checkout_flow')
    .order('title');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows: string[] = [HEADERS.join(',')];

  for (const product of products || []) {
    const handle = slugify(product.title);
    const images: string[] = Array.isArray(product.images) ? product.images : [];
    const compareAt = product.original_price ? String(Number(product.original_price).toFixed(2)) : '';
    const price = String(Number(product.price || 0).toFixed(2));
    const sku = `TAZOOTA-${handle.substring(0, 30).toUpperCase()}`;

    // First row — full product data
    const firstRow = [
      escapeCsv(product.title),
      escapeCsv(handle),
      escapeCsv((product.description || '').replace(/<[^>]+>/g, '').substring(0, 5000)),
      escapeCsv(product.brand || 'Tazoota'),
      escapeCsv(''),                          // Product category
      escapeCsv(product.category || ''),      // Type
      escapeCsv(''),                          // Tags
      'TRUE',                                 // Published
      'active',                               // Status
      escapeCsv(sku),                         // SKU
      '',                                     // Barcode
      'Title',                                // Option1 name
      'Default Title',                        // Option1 value
      '',                                     // Option1 Linked To
      '', '', '',                             // Option2
      '', '', '',                             // Option3
      price,                                  // Price
      compareAt,                              // Compare-at price
      '',                                     // Cost per item
      'TRUE',                                 // Charge tax
      '',                                     // Tax code
      '', '', '', '',                         // Unit price
      'shopify',                              // Inventory tracker
      '100',                                  // Inventory quantity
      'DENY',                                 // Continue selling when out of stock
      '1000',                                 // Weight (grams)
      'g',                                    // Weight unit
      'TRUE',                                 // Requires shipping
      'manual',                               // Fulfillment service
      escapeCsv(images[0] || ''),             // Product image URL
      '1',                                    // Image position
      escapeCsv(product.title),              // Image alt text
      '',                                     // Variant image URL
      'FALSE',                                // Gift card
      escapeCsv(product.title),              // SEO title
      escapeCsv((product.description || '').replace(/<[^>]+>/g, '').substring(0, 320)),
      '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    ];

    rows.push(firstRow.join(','));

    // Additional image rows (position 2+)
    for (let i = 1; i < images.length; i++) {
      const imageRow = [
        '',                        // Title (empty for additional rows)
        escapeCsv(handle),
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '', '',
        '', '', '', '', '', '',
        escapeCsv(images[i]),      // Product image URL
        String(i + 1),             // Image position
        escapeCsv(product.title),
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
      ];
      rows.push(imageRow.join(','));
    }
  }

  const csv = rows.join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="tazoota-shopify-import.csv"',
    },
  });
}

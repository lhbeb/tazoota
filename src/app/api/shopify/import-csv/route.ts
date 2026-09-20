import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

function normalize(title: string): string {
  return (title || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] || '').trim();
    });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export async function POST(request: NextRequest) {
  // Auth check
  const token = request.cookies.get('admin_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const csvText = await file.text();
  const rows = parseCSV(csvText);

  if (rows.length === 0) {
    return NextResponse.json({ error: 'CSV is empty or invalid' }, { status: 400 });
  }

  // Shopify export CSV columns we need:
  // "Title", "URL handle", "Variant ID", "Option1 Value", "Price"
  // The Variant ID column is typically "Variant ID" in Shopify exports
  
  // Fetch all Supabase products
  const { data: supabaseProducts, error } = await supabaseAdmin
    .from('products')
    .select('slug, title, meta');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Build lookup: normalized title → slug
  const titleToSlug = new Map<string, string>();
  for (const p of supabaseProducts || []) {
    titleToSlug.set(normalize(p.title), p.slug);
  }

  // Also build handle → slug lookup (Shopify handle often matches our slug)
  const handleToSlug = new Map<string, string>();
  for (const p of supabaseProducts || []) {
    handleToSlug.set(p.slug, p.slug);
  }

  const results = { updated: 0, notFound: 0, skipped: 0, details: [] as any[] };

  // Group rows by title/handle to get first variant ID per product
  const productMap = new Map<string, { variantId: string; productId: string; title: string; handle: string }>();

  for (const row of rows) {
    const title = row['Title'] || '';
    const handle = row['URL handle'] || row['Handle'] || '';
    const variantId = row['Variant ID'] || row['ID'] || '';
    const productId = row['Product ID'] || '';

    if (!variantId) continue;

    // Use handle or title as key — only store first variant per product
    const key = handle || normalize(title);
    if (key && !productMap.has(key)) {
      productMap.set(key, { variantId, productId, title, handle });
    }
  }

  // Match and update Supabase
  for (const [key, shopifyData] of productMap) {
    // Try handle match first, then title match
    let slug = handleToSlug.get(key) ||
      titleToSlug.get(normalize(shopifyData.title)) ||
      titleToSlug.get(key.replace(/-/g, ' '));

    if (!slug) {
      results.notFound++;
      results.details.push({ key, title: shopifyData.title, status: 'not_found' });
      continue;
    }

    // Get existing meta
    const existing = supabaseProducts?.find(p => p.slug === slug);
    const existingMeta = existing?.meta || {};

    const { error: updateError } = await supabaseAdmin
      .from('products')
      .update({
        meta: {
          ...existingMeta,
          shopify_variant_id: shopifyData.variantId,
          ...(shopifyData.productId ? { shopify_product_id: shopifyData.productId } : {}),
          shopify_store_domain: 'tazoota.myshopify.com',
        },
        checkout_flow: 'shopify',
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug);

    if (updateError) {
      results.details.push({ slug, status: 'error', error: updateError.message });
    } else {
      results.updated++;
      results.details.push({ slug, variantId: shopifyData.variantId, status: 'updated' });
    }
  }

  return NextResponse.json({ success: true, results });
}

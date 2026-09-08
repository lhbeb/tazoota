import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../imports/norton-2026-09-06/', import.meta.url));
const envPath = process.argv[2];
if (!envPath) throw new Error('Usage: node scripts/import-norton.mjs <Tazoota env file> [--apply]');
const env = {};
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const match = line.match(/^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
  if (match) env[match[1]] = match[2].replace(/^(["'])(.*)\1$/, '$2');
}
const base = env.TAZOOTA_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.TAZOOTA_SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) throw new Error('Tazoota Supabase URL or service-role key is missing');
const headers = { apikey: key, Authorization: `Bearer ${key}` };
async function api(route, options = {}) {
  const res = await fetch(base + route, { ...options, headers: { ...headers, ...options.headers }, signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${(await res.text()).slice(0,400)}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
const products = JSON.parse(fs.readFileSync(path.join(root, 'products.json'), 'utf8'));
for (const product of products) {
  product.slug = decodeURIComponent(product.slug).replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'image-manifest.json'), 'utf8'));
const existing = [];
for (let offset = 0; ; offset += 1000) {
  const rows = await api(`/rest/v1/products?select=id,slug,title,meta,payee_email&limit=1000&offset=${offset}&order=id`);
  existing.push(...rows);
  if (rows.length < 1000) break;
}
if (!(env.NEXT_PUBLIC_BASE_URL || env.APP_BASE_URL || '').includes('tazoota.com') &&
    !existing.some(e => e.payee_email === 'admin@tazoota.com')) throw new Error('Unable to verify Tazoota database');
const normalize = value => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const pending = products.filter(p => !existing.some(e => e.slug === p.slug || e.meta?.source_url === p.source_url || normalize(e.title) === normalize(p.title)));
for (const p of pending) for (const image of p.images) {
  if (!manifest[image] || !fs.existsSync(path.join(root, 'images', manifest[image]))) throw new Error('Missing local image for ' + p.slug);
}
console.log(JSON.stringify({ existing: existing.length, pending: pending.length, skipped: products.length - pending.length }));
if (process.argv.includes('--apply')) {
const bucket = await api('/storage/v1/bucket/product-images');
if (!bucket.public) throw new Error('Product images bucket must already be public');
const reportPath = path.join(root, 'import-report.json');
const report = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf8')) : [];
const previousCount = report.length;
for (const p of pending) {
  const images = [];
  for (const source of p.images) {
    const name = manifest[source];
    const object = `norton-2026-09-06/${name}`;
    const mime = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[path.extname(name)];
    if (!mime) throw new Error('Unsupported image type ' + name);
    // Content-derived paths make retries safe; only this import prefix is written.
    await api('/storage/v1/object/product-images/' + object, {
      method: 'POST', headers: { 'Content-Type': mime, 'x-upsert': 'true' }, body: fs.readFileSync(path.join(root, 'images', name)),
    });
    images.push(base + '/storage/v1/object/public/product-images/' + object);
  }
  const brand = p.brand || ['John Deere', 'Bad Boy', 'Ariens', 'Greenworks', 'RYOBI', 'Toro', 'DEWALT', 'Honda', 'EGO', 'Makita', 'Cub Cadet', 'Craftsman'].find(b => p.title.toLowerCase().includes(b.toLowerCase())) || '';
  const row = {
    id: p.slug, slug: p.slug, title: p.title, description: p.description, price: p.price,
    currency: p.currency, images, condition: 'Brand New', category: p.category, brand,
    payee_email: 'admin@tazoota.com', checkout_link: '', checkout_flow: 'paypal-direct',
    rating: 0, review_count: 0, reviews: [], in_stock: p.availability.endsWith('/InStock'),
    is_featured: false, original_price: p.original_price, published: true,
    collections: [/pressure washer/i.test(p.category + p.title) ? 'power-tools' : 'lawn-garden'],
    meta: { published: true, sku: String(p.sku), source_url: p.source_url, source_images: p.images,
      specifications: p.specifications, missing_source_description: Boolean(p.missing_source_description), import_batch: 'norton-2026-09-06' },
  };
  const inserted = await api('/rest/v1/products', { method: 'POST', headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(row) });
  if (inserted?.[0]?.slug !== p.slug || inserted[0].images.length !== images.length) throw new Error('Insert verification failed');
  report.push({ slug: p.slug, id: inserted[0].id, images: images.length });
  fs.writeFileSync(path.join(root, 'import-report.json'), JSON.stringify(report, null, 2));
  console.log('IMPORTED', p.slug);
}
console.log('Imported and verified this run:', report.length - previousCount);
}

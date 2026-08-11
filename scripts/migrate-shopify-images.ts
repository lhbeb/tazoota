import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.TAZOOTA_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.TAZOOTA_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing TAZOOTA_SUPABASE_URL or TAZOOTA_SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET_NAME = 'product-images';

function getExtensionFromUrl(url: string): string {
  const pathname = new URL(url).pathname;
  const match = pathname.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1].toLowerCase() : 'jpg';
}

function getContentType(ext: string): string {
  const types: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    avif: 'image/avif',
  };
  return types[ext] || 'image/jpeg';
}

async function ensureBucket() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    throw new Error(`Failed to list buckets: ${listError.message}`);
  }
  if (!buckets.some((b) => b.name === BUCKET_NAME)) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
    });
    if (createError) {
      throw new Error(`Failed to create bucket ${BUCKET_NAME}: ${createError.message}`);
    }
    console.log(`Created bucket ${BUCKET_NAME}`);
  }
}

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status}) for ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadToSupabase(buffer: Buffer, productSlug: string, index: number, ext: string): Promise<string> {
  const cleanSlug = productSlug.replace(/[^a-zA-Z0-9-_]/g, '-');
  const fileName = `img${index + 1}.${ext === 'jpeg' ? 'jpg' : ext}`;
  const storagePath = `${cleanSlug}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, buffer, {
      cacheControl: '3600',
      upsert: true,
      contentType: getContentType(ext),
    });

  if (uploadError) {
    throw new Error(`Storage upload failed for ${storagePath}: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
  if (!data?.publicUrl) {
    throw new Error(`Unable to retrieve public URL for ${storagePath}`);
  }
  return data.publicUrl;
}

async function migrateImages() {
  console.log('Fetching products with Shopify CDN images...');

  const { data: products, error } = await supabase
    .from('products')
    .select('slug, images, meta')
    .contains('images', ['cdn.shopify.com']);

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  let candidates = products || [];
  if (candidates.length === 0) {
    // contains may not work on array-of-text; fall back to fetching all and filtering
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('slug, images, meta');
    if (allError) {
      throw new Error(`Failed to fetch all products: ${allError.message}`);
    }
    candidates = (allProducts || []).filter((p) =>
      Array.isArray(p.images) && p.images.some((img: string) => img.includes('cdn.shopify.com'))
    );
  }

  console.log(`Found ${candidates.length} products with Shopify CDN images.`);

  let successCount = 0;
  let errorCount = 0;

  for (const product of candidates) {
    const imageUrls: string[] = Array.isArray(product.images) ? product.images : [];
    const newUrls: string[] = [];
    const failures: string[] = [];

    console.log(`Processing ${product.slug} (${imageUrls.length} images)...`);

    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      if (!url.includes('cdn.shopify.com')) {
        newUrls.push(url);
        continue;
      }
      try {
        const ext = getExtensionFromUrl(url);
        const buffer = await downloadImage(url);
        const publicUrl = await uploadToSupabase(buffer, product.slug, i, ext);
        newUrls.push(publicUrl);
        process.stdout.write(`  ok img${i + 1}\n`);
      } catch (err: any) {
        failures.push(`  FAILED img${i + 1}: ${err.message}`);
        newUrls.push(url);
        errorCount++;
      }
    }

    const meta = product.meta && typeof product.meta === 'object' ? { ...product.meta } : {};
    if (newUrls[0]) meta.ogImage = newUrls[0];

    const { error: updateError } = await supabase
      .from('products')
      .update({ images: newUrls, meta })
      .eq('slug', product.slug);

    if (updateError) {
      failures.push(`  DB update failed: ${updateError.message}`);
      errorCount++;
    } else if (failures.length === 0) {
      successCount++;
      console.log(`  updated ${product.slug}`);
    }

    failures.forEach((f) => console.error(f));
  }

  console.log(`\nMigration complete:`);
  console.log(`  Products fully migrated: ${successCount}`);
  console.log(`  Errors: ${errorCount}`);
}

migrateImages().catch((err) => {
  console.error(err);
  process.exit(1);
});
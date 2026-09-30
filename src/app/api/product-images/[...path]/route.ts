import { NextRequest, NextResponse } from 'next/server';

const BUCKET = 'product-images';
const CACHE_CONTROL = 'public, max-age=31536000, immutable';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function encodeStoragePath(path: string[]): string {
  return path.map((segment) => encodeURIComponent(segment)).join('/');
}

async function proxyProductImage(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { path } = await params;
    if (!Array.isArray(path) || path.length === 0 || path.some((segment) => !segment || segment === '.' || segment === '..' || segment.includes('\\'))) {
      return NextResponse.json({ error: 'Invalid image path' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      return NextResponse.json({ error: 'Image storage is not configured' }, { status: 500 });
    }

    const upstreamUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${BUCKET}/${encodeStoragePath(path)}`;
    const upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers: {
        accept: request.headers.get('accept') || 'image/avif,image/webp,image/*,*/*;q=0.8',
        ...(request.headers.has('range') ? { range: request.headers.get('range')! } : {}),
      },
      next: { revalidate: 60 * 60 * 24 * 30 },
    });

    if (!upstream.ok || (request.method !== 'HEAD' && !upstream.body)) {
      return NextResponse.json({ error: 'Image not found' }, { status: upstream.status === 404 ? 404 : 502 });
    }

    const headers = new Headers();
    headers.set('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
    headers.set('Cache-Control', CACHE_CONTROL);
    const contentLength = upstream.headers.get('content-length');
    if (contentLength) headers.set('Content-Length', contentLength);
    const contentRange = upstream.headers.get('content-range');
    if (contentRange) headers.set('Content-Range', contentRange);
    if (request.headers.has('range')) headers.set('Accept-Ranges', 'bytes');

    return new NextResponse(request.method === 'HEAD' ? null : upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    console.error('Product image proxy error:', error);
    return NextResponse.json({ error: 'Failed to load image' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyProductImage(request, context);
}

export async function HEAD(request: NextRequest, context: RouteContext) {
  return proxyProductImage(request, context);
}

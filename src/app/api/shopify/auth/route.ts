import { NextRequest, NextResponse } from 'next/server';

// GET /api/shopify/auth — initiates OAuth flow
export async function GET(request: NextRequest) {
  const shop = process.env.SHOPIFY_STORE_DOMAIN || 'tazoota.myshopify.com';
  const clientId = process.env.SHOPIFY_CLIENT_ID!;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tazoota.com';
  const redirectUri = `${baseUrl}/api/shopify/auth/callback`;

  const scopes = 'read_products,write_products';
  const nonce = Math.random().toString(36).substring(2);

  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${nonce}`;

  return NextResponse.redirect(authUrl);
}

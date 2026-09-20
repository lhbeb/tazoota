import { NextRequest, NextResponse } from 'next/server';

// GET /api/shopify/auth/callback — handles OAuth callback and stores access token
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const shop = searchParams.get('shop') || process.env.SHOPIFY_STORE_DOMAIN || 'tazoota.myshopify.com';

  if (!code) {
    return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
  }

  const clientId = process.env.SHOPIFY_CLIENT_ID!;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET!;

  // Exchange code for access token
  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    return NextResponse.json({ error: 'Failed to get access token', details: err }, { status: 500 });
  }

  const { access_token } = await tokenRes.json();

  // Return a page that shows the token so admin can copy it into env
  const html = `<!DOCTYPE html>
<html>
<head><title>Shopify Connected</title>
<style>body{font-family:sans-serif;max-width:600px;margin:40px auto;padding:20px}
.token{background:#f0f0f0;padding:12px;border-radius:6px;word-break:break-all;font-family:monospace;font-size:13px}
.btn{background:#0b2a17;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;margin-top:12px}
</style></head>
<body>
<h2>✅ Shopify Connected!</h2>
<p>Copy this access token and add it to your Vercel environment variables as <strong>SHOPIFY_API_ACCESS_TOKEN</strong>:</p>
<div class="token" id="token">${access_token}</div>
<button class="btn" onclick="navigator.clipboard.writeText('${access_token}');this.textContent='✅ Copied!'">Copy Token</button>
<hr style="margin:24px 0">
<p>After adding the token to Vercel env vars, go to the 
<a href="/admin/shopify-sync">Shopify Sync page</a> to push products and sync variant IDs.</p>
</body>
</html>`;

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
}

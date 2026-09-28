# Quick Shopify Sync Guide (2 Minutes)

This guide shows how to sync **any** Shopify store to Tazoota/Supabase in under 2 minutes.

## For Current Store: tazoota.myshopify.com

### Step 1: Get Your Access Token (30 seconds)

You already have from your Shopify app:
- Client ID: `YOUR_CLIENT_ID`
- Client Secret: `shpss_YOUR_CLIENT_SECRET`

Run this PowerShell command to get the `shpat_` token:

```powershell
$body = @{
    client_id = "YOUR_CLIENT_ID"
    client_secret = "shpss_YOUR_CLIENT_SECRET"
    grant_type = "client_credentials"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://tazoota.myshopify.com/admin/oauth/access_token" -Method POST -Body $body -ContentType "application/json"
$response.access_token
```

**Copy the `shpat_` token that appears!**

### Step 2: Run the Sync (1-2 minutes)

```bash
cd "c:\Users\mehdi\OneDrive\Desktop\my websites all\tazoota.com"

node scripts/shopify-full-sync.mjs \
  --store=tazoota.myshopify.com \
  --token=shpat_YOUR_TOKEN_HERE \
  --supabase-url=https://uozcmaheslvjrwfxfzip.supabase.co \
  --supabase-key=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

**That's it!** The script will:
- ✅ Match existing Shopify products to Supabase by title
- ✅ Create missing products in Shopify automatically
- ✅ Set all products to "never out of stock" (inventory_policy: continue)
- ✅ Write `shopify_variant_id` back to Supabase `products.meta`
- ✅ Set `checkout_flow = 'shopify'` for all synced products

---

## For Any Future Store (Same 2 Steps)

### Step 1: Create Shopify Custom App

1. Go to: `Settings` → `Apps and sales channels` → `Develop apps`
2. Click **"Create an app"**
3. Name it: `tazoota-sync` (or anything)
4. Click **"Configure Admin API scopes"**
5. Check these scopes:
   - ✅ `read_products`
   - ✅ `write_products`
   - ✅ `write_inventory` (optional)
6. Click **"Save"** → **"Install app"**
7. Copy the **Client ID** and **Client Secret**

### Step 2: Get Token with PowerShell

```powershell
$body = @{
    client_id = "YOUR_CLIENT_ID"
    client_secret = "YOUR_CLIENT_SECRET"
    grant_type = "client_credentials"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://YOUR_STORE.myshopify.com/admin/oauth/access_token" -Method POST -Body $body -ContentType "application/json"
$response.access_token
```

### Step 3: Run Sync

```bash
node scripts/shopify-full-sync.mjs \
  --store=YOUR_STORE.myshopify.com \
  --token=shpat_XXXXXX \
  --supabase-url=https://xxx.supabase.co \
  --supabase-key=service_role_key
```

---

## Using Environment Variables (Optional)

Instead of passing args, you can set env vars in `.env.local`:

```env
SHOPIFY_STORE_DOMAIN=tazoota.myshopify.com
SHOPIFY_API_ACCESS_TOKEN=shpat_xxxxx
NEXT_PUBLIC_SUPABASE_URL=https://uozcmaheslvjrwfxfzip.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Then just run:

```bash
node scripts/shopify-full-sync.mjs
```

---

## What Happens During Sync

```
🚀 Shopify Full Sync
   Store:    tazoota.myshopify.com
   Supabase: https://uozcmaheslvjrwfxfzip.supabase.co

📦 Fetching Supabase products...
   Found 150 products

🛍️  Fetching Shopify products...
   Found 38 products

✅ [matched] ninja-professional-blender → variant 48829384123456
✅ [created] keurig-k-elite-coffee-maker → variant 48829384234567
✅ [matched] instant-pot-duo-7-in-1 → variant 48829384345678
...

=== SYNC COMPLETE ===
✅ Matched:         38
✅ Created:         112
⏭  Skipped:         0
🔧 Inventory fixed: 150
❌ Failed:          0
```

---

## Troubleshooting

### Error: "401 Unauthorized"
**Solution**: Your token expired or is invalid. Regenerate using the PowerShell command above.

### Error: "Missing required config"
**Solution**: Make sure you passed all 4 arguments or set all env vars.

### Error: "rate limit"
**Solution**: The script already has 300ms delays. If you still hit limits, Shopify will return a 429 - just wait 1 minute and re-run.

### Products don't match
**Solution**: The script matches by normalized title (lowercase, no special chars). If titles are very different, manually update one side or adjust the `normalize()` function.

---

## Re-Running the Sync

Safe to run multiple times! The script:
- ✅ Skips products already synced to the current store
- ✅ Updates variant IDs if products moved
- ✅ Won't create duplicates in Shopify

Run it again whenever:
- You add new products to Supabase
- You need to verify sync status
- You change Shopify stores

---

**Total Time**: ~2 minutes per store
**No OAuth redirects, no browser, no manual clicking!**

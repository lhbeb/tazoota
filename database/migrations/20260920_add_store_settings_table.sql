-- Migration: Add store_settings table
-- Date: 2026-09-20
-- Purpose: Store per-store config (Shopify credentials, etc.) in Supabase
--          so no Vercel env var changes are needed when switching stores.

CREATE TABLE IF NOT EXISTS public.store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default Tazoota config
-- NOTE: Fill in api_access_token after generating via Shopify OAuth
INSERT INTO public.store_settings (key, value, description) VALUES
(
  'shopify',
  '{
    "store_domain": "tazoota.myshopify.com",
    "api_access_token": "",
    "client_id": "74c50d8a22f4dfe3d291316a59d7baee",
    "api_version": "2024-01"
  }',
  'Shopify store credentials and configuration'
),
(
  'store',
  '{
    "name": "Tazoota",
    "domain": "tazoota.com",
    "currency": "USD",
    "default_checkout_flow": "shopify"
  }',
  'General store configuration'
)
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      updated_at = NOW();

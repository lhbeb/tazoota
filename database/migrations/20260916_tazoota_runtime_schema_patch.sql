-- Tazoota runtime schema patch for the chunked Bricoc-parity upgrade.
-- Safe to run multiple times in Supabase SQL Editor.

BEGIN;

-- 1) Orders: Stripe hosted/embedded checkout tracking.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending_payment',
  ADD COLUMN IF NOT EXISTS payment_provider text,
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_status text,
  ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS payment_last_error text,
  ADD COLUMN IF NOT EXISTS checkout_expires_at timestamp with time zone;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_stripe_checkout_session_id_key'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_stripe_checkout_session_id_key
      UNIQUE (stripe_checkout_session_id);
  END IF;
END $$;

-- 2) Payment settings: store Stripe webhook signing secret securely server-side.
ALTER TABLE public.payment_settings
  ADD COLUMN IF NOT EXISTS webhook_secret text;

COMMENT ON COLUMN public.payment_settings.webhook_secret
IS 'Stripe webhook signing secret used server-side to verify incoming Stripe webhook signatures.';

-- 3) Products: allow the new Stripe Hosted checkout flow.
DO $$
DECLARE
  constraint_record record;
BEGIN
  FOR constraint_record IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = con.connamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname = 'products'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%checkout_flow%'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.products DROP CONSTRAINT %I',
      constraint_record.conname
    );
  END LOOP;
END $$;

ALTER TABLE public.products
  ADD CONSTRAINT products_checkout_flow_check
  CHECK (
    checkout_flow IS NULL OR checkout_flow IN (
      'buymeacoffee',
      'kofi',
      'external',
      'stripe',
      'stripe-hosted',
      'paypal-invoice',
      'paypal-unclaimed',
      'paypal-direct',
      'paypal-api',
      'lemon-squeezy'
    )
  );

COMMIT;

-- Verification queries:
SELECT checkout_flow, COUNT(*) AS product_count
FROM public.products
GROUP BY checkout_flow
ORDER BY checkout_flow;

SELECT
  EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'payment_settings'
      AND column_name = 'webhook_secret'
  ) AS payment_settings_has_webhook_secret,
  EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'stripe_checkout_session_id'
  ) AS orders_has_stripe_session_id;

-- Add a dedicated Shopify Checkout redirect flow.
-- This migration changes only the allowed enum-like CHECK constraint; it does
-- not update any existing product checkout_flow values.

BEGIN;

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
            'shopify',
            'paypal-invoice',
            'paypal-unclaimed',
            'paypal-direct',
            'paypal-api',
            'lemon-squeezy'
        )
    );

COMMIT;

-- Verify only after applying the migration:
-- SELECT checkout_flow, COUNT(*) AS product_count
-- FROM public.products
-- GROUP BY checkout_flow
-- ORDER BY checkout_flow;

# Tazoota Stripe Checkout Conversion Audit

## Executive conclusion

Tazoota is not yet at a maximum-conversion state. The largest issue is not visual polish; it is architectural inconsistency between the legacy Stripe Embedded Checkout flow and the newer PaymentIntent/Elements flow. The current checkout contains both models, and several components, props, and states do not share one authoritative lifecycle. Before optimizing copy or colors, Tazoota should complete one unified Stripe Elements flow and make the webhook the only authority for payment success.

The most serious conversion and revenue risks are the following:

1. The customer must complete address verification and order saving before the payment experience is fully available. This adds a sequential step instead of presenting address and payment together.
2. Tazoota's product page currently shows a generic Buy Now CTA rather than a real Stripe wallet-payment CTA.
3. The thank-you page treats a visit without a `session_id` as a successful payment. That is unsafe for PaymentIntent/Elements flows and can fire a purchase conversion before Stripe has confirmed payment.
4. The `payment_intent.succeeded` handler updates the order but can send duplicate payment emails when Stripe retries the same event because there is no durable notification idempotency marker.
5. The checkout source contains mixed Embedded Checkout and Elements references. This must be resolved and compile-tested before any conversion experiment is trusted.

## Current flow as audited

For a Stripe product, Tazoota currently follows this sequence:

```text
Product page
  -> generic Buy Now button
  -> cart/local-storage state
  -> checkout address form
  -> client-side address validation
  -> send-shipping-email endpoint saves an order intent
  -> create-payment-intent updates an existing PaymentIntent
  -> Stripe Elements is shown or enabled
  -> payment confirmation
  -> Stripe webhook updates the order
  -> thank-you page and advertising tracking
```

The source still contains the older Embedded Checkout component and old CheckoutFlowView branching. At the same time, `CheckoutShippingStep` contains newer Stripe Elements-oriented state and payment-panel logic. This mixed state makes the checkout difficult to reason about and creates a risk that the deployed application is not using the same path that was recently audited.

## Conversion-impact findings

| Priority | Finding | Conversion impact | Required response |
|---|---|---|---|
| P0 | Thank-you page treats missing `session_id` as success | Can show success and fire Purchase tracking before payment confirmation | Require a verified paid order or verified PaymentIntent before success/tracking |
| P0 | Payment-success emails are not durably deduplicated | Stripe webhook retries can create duplicate notifications and operational confusion | Add notification/event idempotency keyed by Stripe event ID or PaymentIntent ID |
| P0 | Embedded Checkout and Elements architectures coexist | Customers can receive inconsistent layouts and failures; debugging is difficult | Choose Elements as default and isolate Hosted/legacy fallback explicitly |
| P1 | Payment is not fully available while address is being entered | Adds friction and delays payment discovery | Mount Express Checkout and PaymentElement immediately; lock confirmation only |
| P1 | Product page has no real wallet CTA | Loses high-intent Apple Pay, Google Pay, and Link users | Add a Stripe Express Checkout CTA that routes to `/checkout` |
| P1 | Address saving and PaymentIntent linking are coupled late in the flow | An order may be saved while payment initialization fails | Create a clear pending-payment state and allow safe retry without duplicate orders |
| P1 | Address errors still use browser alerts in several paths | Alerts interrupt the flow and do not identify the field to fix | Use field-level inline errors, focus, scroll, and an `aria-live` summary |
| P1 | Mobile payment rendering depends on client secret after verification | The customer sees a form-first experience and then a new payment experience | Keep the payment container mounted from initial render with a locked state |
| P2 | Product page has one generic Buy Now CTA for non-PayPal flows | Does not communicate the payment method or wallet speed | Use a method-specific Stripe wallet CTA plus a standard checkout fallback |
| P2 | Payment trust messaging is repeated and generic | Uses space without reducing uncertainty effectively | Replace repetition with concise accepted-method, returns, shipping, and support reassurance |
| P2 | No durable abandonment/recovery state is visible to the customer | Failed or abandoned sessions may require restarting | Preserve cart and pending order; allow payment retry with a new or reusable intent |

## Highest-risk tracking defect

The thank-you page currently defines success as follows:

```ts
const isStaticSuccess = !sessionId;
const isSuccessful = isStaticSuccess || orderDetails?.status === 'paid';
```

It also loads the pending order and fires a Purchase event whenever there is no `session_id`. This is appropriate only for redirect providers whose return URL itself is a trusted success signal. It is not safe for Stripe Elements because the Elements return URL can contain no Checkout Session ID. A customer can reach the page after an incomplete, canceled, or interrupted payment and still trigger a purchase event.

The target behavior is:

```text
PaymentIntent succeeds at Stripe
  -> webhook verifies and marks order paid
  -> thank-you page verifies the order/payment status
  -> Purchase event fires once using order ID as event ID
```

Until this is fixed, conversion reporting is not reliable and the success page can misrepresent payment status to the customer.

## Target architecture for maximum conversion

### Unified checkout state

Use one Stripe Elements checkout for the `stripe` flow. Keep `stripe-hosted` as a deliberately separate fallback rather than allowing Embedded Checkout and Elements to compete for the same state.

The unified state should include:

- `paymentIntentId`
- `clientSecret`
- `orderId`
- `isAddressVerified`
- `verifiedAddressSignature`
- `paymentStatus`
- `paymentError`
- `isSubmittingAddress`
- `isConfirmingPayment`

The address signature should be recalculated from every relevant address and email field. Any change after verification must re-lock payment and require verification again.

### Desktop experience

Use a two-column layout:

```text
Left: delivery address, inline validation, Verify Address, verified state
Right: Apple Pay / Google Pay / Link, PaymentElement, payment action, concise reassurance
```

The right column should exist on first render. Before address verification, the Elements UI remains visible but confirmation is blocked. After verification, the existing UI unlocks in place without replacing the page.

### Mobile experience

Use this order:

```text
Product summary
Delivery address
Verify Address
Verified address state
Wallet options
Card payment fields
Pay button
```

Keep the payment panel mounted while the customer scrolls. A sticky mobile payment action must not cover Stripe fields and must respect the safe-area inset.

## Address-verification experience

The Verify Address action should perform the following sequence:

1. Validate required fields locally.
2. Focus and scroll to the first invalid field when validation fails.
3. Validate the same fields server-side.
4. Validate product availability and current server-side price.
5. Create or reuse one pending order intent.
6. Attach the order ID and shipping data to the PaymentIntent.
7. Send an order-intent notification once, not once per click.
8. Mark the address verified in the UI.
9. Unlock Stripe confirmation.

The customer should see one clear state message:

> Address verified. Your order is saved and payment is ready.

Avoid browser alerts for normal validation. Alerts should be reserved for exceptional failures that cannot be represented inline.

## Product-page wallet CTA

For products whose checkout flow is `stripe`, replace the current generic desktop Buy Now CTA with a real `ExpressCheckoutElement` area. The product page should not attempt to complete the purchase because it does not yet have a verified delivery address.

Recommended behavior:

```text
Product page wallet CTA
  -> add product and selected variant to cart
  -> navigate immediately to /checkout
  -> mount wallet and card Elements
  -> verify address
  -> complete payment
```

The product-page CTA should contain no redundant product-summary panel, seller repetition, or long explanatory notice. It should render the wallet buttons when the device and browser support them and fall back cleanly to the normal checkout action when they do not.

The product page must preserve:

- Product slug.
- Quantity.
- Selected size or variant.
- Currency.
- Checkout flow.
- Current cart state.

## PaymentIntent and server safeguards

The PaymentIntent endpoint must never trust browser prices. It should load the product by slug, validate stock, calculate the amount from the database, and use the configured currency. It should support initial creation and verified-address update as separate operations.

PaymentIntent metadata should include at least:

- `order_id`
- `product_slug`
- `product_id`
- `checkout_flow`

The order must reference the PaymentIntent ID before payment confirmation. If the address changes, update the intent while it is incomplete. If the amount or currency changes, create a new intent and mark the old one abandoned rather than trying to reuse an incompatible intent.

## Webhook requirements

The webhook should remain authoritative. Required behavior:

- `payment_intent.succeeded`: mark the matching order paid and record the PaymentIntent ID and paid timestamp.
- `payment_intent.payment_failed`: preserve the order for retry and store the customer-safe failure state.
- `payment_intent.canceled`: mark the pending order canceled unless it is already paid.
- `checkout.session.completed`: retain for Hosted/legacy flows during the migration period.
- `checkout.session.expired`: expire only unpaid orders.

Every event handler must be idempotent. The success handler currently checks whether the order is paid before updating it, but it still calls the payment-success email function afterward. That means a redelivered success event can send another email. Add a durable field or event table that records the processed PaymentIntent/event before sending notifications.

## Payment failure and retry UX

When payment fails, keep the customer on the same checkout page and preserve the address. Show a concise message such as:

> Payment could not be completed. Check your payment details or choose another payment method.

The customer should be able to retry without recreating the cart or retyping the address. A new PaymentIntent should be created only when Stripe requires it.

## Trust and friction reduction

The checkout should show only useful reassurance near payment:

- Accepted payment methods.
- Free shipping if operationally true.
- Delivery estimate consistent with the shipping policy.
- Return-policy link.
- Contact/live-chat access.
- Stripe-secured payment language that does not overpromise.

Remove duplicated headings, repeated product summaries, unnecessary seller repetition, and long generic security copy. Every extra block should answer a real purchase objection.

## Measurement plan

Track the following events with one stable order/cart identifier:

1. Product view.
2. Add to cart.
3. Begin checkout.
4. Address verification started.
5. Address verification succeeded.
6. Payment form viewed.
7. Payment attempt.
8. Payment succeeded.
9. Payment failed.
10. Wallet CTA clicked.
11. Checkout abandoned.

Use the order ID as the Purchase event ID. Fire Purchase only after a verified paid order. Use session storage only as a browser-level duplicate guard; server-side payment state remains authoritative.

## Implementation order

### Step 1: Stabilize the current code

- Resolve all stale Embedded Checkout imports and Elements component references.
- Confirm the exact deployed checkout branch for `stripe` and `stripe-hosted`.
- Run TypeScript and production build from a clean clone.
- Add a browser test for each branch.

### Step 2: Fix payment truth and webhook idempotency

- Remove the no-`session_id` success assumption.
- Add PaymentIntent-based verification for Elements return URLs.
- Add durable notification deduplication.
- Test duplicate Stripe webhook delivery.

### Step 3: Finish the unified Elements checkout

- Create the intent early.
- Mount Elements immediately.
- Keep payment visible but locked before address verification.
- Update the intent after verification.
- Preserve the form on all recoverable errors.

### Step 4: Add the product-page wallet CTA

- Add Express Checkout for Stripe products.
- Route the CTA directly into checkout.
- Preserve variant and cart state.
- Provide a normal fallback where wallet methods are unavailable.

### Step 5: Optimize the experience

- Replace alerts with field-level errors.
- Improve focus and scroll behavior.
- Reduce redundant checkout copy.
- Test mobile sticky actions and wallet rendering.
- Add funnel instrumentation.

### Step 6: Validate real payment paths

Test cards, wallet-capable browsers, payment failures, canceled wallets, address edits, refreshes, webhook retries, delayed webhooks, duplicate clicks, and return from Stripe. Do not call the flow conversion-ready until every successful payment produces exactly one paid order, one payment-success notification set, and one Purchase event.

## Final audit verdict

Tazoota has a useful foundation, but it should not be treated as a maximum-conversion Stripe checkout yet. The highest-value work is to finish the Elements migration, remove the mixed architecture, correct the thank-you-page payment-truth bug, and make webhook processing idempotent. After those are complete, the product-page wallet CTA and detailed UX refinements can materially improve checkout initiation and completion without creating a second payment architecture.

## Audit evidence

The audit reviewed the following implementation areas:

- `src/app/checkout/page.tsx`
- `src/app/checkout/CheckoutShippingStep.tsx`
- `src/app/checkout/CheckoutFlowView.tsx`
- `src/components/StripeEmbeddedCheckout.tsx`
- `src/app/products/[slug]/ProductPageClient.tsx`
- `src/app/api/webhooks/stripe/route.ts`
- `src/app/thankyou/page.tsx`

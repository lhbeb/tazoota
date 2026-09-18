import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getOrderById, updateOrderStripeStatus } from '@/lib/supabase/orders';
import { getStripeConfig } from '@/lib/supabase/payment-settings';
import { getProductBySlug } from '@/lib/supabase/products';
import { isPostalCodeValid, normalizeShippingData } from '@/lib/shipping';

function stripeAmount(price: number): number {
  return Math.round(Number(price || 0) * 100);
}

function safeStripeError(error: any): string {
  console.error('[Stripe PaymentIntent] Error:', {
    type: error?.type,
    code: error?.code,
    message: error?.message,
  });

  const message = String(error?.message || '').toLowerCase();
  if (message.includes('secret') || message.includes('api_key') || message.includes('authentication')) {
    return 'Card payment is temporarily unavailable. Please try again or contact support.';
  }

  return 'Card payment is temporarily unavailable. Please try again or contact support.';
}

function validateShippingData(rawShippingData: any) {
  const shippingData = normalizeShippingData(rawShippingData || {});

  if (!shippingData.fullName?.trim()) return { error: 'Enter your full name.', shippingData };
  if (!shippingData.email?.trim()) return { error: 'Enter your email address.', shippingData };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingData.email)) {
    return { error: 'Enter a valid email address.', shippingData };
  }
  if (!shippingData.countryCode || !shippingData.country) return { error: 'Select a delivery country.', shippingData };
  if (!shippingData.streetAddress?.trim()) return { error: 'Enter a complete street address.', shippingData };
  if (!shippingData.city?.trim()) return { error: 'Enter a city.', shippingData };
  if (!shippingData.state?.trim()) return { error: 'Enter a state or region.', shippingData };
  if (!shippingData.zipCode?.trim()) return { error: 'Enter a postal code.', shippingData };
  if (!isPostalCodeValid(shippingData.zipCode, shippingData.countryCode)) {
    return { error: 'Enter a valid postal code for the selected delivery country.', shippingData };
  }

  shippingData.fullName = shippingData.fullName.trim();
  shippingData.email = shippingData.email.trim();
  return { shippingData };
}

export async function POST(request: NextRequest) {
  try {
    const stripeConfig = await getStripeConfig();
    const stripe = new Stripe(stripeConfig.secretKey || 'sk_test_placeholder', {
      apiVersion: '2026-01-28.clover' as any,
    });

    const body = await request.json();
    const productSlug = typeof body.productSlug === 'string'
      ? body.productSlug
      : typeof body.product?.slug === 'string'
        ? body.product.slug
        : '';

    if (!productSlug) {
      return NextResponse.json({ error: 'Missing product information.' }, { status: 400 });
    }

    const product = await getProductBySlug(productSlug);
    if (!product) {
      return NextResponse.json({ error: 'This product is no longer available for purchase.' }, { status: 404 });
    }

    if (product.inStock === false) {
      return NextResponse.json({ error: 'Sorry, this item is currently sold out.' }, { status: 409 });
    }

    if (product.checkoutFlow !== 'stripe') {
      return NextResponse.json({ error: 'This product is not configured for Stripe checkout.' }, { status: 400 });
    }

    const currency = (product.currency || 'USD').toLowerCase();
    const amount = stripeAmount(product.price);

    if (!amount || amount < 50) {
      return NextResponse.json({ error: 'This product cannot be paid by card right now.' }, { status: 400 });
    }

    let paymentIntent: Stripe.PaymentIntent;
    const existingIntentId = typeof body.paymentIntentId === 'string' ? body.paymentIntentId : '';

    if (existingIntentId) {
      paymentIntent = await stripe.paymentIntents.retrieve(existingIntentId);

      if (paymentIntent.status !== 'requires_payment_method' && paymentIntent.status !== 'requires_confirmation') {
        return NextResponse.json({ error: 'This payment can no longer be updated. Please refresh checkout.' }, { status: 409 });
      }

      if (paymentIntent.amount !== amount || paymentIntent.currency !== currency) {
        await stripe.paymentIntents.cancel(existingIntentId, { cancellation_reason: 'abandoned' });
        paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency,
          automatic_payment_methods: { enabled: true },
          metadata: {
            product_slug: product.slug,
            product_id: product.id,
            checkout_flow: 'stripe',
          },
        });
      }
    } else {
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: { enabled: true },
        metadata: {
          product_slug: product.slug,
          product_id: product.id,
          checkout_flow: 'stripe',
        },
      });
    }

    if (body.orderId) {
      const order = await getOrderById(body.orderId);
      if (!order) {
        return NextResponse.json({ error: 'Order could not be found. Please verify your address again.' }, { status: 400 });
      }
      if (order.product_slug !== product.slug) {
        return NextResponse.json({ error: 'Order does not match this product. Please start checkout again.' }, { status: 400 });
      }
      if (order.status === 'paid') {
        return NextResponse.json({ error: 'This order has already been paid.' }, { status: 409 });
      }
      if (order.checkout_flow !== 'stripe') {
        return NextResponse.json({ error: 'This order is assigned to a different checkout flow.' }, { status: 400 });
      }

      const { error, shippingData } = validateShippingData(body.shippingData);
      if (error) {
        return NextResponse.json({ error }, { status: 400 });
      }

      paymentIntent = await stripe.paymentIntents.update(paymentIntent.id, {
        receipt_email: shippingData.email,
        shipping: {
          name: shippingData.fullName || shippingData.email,
          address: {
            line1: shippingData.streetAddress,
            line2: shippingData.addressLine2 || undefined,
            city: shippingData.city,
            state: shippingData.state,
            postal_code: shippingData.zipCode,
            country: shippingData.countryCode,
          },
        },
        metadata: {
          ...(paymentIntent.metadata || {}),
          order_id: body.orderId,
          product_slug: product.slug,
          product_id: product.id,
          customer_email: shippingData.email,
        },
      });

      const linked = await updateOrderStripeStatus(body.orderId, {
        stripe_payment_intent_id: paymentIntent.id,
        stripe_payment_status: paymentIntent.status,
        status: 'pending_payment',
      });

      if (!linked) {
        throw new Error('Failed to link Stripe payment to order');
      }
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: safeStripeError(error) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { updateOrderStripeStatus, getOrderById } from '@/lib/supabase/orders';
import { getStripeConfig } from '@/lib/supabase/payment-settings';

// Stripe initialization deferred to handler to avoid build-time crashes

export async function POST(request: NextRequest) {
    try {
        // Initialize Stripe inside handler to defer until runtime (avoids Vercel build crash)
        const stripeConfig = await getStripeConfig();
        const stripe = new Stripe(stripeConfig.secretKey || 'sk_test_placeholder', {
            apiVersion: '2026-01-28.clover' as any,
        });

        const webhookSecret = (stripeConfig.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET || '').trim();

        const body = await request.text();
        const requestSignature = request.headers.get('stripe-signature');
        const headersList = await headers();
        const signature = requestSignature || headersList.get('stripe-signature');

        if (!signature) {
            console.error('[Stripe Webhook] No signature found');
            return NextResponse.json({ error: 'No signature' }, { status: 400 });
        }

        if (!webhookSecret) {
            console.error('[Stripe Webhook] Webhook signing secret is not configured');
            return NextResponse.json({ error: 'Webhook signing secret is not configured' }, { status: 500 });
        }

        // Verify webhook signature
        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error(
                '[Stripe Webhook] Signature verification failed:',
                err instanceof Error ? err.message : 'Unknown error'
            );
            return NextResponse.json(
                { error: 'Webhook signature verification failed' },
                { status: 400 }
            );
        }

        console.log('[Stripe Webhook] Event received:', event.type);

        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
                break;

            case 'checkout.session.expired':
                await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
                break;

            case 'checkout.session.async_payment_succeeded':
                await handleAsyncPaymentSucceeded(event.data.object as Stripe.Checkout.Session);
                break;

            case 'checkout.session.async_payment_failed':
                await handleAsyncPaymentFailed(event.data.object as Stripe.Checkout.Session);
                break;

            case 'payment_intent.succeeded':
                await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
                break;

            case 'payment_intent.payment_failed':
                await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
                break;

            case 'payment_intent.canceled':
                await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
                break;

            default:
                console.log('[Stripe Webhook] Unhandled event type:', event.type);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('[Stripe Webhook] Error processing webhook:', error);
        // Return 500 so Stripe redelivers the event (DB updates are idempotent).
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

// Handle successful checkout completion
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    console.log('[Stripe Webhook] Checkout completed:', session.id);
    
    if (session.metadata?.order_id) {
        if (session.payment_status === 'paid') {
            const paymentIntentId = typeof session.payment_intent === 'string' 
                ? session.payment_intent 
                : session.payment_intent?.id;
                
            const updated = await updateOrderStripeStatus(session.metadata.order_id, {
                status: 'paid',
                stripe_payment_intent_id: paymentIntentId,
                stripe_payment_status: session.payment_status,
                paid_at: new Date().toISOString()
            });
            if (!updated) {
                throw new Error(`Failed to mark order ${session.metadata.order_id} as paid`);
            }
            console.log('[Stripe Webhook] DB updated to PAID for order:', session.metadata.order_id);

            const { sendStripePaymentSuccessEmail } = await import('@/lib/email/sender');
            const order = await getOrderById(session.metadata.order_id);
            if (!order) {
                throw new Error(`Order ${session.metadata.order_id} not found for notification`);
            }

            if (!parseStripeEmailSent(order.full_order_data)) {
                const emailResult = await sendStripePaymentSuccessEmail(order, {
                    paymentIntentId,
                    amount: session.amount_total ?? undefined,
                    currency: session.currency ?? undefined,
                });
                if (!emailResult.success) {
                    throw new Error(`Payment notification email failed for order ${session.metadata.order_id}: ${emailResult.error}`);
                }
            } else {
                console.log('[Stripe Webhook] Payment notification already sent for order:', session.metadata.order_id);
            }
            console.log('[Stripe Webhook] Payment notification emails sent for order:', session.metadata.order_id);
        }
    }
}

// Handle expired checkout sessions
async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
    console.log('[Stripe Webhook] ✅ Checkout session EXPIRED:', session.id);
    
    if (session.metadata?.order_id) {
        const order = await getOrderById(session.metadata.order_id);
        if (!order) {
            throw new Error(`Order ${session.metadata.order_id} not found for expiry update`);
        }
        if (order.status === 'paid') {
            console.log('[Stripe Webhook] Order already paid; ignoring expired session:', session.metadata.order_id);
            return;
        }

        const updated = await updateOrderStripeStatus(session.metadata.order_id, {
            status: 'expired'
        });
        if (!updated) {
            throw new Error(`Failed to mark order ${session.metadata.order_id} as expired`);
        }
        console.log('[Stripe Webhook] DB updated to EXPIRED for order:', session.metadata.order_id);
    }
}

// Handle async payment success
async function handleAsyncPaymentSucceeded(session: Stripe.Checkout.Session) {
    console.log('[Stripe Webhook] Async payment succeeded:', session.id);
    if (session.metadata?.order_id) {
        const updated = await updateOrderStripeStatus(session.metadata.order_id, {
            status: 'paid',
            stripe_payment_status: 'paid',
            paid_at: new Date().toISOString()
        });
        if (!updated) {
            throw new Error(`Failed to mark order ${session.metadata.order_id} as paid (async)`);
        }

        const { sendStripePaymentSuccessEmail } = await import('@/lib/email/sender');
        const order = await getOrderById(session.metadata.order_id);
        if (!order) {
            throw new Error(`Order ${session.metadata.order_id} not found for notification`);
        }

        if (!parseStripeEmailSent(order.full_order_data)) {
            const emailResult = await sendStripePaymentSuccessEmail(order, {
                amount: session.amount_total ?? undefined,
                currency: session.currency ?? undefined,
            });
            if (!emailResult.success) {
                throw new Error(`Payment notification email failed for order ${session.metadata.order_id}: ${emailResult.error}`);
            }
        } else {
            console.log('[Stripe Webhook] Payment notification already sent for order:', session.metadata.order_id);
        }
    }
}

// Handle async payment failure
async function handleAsyncPaymentFailed(session: Stripe.Checkout.Session) {
    console.log('[Stripe Webhook] Async payment failed:', session.id);
    if (session.metadata?.order_id) {
        const updated = await updateOrderStripeStatus(session.metadata.order_id, {
            status: 'payment_failed',
            stripe_payment_status: 'failed'
        });
        if (!updated) {
            throw new Error(`Failed to mark order ${session.metadata.order_id} as payment_failed`);
        }
    }
}

// Handle payment intent failure
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    console.log('[Stripe Webhook] Payment failed:', paymentIntent.id);
    console.log('[Stripe Webhook] Failure reason:', paymentIntent.last_payment_error?.message);

    const orderId = paymentIntent.metadata?.order_id;
    if (!orderId) {
        console.log('[Stripe Webhook] PaymentIntent failed without order_id metadata:', paymentIntent.id);
        return;
    }

    const order = await getOrderById(orderId);
    if (!order) {
        throw new Error(`Order ${orderId} not found for payment failure update`);
    }
    if (order.status === 'paid') {
        console.log('[Stripe Webhook] Order already paid; ignoring payment failure:', orderId);
        return;
    }

    const updated = await updateOrderStripeStatus(orderId, {
        status: 'payment_failed',
        stripe_payment_intent_id: paymentIntent.id,
        stripe_payment_status: 'failed',
        payment_last_error: paymentIntent.last_payment_error?.message || undefined,
    });
    if (!updated) {
        throw new Error(`Failed to mark order ${orderId} as payment_failed`);
    }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    console.log('[Stripe Webhook] Payment succeeded:', paymentIntent.id);

    const orderId = paymentIntent.metadata?.order_id;
    if (!orderId) {
        console.log('[Stripe Webhook] PaymentIntent succeeded without order_id metadata:', paymentIntent.id);
        return;
    }

    const order = await getOrderById(orderId);
    if (!order) {
        throw new Error(`Order ${orderId} not found for payment success update`);
    }

    if (order.status !== 'paid') {
        const updated = await updateOrderStripeStatus(orderId, {
            status: 'paid',
            stripe_payment_intent_id: paymentIntent.id,
            stripe_payment_status: paymentIntent.status,
            paid_at: new Date().toISOString(),
        });
        if (!updated) {
            throw new Error(`Failed to mark order ${orderId} as paid from PaymentIntent`);
        }
    } else {
        console.log('[Stripe Webhook] Order already paid; keeping idempotent success:', orderId);
    }

    const { sendStripePaymentSuccessEmail } = await import('@/lib/email/sender');
    const latestOrder = await getOrderById(orderId);
    if (!latestOrder) {
        throw new Error(`Order ${orderId} not found for payment notification`);
    }

    if (!parseStripeEmailSent(latestOrder.full_order_data)) {
        const emailResult = await sendStripePaymentSuccessEmail(latestOrder, {
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount_received || paymentIntent.amount,
            currency: paymentIntent.currency,
        });
        if (!emailResult.success) {
            throw new Error(`Payment notification email failed for order ${orderId}: ${emailResult.error}`);
        }
    } else {
        console.log('[Stripe Webhook] Payment notification already sent for order:', orderId);
    }
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
    console.log('[Stripe Webhook] Payment canceled:', paymentIntent.id);

    const orderId = paymentIntent.metadata?.order_id;
    if (!orderId) {
        console.log('[Stripe Webhook] PaymentIntent canceled without order_id metadata:', paymentIntent.id);
        return;
    }

    const order = await getOrderById(orderId);
    if (!order) {
        throw new Error(`Order ${orderId} not found for payment cancellation update`);
    }
    if (order.status === 'paid') {
        console.log('[Stripe Webhook] Order already paid; ignoring payment cancellation:', orderId);
        return;
    }

    const updated = await updateOrderStripeStatus(orderId, {
        status: 'canceled',
        stripe_payment_intent_id: paymentIntent.id,
        stripe_payment_status: 'canceled',
    });
    if (!updated) {
        throw new Error(`Failed to mark order ${orderId} as canceled`);
    }
}

function parseStripeEmailSent(rawData: unknown): boolean {
    if (!rawData) return false;
    if (typeof rawData === 'object') {
        return Boolean((rawData as Record<string, unknown>).stripe_email_sent);
    }
    if (typeof rawData === 'string') {
        try {
            const parsed = JSON.parse(rawData);
            return Boolean(parsed?.stripe_email_sent);
        } catch {
            return false;
        }
    }
    return false;
}

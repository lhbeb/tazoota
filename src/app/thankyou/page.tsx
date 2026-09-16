'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle, Mail, Clock, Package, ArrowLeft, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { trackPixelEvent } from '@/lib/pixel';
import { CART_STORAGE_KEY, clearCart } from '@/utils/cart';
import { queueGoogleAdsPurchase } from '@/lib/googleAds';
import { clearPendingOrder, getPendingOrder } from '@/lib/pendingOrder';

const PURCHASE_TRACKED_KEY_PREFIX = 'purchase_tracked:';
const PAYMENT_VERIFY_DELAYS_MS = [0, 750, 1500, 3000, 5000];

interface PurchaseTrackingData {
  value: number;
  currency: string;
  transactionId: string;
  email?: string | null;
  contentId?: string;
  contentName?: string;
}

function trackPurchaseOnce(data: PurchaseTrackingData): boolean {
  if (!data.transactionId || !Number.isFinite(data.value) || data.value <= 0) return false;

  const trackingKey = `${PURCHASE_TRACKED_KEY_PREFIX}${data.transactionId}`;
  try {
    if (sessionStorage.getItem(trackingKey)) return true;
  } catch {
    // Tracking should continue if browser storage is blocked.
  }

  try {
    trackPixelEvent(
      'Purchase',
      {
        value: data.value,
        currency: data.currency,
        content_ids: data.contentId ? [data.contentId] : [],
        content_name: data.contentName || '',
        content_type: 'product',
        num_items: 1,
        event_id: data.transactionId,
      },
    );
  } catch (error) {
    console.warn('Meta purchase tracking failed:', error);
  }

  queueGoogleAdsPurchase({
    value: data.value,
    currency: data.currency,
    transactionId: data.transactionId,
    email: data.email,
    contentId: data.contentId,
    contentName: data.contentName,
  });

  try {
    sessionStorage.setItem(trackingKey, '1');
  } catch {
    // Ad platforms also deduplicate by event id / transaction id.
  }

  return true;
}

function ThankYouContent() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const sessionId = searchParams.get('session_id');
  const isStaticSuccess = !sessionId;
  const isSuccessful = isStaticSuccess || orderDetails?.status === 'paid';

  useEffect(() => {
    // PayPal and other redirect flows only reach this route after provider success.
    if (!sessionId) {
      try {
        const pendingOrder = getPendingOrder();
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        const cartItem = stored ? JSON.parse(stored) : null;
        const product = pendingOrder?.product || cartItem?.product;
        if (product) {
          const transactionId = pendingOrder?.orderId || `redirect-${product.slug || product.id || Date.now()}`;
          trackPurchaseOnce({
            value: product.price || 0,
            currency: product.currency || 'USD',
            transactionId,
            contentId: product.slug || product.id || '',
            contentName: product.title || '',
          });
        }
      } catch (e) {
        console.error('Purchase pixel error:', e);
      }
      clearPendingOrder();
      clearCart();
      return;
    }

    let cancelled = false;

    const verifyInBackground = async () => {
      let lastResult: any = { status: 'pending' };

      for (const delay of PAYMENT_VERIFY_DELAYS_MS) {
        if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
        if (cancelled) return;

        try {
          const response = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
            cache: 'no-store',
          });

          if (response.ok) {
            lastResult = await response.json();
            if (lastResult.status === 'paid') {
              if (cancelled) return;
              setOrderDetails(lastResult);
              trackPurchaseOnce({
                value: lastResult.amount ? lastResult.amount / 100 : 0,
                currency: lastResult.currency ? lastResult.currency.toUpperCase() : 'USD',
                transactionId: lastResult.orderId || sessionId,
                email: lastResult.email || lastResult.customerEmail,
                contentId: lastResult.productSlug || lastResult.orderId,
                contentName: lastResult.productTitle,
              });
              clearCart();
              return;
            }
          } else if (response.status >= 400 && response.status < 500) {
            break;
          }
        } catch (error) {
          console.warn('Payment verification attempt failed:', error);
        }
      }

      if (!cancelled) {
        setOrderDetails(lastResult);
      }
    };

    verifyInBackground();
    return () => {
      cancelled = true;
    };
  }, [searchParams, sessionId]);

  // Always show success (Stripe only redirects here if payment succeeded)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Main Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-[#262626] mb-4">
            {isSuccessful ? 'Thank You for Your Order!' : 'Payment Verification Pending...'}
          </h1>

          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {isSuccessful
              ? 'Your payment has been successfully recorded and your order is queued for manual processing. We will send you an email confirmation shortly once verified.' 
              : 'Your payment is still processing or awaiting backend verification. We will process your order and send a confirmation email once it is completely confirmed.'}
          </p>

          {/* Order Details */}
          {orderDetails && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <p className="text-sm text-gray-500 mb-2">Order ID</p>
              <p className="text-lg font-mono font-semibold text-[#262626] mb-4">
                {orderDetails.orderId || orderDetails.sessionId}
              </p>
              {orderDetails.amount && (
                <p className="text-2xl font-bold text-green-600">
                  ${(orderDetails.amount / 100).toFixed(2)} {orderDetails.currency?.toUpperCase()}
                </p>
              )}
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-[#262626] mb-4">
              What happens next?
            </h2>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-[#262626]">Order Processing</h3>
                  <p className="text-sm text-gray-600">Orders placed before 2:00 PM CST process same day. Otherwise within 1 business day.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-[#262626]">Email Confirmation</h3>
                  <p className="text-sm text-gray-600">You&apos;ll receive an email with your order details and tracking number</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Package className="w-4 h-4 text-orange-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-[#262626]">Shipping</h3>
                  <p className="text-sm text-gray-600">Estimated delivery is 5–10 business days, including processing and transit</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-[#262626] mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-3">
              If you have any questions about your order, don&apos;t hesitate to reach out:
            </p>
            <div className="space-y-1 text-sm">
              <p className="text-gray-700">
                📧 <a href="mailto:contact@tazoota.com" className="text-blue-600 hover:text-blue-700 font-medium">
                  contact@tazoota.com
                </a>
              </p>
              <p className="text-gray-700">
                📞 <a href="tel:+19083256283" className="text-blue-600 hover:text-blue-700 font-medium">
                  +19083256283
                </a>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#0b2a17] hover:bg-[#3a7f4b] text-white font-medium rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            {isSuccessful
              ? 'You will receive a confirmation email once our team reviews your order' 
              : 'We will notify you by email once your payment clears'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 text-center">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#262626] mb-4">
            Loading...
          </h1>
          <p className="text-lg text-gray-600">
            Please wait a moment.
          </p>
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function ThankYouPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ThankYouContent />
    </Suspense>
  );
}

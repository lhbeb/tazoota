"use client";

import React, { useEffect, useState } from 'react';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Check, MapPin, Mail, ArrowLeft } from 'lucide-react';

interface StripeEmbeddedCheckoutProps {
  clientSecret: string;
  shippingData: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    email: string;
  };
  product: {
    title: string;
    price: number;
    currency?: string;
    images?: string[];
  };
  sellerName?: string | null;
  onBack?: () => void;
}

export default function StripeEmbeddedCheckout({
  clientSecret,
  shippingData,
  product,
  sellerName,
  onBack,
}: StripeEmbeddedCheckoutProps) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [configError, setConfigError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadStripeConfig = async () => {
      try {
        const response = await fetch(`/api/config/stripe?t=${Date.now()}`);
        const data = await response.json();

        if (!response.ok || !data.publishableKey) {
          throw new Error(data.error || 'Stripe is not configured');
        }

        setStripePromise(loadStripe(data.publishableKey));
      } catch (error) {
        console.error('Failed to load Stripe config:', error);
        setConfigError('Payment is temporarily unavailable. Please email contact@tazoota.com.');
      }
    };

    loadStripeConfig();
  }, []);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.currency || 'USD',
  }).format(product.price);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dde8df] via-[#f8fafc] to-[#f0fdfa] px-0 py-0 sm:px-4 sm:py-8">
      <div className="mx-auto w-full max-w-6xl overflow-hidden bg-white shadow-none sm:rounded-3xl sm:border sm:border-gray-100 sm:shadow-2xl">
        <div className="border-b border-gray-100 p-5 sm:p-8">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#0b2a17] transition-colors hover:text-[#3a7f4b]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to checkout
            </button>
          )}

          <div className="mb-6 flex flex-col items-center text-center">
            <span className="mb-2 inline-flex items-center justify-center rounded-full bg-blue-100 p-2">
              <Check className="h-7 w-7 text-[#0b2a17]" />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#262626] sm:text-3xl">
              Secure Payment
            </h1>
            <p className="mt-2 text-base text-gray-600">
              Complete your payment below without leaving Tazoota.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="mb-2 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#0b2a17]" />
                <span className="font-semibold text-[#0b2a17]">Confirmed Delivery Address</span>
              </div>
              <div className="leading-relaxed text-gray-800">
                {shippingData.streetAddress && <div>{shippingData.streetAddress}</div>}
                {shippingData.city && <div>{shippingData.city}</div>}
                {(shippingData.state || shippingData.zipCode) && (
                  <div>
                    {shippingData.state}
                    {shippingData.state && shippingData.zipCode ? ', ' : ''}
                    {shippingData.zipCode}
                  </div>
                )}
              </div>
              {shippingData.email && (
                <div className="mt-3 flex items-center gap-2 text-[#0b2a17]">
                  <Mail className="h-5 w-5" />
                  <span>{shippingData.email}</span>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Order Summary
              </h2>
              <div className="text-lg font-bold leading-tight text-[#262626]">{product.title}</div>
              {sellerName && (
                <div className="mt-1 text-sm text-gray-500">
                  Sold by: <span className="font-medium text-[#0b2a17]">{sellerName}</span>
                </div>
              )}
              <div className="mt-5 flex items-end justify-between border-t border-gray-100 pt-4">
                <span className="text-sm font-semibold text-gray-500">Total</span>
                <span className="text-2xl font-extrabold text-[#0b2a17]">{formattedPrice}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-[640px] p-3 sm:p-8">
          {configError ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-medium text-red-700">
              {configError}
            </div>
          ) : stripePromise ? (
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#0b2a17]/25 border-t-[#0b2a17]" />
              <span className="font-medium text-gray-700">Loading secure payment form...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

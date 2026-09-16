"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Check, ChevronDown, MapPin, Pencil } from 'lucide-react';
import { formatShippingAddressLines, type ShippingData } from '@/lib/shipping';

interface StripeEmbeddedCheckoutProps {
  clientSecret: string;
  shippingData: ShippingData;
  product: {
    title: string;
    price?: number;
    currency?: string;
    images?: string[];
  };
  sellerName?: string | null;
  onBack?: () => void;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export default function StripeEmbeddedCheckout({
  clientSecret,
  shippingData,
  onBack,
}: StripeEmbeddedCheckoutProps) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [configError, setConfigError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const addressLines = formatShippingAddressLines(shippingData);

  const addressContentRef = useRef<HTMLDivElement>(null);
  const frameContainerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    root.style.scrollBehavior = prev;
  }, []);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
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
        setIsLoading(false);
      }
    };

    loadStripeConfig();
  }, []);

  useEffect(() => {
    if (!stripePromise) return;

    const container = frameContainerRef.current;
    if (!container) return;
    if (container.querySelector('iframe')) {
      setIsLoading(false);
      return;
    }

    const observer = new MutationObserver(() => {
      if (container.querySelector('iframe')) {
        setIsLoading(false);
        observer.disconnect();
      }
    });

    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [stripePromise]);

  const doCollapse = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const contentHeight = addressContentRef.current?.scrollHeight ?? 0;
    const startScrollY = window.scrollY;
    const duration = 500;
    const startTime = performance.now();

    document.documentElement.style.overflowAnchor = 'none';
    document.body.style.overflowAnchor = 'none';

    setIsCollapsed(true);

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOut(progress);

      window.scrollTo(0, Math.max(0, startScrollY - contentHeight * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        document.documentElement.style.overflowAnchor = '';
        document.body.style.overflowAnchor = '';
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doCollapse(), 2200);
    return () => clearTimeout(timer);
  }, [doCollapse]);

  const handleToggle = () => {
    document.documentElement.style.overflowAnchor = 'none';
    document.body.style.overflowAnchor = 'none';
    setIsCollapsed(prev => !prev);
    setTimeout(() => {
      document.documentElement.style.overflowAnchor = '';
      document.body.style.overflowAnchor = '';
    }, 550);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 rounded-xl border border-gray-200 bg-white shadow-sm md:hidden">
          <button
            type="button"
            onClick={handleToggle}
            className="flex w-full items-center justify-between rounded-xl p-4 text-left focus:outline-none"
            aria-expanded={!isCollapsed}
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50">
                <MapPin className="h-5 w-5 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">Address Confirmed</p>
                <p className="text-xs text-gray-400">Tap to view or edit</p>
              </div>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
            />
          </button>

          <div
            className="grid overflow-hidden transition-[grid-template-rows] duration-500 ease-in-out"
            style={{ gridTemplateRows: isCollapsed ? '0fr' : '1fr' }}
            aria-hidden={isCollapsed}
          >
            <div ref={addressContentRef} className="min-h-0 overflow-hidden">
              <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                <div className="flex items-start justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="flex min-w-0 items-start space-x-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-600" />
                    <div className="min-w-0 text-xs font-medium leading-relaxed text-gray-700">
                      <span className="mb-0.5 block font-semibold text-gray-900">Shipping to:</span>
                      {addressLines.map((line, index) => <div key={`${index}-${line}`}>{line}</div>)}
                    </div>
                  </div>
                  {onBack && (
                    <button
                      type="button"
                      onClick={onBack}
                      title="Edit address"
                      className="rounded p-1 text-gray-400 hover:text-gray-700"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
          <div className="md:col-span-7 md:rounded-2xl md:border md:border-gray-200 md:bg-white md:p-6 md:shadow-sm">
            <div className="mb-4 hidden border-b border-gray-100 pb-3 md:block">
              <h2 className="text-xl font-bold tracking-tight text-gray-900">Payment</h2>
              <p className="mt-0.5 text-xs text-gray-500">Complete your order securely</p>
            </div>

            <div ref={frameContainerRef} className="relative min-h-[420px] w-full">
              {isLoading && (
                <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-white">
                  <div className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#0b2a17]" />
                  <span className="text-sm font-medium text-gray-600">Loading payment options...</span>
                </div>
              )}

              {configError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                  {configError}
                </div>
              ) : stripePromise ? (
                <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              ) : null}
            </div>

            <div className="mt-6 hidden items-center justify-center gap-4 border-t border-gray-100 pt-4 text-xs text-gray-500 md:flex">
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-green-600" />
                <span>Encrypted &amp; Secure Payment</span>
              </div>
            </div>
          </div>

          <div className="sticky top-8 hidden flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:col-span-5 md:flex">
            <h2 className="text-base font-bold text-gray-900">Delivery Details</h2>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5 text-xs text-gray-700">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 font-semibold text-gray-900">
                  <MapPin className="h-3.5 w-3.5 text-gray-600" />
                  <span>Shipping to</span>
                </div>
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="text-xs font-semibold text-[#0b2a17] hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>
              <address className="not-italic font-medium leading-relaxed text-gray-600">
                {addressLines.map((line, index) => <div key={`desktop-${index}-${line}`}>{line}</div>)}
              </address>
            </div>

            <div className="flex items-center justify-between px-1 text-xs text-gray-600">
              <span>Shipping</span>
              <span className="font-semibold text-[#0b2a17]">Free</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

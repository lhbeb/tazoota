"use client";

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import type { ShippingData } from '@/lib/shipping';

interface StripeElementsCheckoutProps {
  clientSecret: string;
  isAddressVerified: boolean;
  shippingData: ShippingData;
  onLockedPaymentAttempt: () => void;
  onPaymentStarted?: () => void;
  onPaymentError?: (message: string) => void;
  compact?: boolean;
}

function StripePaymentForm({
  isAddressVerified,
  shippingData,
  onLockedPaymentAttempt,
  onPaymentStarted,
  onPaymentError,
  compact = false,
}: Omit<StripeElementsCheckoutProps, 'clientSecret'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const confirmStripePayment = async () => {
    setMessage('');

    if (!isAddressVerified) {
      onLockedPaymentAttempt();
      return;
    }

    if (!stripe || !elements) {
      setMessage('Card payment is still loading. Please try again in a moment.');
      return;
    }

    setIsSubmitting(true);
    onPaymentStarted?.();

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/thankyou?payment_method=stripe`,
        payment_method_data: {
          billing_details: {
            name: shippingData.fullName || shippingData.email,
            email: shippingData.email,
            address: {
              line1: shippingData.streetAddress,
              line2: shippingData.addressLine2 || undefined,
              city: shippingData.city,
              state: shippingData.state,
              postal_code: shippingData.zipCode,
              country: shippingData.countryCode || undefined,
            },
          },
        },
      },
    });

    if (result.error) {
      const errorMessage = result.error.message || 'Payment could not be completed. Please try again.';
      setMessage(errorMessage);
      onPaymentError?.(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await confirmStripePayment();
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? 'space-y-4' : 'space-y-5'}>
      <div className={compact ? 'w-full' : 'rounded-xl border border-gray-200 bg-white p-4'}>
        <PaymentElement
          options={{
            layout: {
              type: 'accordion',
              defaultCollapsed: false,
              radios: false,
              spacedAccordionItems: !compact,
            },
          }}
        />
      </div>

      {!isAddressVerified && (
        <div className="rounded-xl border border-[#0b2a17]/15 bg-[#f6f3e8] px-4 py-3 text-sm font-medium leading-5 text-[#0b2a17]">
          Confirm your delivery address first, then complete secure payment to reserve your order.
        </div>
      )}

      {message && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || isSubmitting || !isAddressVerified}
        className={`w-full rounded-xl px-6 py-4 text-base font-bold text-white transition-colors focus:outline-none focus:ring-4 focus:ring-[#0b2a17] focus:ring-offset-2 ${
          !stripe || !elements || isSubmitting || !isAddressVerified
            ? 'cursor-not-allowed bg-gray-400'
            : 'bg-[#0b2a17] hover:bg-[#3a7f4b]'
        }`}
      >
        {isSubmitting ? 'Processing payment...' : 'Pay securely'}
      </button>
    </form>
  );
}

export default function StripeElementsCheckout(props: StripeElementsCheckoutProps) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [configError, setConfigError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let mounted = true;
    setConfigError('');
    setStripePromise(null);

    const loadConfig = async () => {
      try {
        const response = await fetch(`/api/config/stripe?t=${Date.now()}`, { cache: 'no-store' });
        const data = await response.json();

        if (!response.ok || !data.publishableKey) {
          throw new Error(data.error || 'Stripe is not configured');
        }

        const stripe = await loadStripe(data.publishableKey);
        if (!stripe) throw new Error('Stripe.js returned no client instance');
        if (mounted) setStripePromise(Promise.resolve(stripe));
      } catch (error) {
        console.error('Failed to load Stripe config:', error);
        if (mounted) {
          setConfigError('Card payment is temporarily unavailable. Please try again or contact support.');
        }
      }
    };

    loadConfig();
    return () => {
      mounted = false;
    };
  }, [loadAttempt]);

  const options = useMemo(() => ({
    clientSecret: props.clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#0b2a17',
        borderRadius: '10px',
        fontFamily: 'Inter, system-ui, sans-serif',
      },
    },
  }), [props.clientSecret]);

  if (configError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
        <p>{configError}</p>
        <button
          type="button"
          onClick={() => setLoadAttempt((attempt) => attempt + 1)}
          className="mt-3 rounded-lg bg-[#0b2a17] px-4 py-2 text-white hover:bg-[#3a7f4b]"
        >
          Retry card payment
        </button>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 h-4 w-40 animate-pulse rounded bg-gray-200" />
        <div className="space-y-3">
          <div className="h-12 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-28 animate-pulse rounded-lg bg-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripePaymentForm
        isAddressVerified={props.isAddressVerified}
        shippingData={props.shippingData}
        onLockedPaymentAttempt={props.onLockedPaymentAttempt}
        onPaymentStarted={props.onPaymentStarted}
        onPaymentError={props.onPaymentError}
        compact={props.compact}
      />
    </Elements>
  );
}

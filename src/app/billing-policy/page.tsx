import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, CreditCard, Mail, Phone, ShieldCheck } from 'lucide-react';
import { SITE, policyGraph } from '@/lib/siteFacts';

export const metadata: Metadata = {
  title: 'Billing Policy | Tazoota',
  description:
    'Tazoota Billing Policy covering order review, payment authorization, cancellations, duplicate orders, and customer support.',
  alternates: {
    canonical: `${SITE.domain}/billing-policy`,
  },
};

export default function BillingPolicyPage() {
  const schemaMarkup = policyGraph(
    'WebPage',
    '/billing-policy',
    'Billing Policy',
    'Tazoota Billing Policy covering payment authorization, order review, cancellations, and billing support.'
  );

  return (
    <main className="min-h-screen bg-[#f0f7f2] py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      <div className="container mx-auto max-w-4xl px-4">
        <section className="rounded-2xl bg-[#2e6b3e] px-6 py-8 text-[#f0f7f2] shadow-lg sm:px-8">
          <CreditCard className="mb-4 h-9 w-9 text-[#e3e823]" />
          <h1 className="text-3xl font-bold sm:text-4xl">Billing Policy</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#f0f7f2]/85 sm:text-base">
            This policy explains how Tazoota reviews orders, handles payment authorization, and responds to duplicate, suspicious, or unavailable orders.
          </p>
        </section>

        <section className="mt-8 space-y-8 rounded-2xl border border-[#2e6b3e]/10 bg-white p-6 text-gray-700 shadow-sm sm:p-8">
          <div>
            <h2 className="text-2xl font-bold text-[#262626]">Order Review and Acceptance</h2>
            <p className="mt-3 leading-7">
              Placing an order does not mean it has been accepted for fulfillment. Tazoota may review product availability, payment status, billing details, shipping information, and fraud indicators before accepting or dispatching an order.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#262626]">Right to Refuse or Cancel</h2>
            <p className="mt-3 leading-7">
              We may refuse, delay, or cancel an order when inventory cannot be fulfilled, payment cannot be verified, billing or shipping information is incomplete, pricing or listing information contains an error, or the order appears unauthorized or suspicious.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#262626]">Quantity Limits and Duplicate Orders</h2>
            <p className="mt-3 leading-7">
              Tazoota may limit quantities per customer, account, household, payment method, billing address, or shipping address when needed to keep ordering fair, protect inventory, or prevent duplicate or suspicious transactions.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#262626]">Payment Authorization</h2>
            <p className="mt-3 leading-7">
              Payments may be authorized by a third-party payment provider before an order is processed. An authorization or payment confirmation does not guarantee shipment if the order later fails review or cannot be fulfilled.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#262626]">Customer Contact About Cancellations</h2>
            <p className="mt-3 leading-7">
              If an order is cancelled or requires additional review, Tazoota may contact you using the email address or phone number provided at checkout. Refunds for cancelled paid orders are handled according to our return and refund process and the payment provider timeline.
            </p>
          </div>

          <div className="grid gap-4 rounded-xl bg-[#f7faf8] p-5 sm:grid-cols-2">
            <Link href="/return-policy" className="inline-flex items-center gap-2 font-semibold text-[#2e6b3e] hover:underline">
              <ShieldCheck className="h-5 w-5" />
              Refund & Return Policy
            </Link>
            <Link href="/billing-term-and-condition" className="inline-flex items-center gap-2 font-semibold text-[#2e6b3e] hover:underline">
              <AlertTriangle className="h-5 w-5" />
              Billing Terms & Conditions
            </Link>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-2xl font-bold text-[#262626]">Billing Support</h2>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 text-[#2e6b3e] hover:underline">
                <Mail className="h-4 w-4" />
                {SITE.email}
              </a>
              <a href={`tel:${SITE.phone}`} className="flex items-center gap-2 text-[#2e6b3e] hover:underline">
                <Phone className="h-4 w-4" />
                {SITE.phone}
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

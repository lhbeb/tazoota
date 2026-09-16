import type { Metadata } from 'next';
import Link from 'next/link';
import { CreditCard, LockKeyhole, ShieldCheck } from 'lucide-react';
import { SITE, policyGraph } from '@/lib/siteFacts';

export const metadata: Metadata = {
  title: 'Billing Terms & Conditions | Tazoota',
  description:
    'Tazoota billing terms covering secure checkout, payment providers, accepted payment methods, currency, authorization, and settlement.',
  alternates: {
    canonical: `${SITE.domain}/billing-term-and-condition`,
  },
};

export default function BillingTermsPage() {
  const schemaMarkup = policyGraph(
    'WebPage',
    '/billing-term-and-condition',
    'Billing Terms & Conditions',
    'Tazoota billing terms covering secure checkout, payment providers, accepted payment methods, currency, and authorization.'
  );

  return (
    <main className="min-h-screen bg-[#f0f7f2] py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      <div className="container mx-auto max-w-4xl px-4">
        <section className="rounded-2xl bg-[#2e6b3e] px-6 py-8 text-[#f0f7f2] shadow-lg sm:px-8">
          <LockKeyhole className="mb-4 h-9 w-9 text-[#e3e823]" />
          <h1 className="text-3xl font-bold sm:text-4xl">Billing Terms & Conditions</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#f0f7f2]/85 sm:text-base">
            These terms explain how payments are handled on Tazoota and how our third-party payment providers support secure checkout.
          </p>
        </section>

        <section className="mt-8 space-y-8 rounded-2xl border border-[#2e6b3e]/10 bg-white p-6 text-gray-700 shadow-sm sm:p-8">
          <div>
            <h2 className="text-2xl font-bold text-[#262626]">Secure Checkout</h2>
            <p className="mt-3 leading-7">
              Tazoota uses HTTPS/SSL protection for website traffic. Payment card details are handled by the relevant payment provider and are not intentionally stored as full card numbers on Tazoota&apos;s own application servers.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#262626]">Third-Party Payment Processing</h2>
            <p className="mt-3 leading-7">
              The Tazoota codebase supports Stripe checkout and PayPal checkout or invoice flows. Available payment options can vary by product and checkout route. Payment providers may perform their own fraud checks and authorization reviews.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#262626]">Payment Methods and Currency</h2>
            <p className="mt-3 leading-7">
              Products are listed and charged in USD unless a product page or checkout page clearly states otherwise. Checkout may support payment cards through Stripe and PayPal-based payment options where enabled.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#262626]">Authorization and Settlement</h2>
            <p className="mt-3 leading-7">
              Payment authorization may occur before final order review. If an order cannot be fulfilled or fails review, Tazoota may cancel the order and issue or request the appropriate refund through the payment provider.
            </p>
          </div>

          <div className="grid gap-4 rounded-xl bg-[#f7faf8] p-5 sm:grid-cols-3">
            <Link href="/privacy-policy" className="inline-flex items-center gap-2 font-semibold text-[#2e6b3e] hover:underline">
              <ShieldCheck className="h-5 w-5" />
              Privacy Policy
            </Link>
            <Link href="/terms" className="inline-flex items-center gap-2 font-semibold text-[#2e6b3e] hover:underline">
              <CreditCard className="h-5 w-5" />
              Terms of Service
            </Link>
            <Link href="/shipping-policy" className="inline-flex items-center gap-2 font-semibold text-[#2e6b3e] hover:underline">
              Shipping Policy
            </Link>
          </div>

          <div className="border-t border-gray-100 pt-6 text-sm leading-7">
            <p>
              Billing questions: <a href={`mailto:${SITE.email}`} className="font-semibold text-[#2e6b3e] hover:underline">{SITE.email}</a> or <a href={`tel:${SITE.phone}`} className="font-semibold text-[#2e6b3e] hover:underline">{SITE.phone}</a>.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

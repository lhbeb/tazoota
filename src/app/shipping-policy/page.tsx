import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Mail, MapPin, PackageCheck, ShieldCheck, Truck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shipping Policy | Tazoota',
  description:
    'Official Tazoota Shipping Policy. Free standard shipping across the United States. Estimated delivery 5–10 business days. Same-day processing for orders placed before 2:00 PM EST.',
};

const timeline = [
  ['Same-day orders', 'Ships same day when placed before 2:00 PM EST'],
  ['Standard processing', '0–1 business day'],
  ['Transit time (carrier)', '5–9 business days'],
  ['Total estimated delivery', '5–10 business days (Free Standard Shipping)'],
];

const policySections = [
  {
    title: 'Free Shipping (US)',
    items: [
      'Free standard shipping on all orders across the United States',
      'No minimum purchase requirement',
      'Tracked shipping via premium logistics partners (USPS, FedEx)',
    ],
  },
  {
    title: 'Order Tracking',
    items: [
      'Automatic shipping confirmation email upon dispatch',
      'Real-time package tracking link provided',
      'Estimated delivery date visibility',
      'Carrier milestone email updates',
    ],
  },
  {
    title: 'Shipping Destinations',
    items: [
      'We ship across all 50 US States nationwide',
      'PO boxes supported for standard deliveries',
      'APO/FPO/DPO military addresses fully supported',
      'Discreet, eco-friendly, protective packaging',
    ],
  },
  {
    title: 'Package Protection & Safety',
    items: [
      '100% full shipping insurance on all packages',
      'Signature confirmation for high-value orders over $500',
      'Weather-resistant outer mailers',
      'Protective bubble/foam layering for fragile items',
    ],
  },
];

export default function ShippingPolicyPage() {
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': 'https://tazoota.com/shipping-policy',
        'url': 'https://tazoota.com/shipping-policy',
        'name': 'Shipping Policy | Tazoota',
        'description':
          'Tazoota Shipping Policy: Free standard shipping across the United States. Same-day processing for orders placed before 2:00 PM EST.',
      },
      {
        '@type': 'OfferShippingDetails',
        '@id': 'https://tazoota.com/shipping-policy#shipping-us',
        'shippingDestination': {
          '@type': 'DefinedRegion',
          'addressCountry': 'US',
        },
        'shippingRate': {
          '@type': 'MonetaryAmount',
          'value': 0,
          'currency': 'USD',
        },
        'deliveryTime': {
          '@type': 'ShippingDeliveryTime',
          'handlingTime': {
            '@type': 'QuantitativeValue',
            'minValue': 0,
            'maxValue': 1,
            'unitCode': 'DAY',
          },
          'transitTime': {
            '@type': 'QuantitativeValue',
            'minValue': 5,
            'maxValue': 9,
            'unitCode': 'DAY',
          },
          'cutoffTime': '14:00:00-05:00',
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#f4f7f5] py-12 sm:py-16">
      {/* Schema.org OfferShippingDetails Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <div className="container mx-auto max-w-5xl px-4">
        <section className="mb-10 rounded-2xl bg-[#2e6b3e] px-6 py-8 text-[#f0f7f2] sm:px-8 sm:py-10 shadow-lg">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f0f7f2]/10 bg-[#2e6b3e]/25 px-3.5 py-1.5 text-sm font-semibold text-[#e3e823]">
            <Truck className="h-4 w-4" />
            Fast & Free Shipping Across the US
          </div>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
            Shipping Policy
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[#f0f7f2]/80 sm:text-lg">
            At Tazoota, we focus on fast, reliable fulfillment with transparent delivery windows, free standard shipping to the United States, and real-time tracking from warehouse to door.
          </p>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[#2e6b3e]/10 bg-white p-5 shadow-sm">
            <Clock className="mb-4 h-6 w-6 text-[#2e6b3e]" />
            <h2 className="text-lg font-bold text-[#262626]">Order by 2:00 PM EST</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Orders placed before the 2:00 PM EST cutoff are processed, packed, and shipped the same business day.
            </p>
          </div>
          <div className="rounded-xl border border-[#2e6b3e]/10 bg-white p-5 shadow-sm">
            <PackageCheck className="mb-4 h-6 w-6 text-[#2e6b3e]" />
            <h2 className="text-lg font-bold text-[#262626]">Free Standard Shipping</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Free shipping on all orders across the United States with no minimum spend required.
            </p>
          </div>
          <div className="rounded-xl border border-[#2e6b3e]/10 bg-white p-5 shadow-sm">
            <ShieldCheck className="mb-4 h-6 w-6 text-[#2e6b3e]" />
            <h2 className="text-lg font-bold text-[#262626]">Insured Deliveries</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              All shipments include full insurance, protective packaging, and end-to-end tracking updates.
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-[#2e6b3e]/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#262626]">Delivery Timelines</h2>
              <p className="mt-2 text-sm text-gray-600">Estimated total delivery: <strong>5–10 business days</strong> (0–1 day handling + 5–9 days transit). Same-day dispatch applies to orders placed before 2:00 PM EST on business days.</p>
            </div>
            <span className="inline-flex w-fit rounded-full bg-[#e3e823] px-3.5 py-1 text-sm font-semibold text-[#2e6b3e]">
              Same-day dispatch cutoff: 2:00 PM EST
            </span>
          </div>

          <div className="mt-6 divide-y divide-gray-100">
            {timeline.map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold text-[#262626]">{label}</span>
                <span className="text-sm font-medium text-gray-700 sm:text-right">{value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {policySections.map((section) => (
            <div key={section.title} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#262626]">{section.title}</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-600">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#2e6b3e]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-[#2e6b3e]/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-[#262626]">Need Help With Shipping?</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
            If you have questions about your delivery or need assistance tracking a package, reach out to our support team:
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl bg-[#f4f7f5] p-4">
              <MapPin className="h-5 w-5 text-[#2e6b3e]" />
              <span className="text-sm font-medium text-[#262626]">United States</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-[#f4f7f5] p-4">
              <Mail className="h-5 w-5 text-[#2e6b3e]" />
              <span className="text-sm font-medium text-[#262626]">contact@tazoota.com</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-[#f4f7f5] p-4">
              <Clock className="h-5 w-5 text-[#2e6b3e]" />
              <span className="text-sm font-medium text-[#262626]">Mon-Fri, 9 AM-5 PM EST</span>
            </div>
          </div>

          <Link
            href="/contact"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#2e6b3e] px-5 py-3 text-sm font-semibold text-[#f0f7f2] transition hover:bg-[#082317]"
          >
            Contact Support
          </Link>
        </section>
      </div>
    </main>
  );
}

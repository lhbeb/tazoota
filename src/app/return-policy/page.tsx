import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE, breadcrumbJsonLd, organizationJsonLd } from '@/lib/siteFacts';
import {
  RotateCcw,
  RefreshCw,
  Clock,
  CreditCard,
  Building2,
  Mail,
  Phone,
  PackageCheck,
  FileText,
  HelpCircle,
  Banknote,
  Inbox,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Return & Exchange Policy | Tazoota',
  description:
    'Request a return within 30 days of delivery for eligible items. Eligible US returns receive a prepaid label within 1 business day of your request. After the return arrives, allow 1–2 business days for inspection and up to 5 business days for a refund to be issued.',
};

export default function ReturnPolicyPage() {
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        ...organizationJsonLd(),
        'hasMerchantReturnPolicy': {
          '@type': 'MerchantReturnPolicy',
          '@id': `${SITE.domain}/return-policy#merchant-return-policy`,
          'name': 'Tazoota Return & Exchange Policy',
          'merchantReturnLink': `${SITE.domain}/return-policy`,
          'applicableCountry': ['US'],
          'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
          'merchantReturnDays': SITE.returns.windowDays,
          'returnMethod': 'https://schema.org/ReturnByMail',
          'returnFees': 'https://schema.org/FreeReturn',
          'returnLabelSource': 'https://schema.org/ReturnLabelDownloadAndPrint',
          'restockingFee': 0,
          'refundType': 'https://schema.org/FullRefund',
        },
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE.domain}/return-policy#webpage`,
        'url': `${SITE.domain}/return-policy`,
        'name': 'Return & Exchange Policy | Tazoota',
        'description': 'Tazoota Return & Exchange Policy for eligible defective, damaged, incorrect, and non-defective product returns.',
      },
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Return & Exchange Policy', path: '/return-policy' },
      ]),
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0b2a17] tracking-tight">
            Return & Exchange Policy
          </h1>
          <p className="text-gray-600 mt-3 text-base sm:text-lg max-w-2xl">
            We want you to be completely happy with your purchase. If something isn&apos;t right, our return and exchange process is simple and hassle-free.
          </p>
        </div>

        {/* Quick Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-10">
          <h2 className="text-lg font-bold text-[#0b2a17] mb-5">Quick Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <RotateCcw className="w-5 h-5 text-[#0b2a17] flex-shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Returns</span>
                <span className="text-sm font-bold text-gray-900">Defective & Non-Defective</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <RefreshCw className="w-5 h-5 text-[#0b2a17] flex-shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Exchanges</span>
                <span className="text-sm font-bold text-gray-900">Yes, Accepted</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <Clock className="w-5 h-5 text-[#0b2a17] flex-shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Return Window</span>
                <span className="text-sm font-bold text-gray-900">30 Days</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <Inbox className="w-5 h-5 text-[#0b2a17] flex-shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Return Method</span>
                <span className="text-sm font-bold text-gray-900">By Mail</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <Banknote className="w-5 h-5 text-[#0b2a17] flex-shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Restocking Fee</span>
                <span className="text-sm font-bold text-gray-900">None ($0)</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <CreditCard className="w-5 h-5 text-[#0b2a17] flex-shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Refund Time</span>
                <span className="text-sm font-bold text-gray-900">After inspection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full Policy Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 space-y-10 text-gray-700">

          {/* Introduction */}
          <p className="text-lg leading-relaxed text-gray-800">
            At <strong className="text-[#0b2a17]">Tazoota</strong>, your satisfaction is our top priority. We want you to shop with complete confidence. If your purchase isn&apos;t right for any reason, we&apos;re here to make it simple.
          </p>

          {/* 1. Returns */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <RotateCcw className="w-6 h-6 text-[#0b2a17]" />
              <h2 className="text-2xl font-bold text-[#0b2a17]">1. Returns</h2>
            </div>
            <p>We accept returns for <strong>both defective and non-defective products</strong>:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <h3 className="font-bold text-emerald-900 text-base mb-1">Defective & Damaged Items</h3>
                <p className="text-sm text-emerald-800">
                  If your order arrives damaged, defective, or incorrect, contact us within 30 days of delivery. We&apos;ll provide return instructions and a prepaid label for US returns within 1 business day.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
                <h3 className="font-bold text-blue-900 text-base mb-1">Change of Mind</h3>
                <p className="text-sm text-blue-800">
                  For eligible items, contact us within 30 days of delivery to request a return. We&apos;ll provide a prepaid label for US returns within 1 business day; no case-by-case approval is required. Change-of-mind returns must be unused and in their original condition.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Exchanges */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-[#0b2a17]" />
              <h2 className="text-2xl font-bold text-[#0b2a17]">2. Exchanges</h2>
            </div>
            <p><strong>Yes, we accept exchanges.</strong> If you&apos;d like a different size, colour, or model:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contact us within <strong>30 days</strong> of receiving your delivery.</li>
              <li>Request the prepaid return label and use the return instructions we email you.</li>
              <li>Once received, your replacement will be dispatched right away.</li>
            </ul>
          </div>

          {/* 3. Return Window & Conditions */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-[#0b2a17]" />
              <h2 className="text-2xl font-bold text-[#0b2a17]">3. 30-Day Return Window</h2>
            </div>
            <p>Contact us to request a return within <strong>30 calendar days</strong> of delivery. No case-by-case approval is required for returns that meet the conditions below. Wait for the prepaid label and return instructions before shipping; return-shipping time is separate from refund-processing time.</p>
            <p className="font-semibold text-gray-900">Your item should be:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>For change-of-mind returns, unused and in original condition with original packaging where possible. Contact us about damaged, defective, or incorrect items.</li>
              <li>Accompanied by proof of purchase (order number or confirmation email).</li>
              <li>Free from post-delivery damage caused after receipt.</li>
            </ul>
          </div>

          {/* 4. How to Return by Mail */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <PackageCheck className="w-6 h-6 text-[#0b2a17]" />
              <h2 className="text-2xl font-bold text-[#0b2a17]">4. How to Return</h2>
            </div>
            <p>All returns are handled <strong>by mail</strong>. Here&apos;s how it works:</p>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong>Contact us</strong> at <a href="mailto:contact@tazoota.com" className="text-blue-600 hover:underline font-semibold">contact@tazoota.com</a> or call <span className="font-semibold">+19083256283</span>.
              </li>
              <li>
                <strong>Request your prepaid label.</strong> For eligible US returns requested within 30 days of delivery, we&apos;ll email the label and return instructions within 1 business day. No case-by-case approval is required.
              </li>
              <li>
                <strong>Ship the item back.</strong> Return transit time depends on the carrier and is not included in the refund-processing estimate.
              </li>
              <li>
                <strong>Get your refund.</strong> After we receive and inspect an eligible return, we issue the refund within 5 business days. Your bank or payment provider may take additional time to post it.
              </li>
            </ol>
          </div>

          {/* 5. Restocking Fee */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <Banknote className="w-6 h-6 text-[#0b2a17]" />
              <h2 className="text-2xl font-bold text-[#0b2a17]">5. No Restocking Fee</h2>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <p className="font-medium text-gray-800">
                We charge <strong>no restocking fee</strong> and do not reduce an eligible refund with a restocking or condition-based partial deduction. Eligible returns that meet this policy receive a full refund of the item price to the original payment method after inspection. Change-of-mind items that do not meet the stated condition requirements are not eligible for return; contact us about damaged, defective, or incorrect items.
              </p>
            </div>
          </div>

          {/* 6. Refund Processing */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-[#0b2a17]" />
              <h2 className="text-2xl font-bold text-[#0b2a17]">6. Refund Processing</h2>
            </div>
            <p>Refunds are credited to your original payment method (Visa, MasterCard, PayPal, Apple Pay, etc.).</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Return transit:</strong> Varies by carrier and is separate from processing time.</li>
              <li><strong>Inspection:</strong> Allow 1–2 business days after we receive your return.</li>
              <li><strong>Refund issued:</strong> Within <strong>5 business days after inspection</strong>. Your payment provider may require additional time to post the credit.</li>
            </ul>
          </div>

          {/* 7. Tazoota-Sourced Items */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-[#0b2a17]" />
              <h2 className="text-2xl font-bold text-[#0b2a17]">7. Products Sourced by Tazoota</h2>
            </div>
            <p>
              Products sold through Tazoota follow the same 30-day return policy unless a product page clearly states a specific exception required by law or product type. Return eligibility follows the conditions stated above; our support team can help with return instructions and questions.
            </p>
          </div>

          {/* 8. Contact */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-[#0b2a17]" />
              <h2 className="text-2xl font-bold text-[#0b2a17]">8. Need Help?</h2>
            </div>
            <p>Our team is here to assist you with any return or exchange:</p>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-bold text-[#0b2a17]">
                  <Phone className="w-5 h-5 text-[#0b2a17]" />
                  <span>Phone</span>
                </div>
                <div className="text-sm text-gray-600 pl-7 space-y-1">
                  <div>+19083256283</div>
                </div>

                <div className="flex items-center gap-2 font-bold text-[#0b2a17] pt-2">
                  <Mail className="w-5 h-5 text-[#0b2a17]" />
                  <span>Email</span>
                </div>
                <div className="text-sm text-gray-600 pl-7">
                  <a href="mailto:contact@tazoota.com" className="text-blue-600 hover:underline font-semibold">contact@tazoota.com</a>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 font-bold text-[#0b2a17]">
                  <Building2 className="w-5 h-5 text-[#0b2a17]" />
                  <span>Our Addresses</span>
                </div>
                <div className="text-sm text-gray-600 pl-7 space-y-2">
                  <div>
                    <strong className="text-gray-900 block">Headquarters:</strong>
                    41 Wilkins Peak Dr, Rock Springs, WY 82901, United States
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Promise Footer */}
          <div className="bg-gradient-to-r from-[#0b2a17] to-[#3a7f4b] text-white p-6 sm:p-8 rounded-xl shadow-md mt-8">
            <h3 className="text-xl font-bold mb-2">Our Promise</h3>
            <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
              We stand behind every product we sell. If something isn&apos;t right with your order, we&apos;ll listen, help, and make it right as quickly as possible.
            </p>
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-gray-300">Have a question about your order?</span>
              <Link
                href="/contact"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-white text-[#0b2a17] font-bold text-sm hover:bg-gray-100 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

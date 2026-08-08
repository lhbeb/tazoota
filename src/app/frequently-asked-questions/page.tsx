import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, HelpCircle, Plus } from 'lucide-react';
import { STORE_FAQS } from '@/lib/storeFaqs';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Tazoota',
  description:
    'Find answers about Tazoota products, ordering, shipping, returns, tracking, local pickup, and customer support.',
  alternates: {
    canonical: 'https://tazoota.com/frequently-asked-questions',
  },
};

export default function FrequentlyAskedQuestionsPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: STORE_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-[#f3f4f6]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="bg-[#0a3075] px-4 py-14 text-[#F0F6FF] sm:py-20">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f5970c] text-[#0a3075]">
            <HelpCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#F0F6FF]/75 sm:text-lg">
            Straightforward answers about shopping, delivery, returns, pickup, and support at Tazoota.
          </p>
        </div>
      </section>

      <section className="px-4 py-12 sm:py-16" aria-label="Frequently asked questions">
        <div className="container mx-auto max-w-4xl">
          <div className="divide-y divide-[#0a3075]/10 border-y border-[#0a3075]/10 bg-white px-5 sm:px-8">
            {STORE_FAQS.map((faq) => (
              <details key={faq.question} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-left text-base font-bold text-[#0a3075] marker:content-none sm:py-6 sm:text-lg">
                  <span>{faq.question}</span>
                  <Plus
                    className="h-5 w-5 shrink-0 text-[#f5970c] transition-transform duration-200 group-open:rotate-45"
                    aria-hidden="true"
                  />
                </summary>
                <div className="max-w-3xl pb-6 pr-8 text-sm leading-7 text-gray-600 sm:text-base">
                  <p>{faq.answer}</p>
                  {faq.linkHref && faq.linkLabel && (
                    <Link
                      href={faq.linkHref}
                      className="mt-3 inline-flex items-center gap-1.5 font-semibold text-[#0a3075] underline decoration-[#f5970c] decoration-2 underline-offset-4"
                    >
                      {faq.linkLabel}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl bg-[#0a3075] p-6 text-[#F0F6FF] sm:flex-row sm:items-center sm:p-8">
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">Still need help?</h2>
              <p className="mt-2 text-sm text-[#F0F6FF]/70 sm:text-base">
                Send us your question and our support team will assist you.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#f5970c] px-5 py-3 text-sm font-bold text-[#0a3075] transition-colors hover:bg-[#ffad2f]"
            >
              Contact Us
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

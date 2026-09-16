import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { SITE, policyGraph } from '@/lib/siteFacts';

export const metadata: Metadata = {
  title: 'Live Chat | Tazoota',
  description:
    'Use the Tazoota live chat widget for customer support, order questions, product questions, and policy help.',
  alternates: {
    canonical: `${SITE.domain}/livechat`,
  },
};

export default function LiveChatPage() {
  const schemaMarkup = policyGraph(
    'WebPage',
    '/livechat',
    'Live Chat',
    'Use the Tazoota live chat widget for customer support, order questions, product questions, and policy help.'
  );

  return (
    <main className="min-h-screen bg-[#f0f7f2] py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      <div className="container mx-auto max-w-4xl px-4">
        <section className="rounded-2xl bg-[#2e6b3e] px-6 py-8 text-[#f0f7f2] shadow-lg sm:px-8">
          <MessageCircle className="mb-4 h-9 w-9 text-[#e3e823]" />
          <h1 className="text-3xl font-bold sm:text-4xl">Live Chat</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#f0f7f2]/85 sm:text-base">
            The Tazoota live chat widget is available on the site for order questions, product questions, shipping help, returns, and general support.
          </p>
        </section>

        <section className="mt-8 rounded-2xl border border-[#2e6b3e]/10 bg-white p-6 text-gray-700 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-[#262626]">How to Start a Chat</h2>
          <p className="mt-3 leading-7">
            Select the chat button on the lower corner of the page to begin a conversation. If live chat is unavailable, send us a message through the contact page or email support.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="inline-flex items-center justify-center rounded-xl bg-[#2e6b3e] px-5 py-3 text-sm font-semibold text-[#f0f7f2] transition hover:bg-[#082317]">
              Contact Page
            </Link>
            <a href={`mailto:${SITE.email}`} className="inline-flex items-center justify-center rounded-xl border border-[#2e6b3e]/20 bg-white px-5 py-3 text-sm font-semibold text-[#2e6b3e] transition hover:bg-[#edf3ee]">
              Email Support
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

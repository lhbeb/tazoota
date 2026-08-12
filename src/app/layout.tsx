import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import ClientHeader from "@/components/ClientHeader";
import Footer from "@/components/Footer";
import NewsletterSection from "@/components/NewsletterSection";
import InstagramSection from "@/components/InstagramSection";
import ErrorBoundaryWrapper from "@/components/ErrorBoundary";
import CookieConsent from "@/components/CookieConsent";
import Script from "next/script";
import { Suspense } from "react";
import VisitNotifier from "@/components/VisitNotifier";
import FacebookPixel from "@/components/FacebookPixel";
import { AdminRouteCheck, PublicRouteOnly, AdminRouteOnly, CheckoutRouteOnly } from "@/components/AdminRouteCheck";
import GlobalErrorReporter from "@/components/GlobalErrorReporter";
import TidioChat from "@/components/TidioChat";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tazoota - Power Your Outdoor and Home Projects With Confidence",
  description: "Shop lawn mowers, power tools, portable generators, and garden essentials at Tazoota. Reliable outdoor equipment for every task. Fast shipping, fair prices, and secure checkout.",
  keywords: "Tazoota, lawn mowers, power tools, portable generators, garden equipment, outdoor power equipment, ride mowers, garden essentials, outdoor tools, home improvement, power equipment",
  authors: [{ name: "Tazoota" }],
  creator: "Tazoota",
  publisher: "Tazoota",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://tazoota.com"),
  openGraph: {
    title: "Tazoota - Power Your Outdoor and Home Projects With Confidence",
    description: "Shop lawn mowers, power tools, portable generators, and garden essentials at Tazoota. Reliable outdoor equipment for every task.",
    url: "https://tazoota.com",
    siteName: "Tazoota",
    images: [
      {
        url: "/g7x.jpeg",
        width: 1200,
        height: 630,
        alt: "Tazoota - Outdoor Power Equipment & Garden Essentials",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tazoota - Power Your Outdoor and Home Projects With Confidence",
    description: "Shop lawn mowers, power tools, portable generators, and garden essentials at Tazoota. Reliable outdoor equipment for every task.",
    images: ["/g7x.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmSans.variable}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="preload" href="/logosvg.svg" as="image" type="image/svg+xml" />
        {/* Facebook Domain Verification */}
        <meta name="facebook-domain-verification" content="k3ytyf6hqaa462mz10uzwnmugj0d0o" />
        <meta name="msvalidate.01" content="75494FC1101908256EEEA046C47C3264" />
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="o8gC6haURQ1t7L9G8xfh_-5imCYNPmnhjnt2IrgEPco" />
        {/* Google Merchant Center Domain Claim Verification */}
        <meta name="google-site-verification" content="IIcw4xDKBiR-hwj3tnHt5Q3I5m2VzAn7LMXe-JXfi_Y" />
      </head>
      <body suppressHydrationWarning className="font-sans antialiased text-[#262626]">
        <GlobalErrorReporter />
        <Suspense fallback={null}>
          <FacebookPixel />
        </Suspense>
        <PublicRouteOnly>
          <VisitNotifier />
        </PublicRouteOnly>
        {/* Organization Schema */}
        <AdminRouteCheck>
          <Script
            id="organization-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Tazoota",
                "url": "https://tazoota.com",
                "logo": "https://tazoota.com/logosvg.svg",
                "description": "Tazoota - Power Your Outdoor and Home Projects With Confidence. Discover reliable lawn mowers, power tools, generators, and garden essentials.",
                "sameAs": [
                  "https://www.tiktok.com/@tazoota_officiel",
                  "https://www.instagram.com/tazoota_officiel/",
                  "https://www.pinterest.com/tazoota_officiel/"
                ],
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer service",
                  "email": "contact@tazoota.com",
                  "telephone": "+19083256283",
                  "areaServed": ["US"]
                },
                "address": [
                  {
                    "@type": "PostalAddress",
                    "streetAddress": "5850 E Raines Rd",
                    "addressLocality": "Memphis",
                    "addressRegion": "TN",
                    "postalCode": "38115",
                    "addressCountry": "US"
                  }
                ]
              })
            }}
          />
        </AdminRouteCheck>

        {/* WebSite Schema */}
        <AdminRouteCheck>
          <Script
            id="website-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Tazoota",
                "url": "https://tazoota.com",
                "description": "Tazoota - Power Your Outdoor and Home Projects With Confidence. Discover reliable lawn mowers, power tools, generators, and garden essentials.",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://tazoota.com/api/products/search?q={search_term_string}"
                  },
                  "query-input": "required name=search_term_string"
                }
              })
            }}
          />
        </AdminRouteCheck>

        <ErrorBoundaryWrapper>
          {/* Public website with header, footer, etc. */}
          <PublicRouteOnly>
            <div className="min-h-screen flex flex-col">
              <Suspense fallback={null}>
                <ClientHeader />
              </Suspense>
              <main className="flex-grow">
                {children}
              </main>
              <Suspense fallback={null}>
                <InstagramSection />
              </Suspense>
              <NewsletterSection />
              <div className="h-4 bg-white md:h-6" aria-hidden="true" />
              <Footer />
            </div>
            <CookieConsent />
          </PublicRouteOnly>

          {/* Checkout page - navbar only, no distractions */}
          <CheckoutRouteOnly>
            <div className="min-h-screen flex flex-col">
              <Suspense fallback={null}>
                <ClientHeader />
              </Suspense>
              <main className="flex-grow">
                {children}
              </main>
            </div>
          </CheckoutRouteOnly>

          {/* Admin dashboard - clean, no public UI */}
          <AdminRouteOnly>
            {children}
          </AdminRouteOnly>
        </ErrorBoundaryWrapper>

        <AdminRouteCheck>
          <Script
            src="https://analyticsapp-five.vercel.app/tracker.js"
            strategy="afterInteractive"
            async
          />
        </AdminRouteCheck>
        <TidioChat />
        <SpeedInsights />
      </body>
    </html>
  );
}

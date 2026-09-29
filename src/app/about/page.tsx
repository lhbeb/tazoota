import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import AboutNotifier from '@/components/AboutNotifier';
import { SITE, breadcrumbJsonLd } from '@/lib/siteFacts';
import {
  Users,
  Shield,
  Heart,
  Zap,
  CheckCircle2,
  Award,
  Target,
  Sparkles,
  Package,
  Eye,
  DollarSign,
  Leaf,
  Headphones,
  MapPin,
  Phone,
  Mail,
  Clock,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Tazoota',
  description:
    'Get to know Tazoota, a U.S. online retailer for practical garden and home products, from watering and planting essentials to tools and outdoor living.',
};

export default function AboutPage() {
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': 'https://tazoota.com/about#webpage',
        'url': 'https://tazoota.com/about',
        'name': 'About Tazoota',
        'description':
          'Tazoota is a U.S. online retailer offering practical products for gardening, home projects, and outdoor living.',
        'mainEntity': {
          '@id': 'https://tazoota.com/#organization',
        },
      },
      {
        '@type': 'OnlineStore',
        '@id': 'https://tazoota.com/#organization',
        'name': 'Tazoota',
        'url': SITE.domain,
        'logo': SITE.logo,
        'description':
          'Online retailer serving the United States with garden, home, and outdoor living products.',
        'email': 'contact@tazoota.com',
        'telephone': ['+19083256283'],
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': '41 Wilkins Peak Dr',
          'addressLocality': 'Rock Springs',
          'addressRegion': 'WY',
          'postalCode': '82901',
          'addressCountry': 'US',
        },
        'contactPoint': [
          {
            '@type': 'ContactPoint',
            'telephone': '+19083256283',
            'contactType': 'customer service',
            'areaServed': ['US'],
            'availableLanguage': ['en'],
          },
        ],
      },
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'About Us', path: '/about' },
      ]),
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f7f2]">
      {/* Schema.org AboutPage & OnlineStore Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      <AboutNotifier />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#2e6b3e] to-[#2e6b3e] text-[#f0f7f2] py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-6">About Tazoota</h1>
          <p className="text-xl text-[#f0f7f2]/85 leading-relaxed max-w-3xl mx-auto">
            Tazoota is an online retailer for garden and home products that make everyday projects easier. From watering and planting to useful tools, storage, and outdoor living, we bring practical finds together with clear product information, straightforward pricing, and customer support you can reach.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl py-12">
        {/* US Presence */}
        <section className="mb-12 border-y border-[#2e6b3e]/15 py-9">
          <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2e6b3e] text-white">
                <MapPin className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-[#262626]">A U.S. retailer, here to help</h2>
            </div>
            <div className="space-y-4 text-base leading-7 text-gray-700">
              <p>
                Tazoota is based in Rock Springs, Wyoming, and serves customers across the United States. We make garden and home shopping simple, with helpful product information and support throughout your order.
              </p>
              <p>
                Eligible products can be collected locally from our Rock Springs location. Our team confirms the available pickup address and collection time for each order before you travel.
              </p>
              <Link href="/local-pickup" className="inline-flex font-semibold text-[#2e6b3e] hover:text-[#082317] hover:underline">
                View the local pickup guide
              </Link>
            </div>
          </div>
        </section>

        {/* How We Keep Prices Low */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#2e6b3e]/10 p-8 mb-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-[#262626]">Useful finds for garden and home</h2>
          </div>
          <p className="text-gray-700 mb-8 text-lg">
            We bring together practical products for the spaces you care for every day: gardens, patios, workshops, and around the home. Our range includes watering supplies, planting and garden tools, outdoor storage, and other useful home-and-garden essentials.
          </p>

          <div className="space-y-6">
            <div className="bg-[#f0f7f2] rounded-xl p-6 border border-[#2e6b3e]/10 border-l-4 border-l-[#2e6b3e]">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#2e6b3e] text-[#f0f7f2] rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#262626] mb-2">Products chosen for everyday projects</h3>
                  <p className="text-gray-700">
                    Explore useful options for watering, planting, garden care, home projects, and outdoor living, with products suited to a range of needs and budgets.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#f0f7f2] rounded-xl p-6 border border-[#2e6b3e]/10 border-l-4 border-l-[#2e6b3e]">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#2e6b3e] text-[#f0f7f2] rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#262626] mb-2">Clear information for confident shopping</h3>
                  <p className="text-gray-700">
                    Product pages bring key details, specifications, images, and delivery information together so you can compare options and choose what works for your project.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#f0f7f2] rounded-xl p-6 border border-[#2e6b3e]/10 border-l-4 border-l-[#2e6b3e]">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#2e6b3e] text-[#f0f7f2] rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#262626] mb-2">A straightforward experience</h3>
                  <p className="text-gray-700 mb-2">
                    From browsing to delivery, Tazoota is your retailer and point of contact. We aim to make product details, pricing, and store policies easy to understand.
                  </p>
                  <p className="text-gray-700">
                    Need help with an item or order? Our customer support team is here to assist.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#f0f7f2] rounded-xl p-6 border border-[#2e6b3e]/10 border-l-4 border-l-[#2e6b3e]">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#2e6b3e] text-[#f0f7f2] rounded-full flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#262626] mb-2">Made for real homes and gardens</h3>
                  <p className="text-gray-700">
                    Whether you are tending plants, organizing outdoor spaces, or taking on a home project, we want it to be easier to find the supplies you need in one place.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#f0f7f2] rounded-xl p-6 border border-[#2e6b3e]/10 border-l-4 border-l-[#2e6b3e]">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#2e6b3e] text-[#f0f7f2] rounded-full flex items-center justify-center font-bold text-lg">
                  5
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#262626] mb-2">Straightforward prices and policies</h3>
                  <p className="text-gray-700">
                    We keep pricing clear and make our shipping, returns, and customer-support information available before you buy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Support Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#2e6b3e]/10 p-8 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-[#2e6b3e]/10 rounded-xl">
              <Users className="h-8 w-8 text-[#2e6b3e]" />
            </div>
            <h2 className="text-3xl font-bold text-[#262626]">Support from one store</h2>
          </div>
          <p className="text-gray-700 mb-4 text-lg">
            Tazoota is the retailer for the products you order here. We work to make the details and next steps clear, with one customer-support contact for your shopping experience.
          </p>
          <p className="text-gray-700 mb-6">
            When comparing products, you can review the information that matters for your purchase:
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#f0f7f2] rounded-lg p-4 border border-[#2e6b3e]/10">
              <CheckCircle2 className="h-6 w-6 text-[#2e6b3e] mb-2" />
              <p className="text-gray-700 font-medium">product condition and included items</p>
            </div>
            <div className="bg-[#f0f7f2] rounded-lg p-4 border border-[#2e6b3e]/10">
              <Zap className="h-6 w-6 text-[#2e6b3e] mb-2" />
              <p className="text-gray-700 font-medium">key features and specifications</p>
            </div>
            <div className="bg-[#f0f7f2] rounded-lg p-4 border border-[#2e6b3e]/10">
              <DollarSign className="h-6 w-6 text-[#2e6b3e] mb-2" />
              <p className="text-gray-700 font-medium">price, shipping, and store policies</p>
            </div>
          </div>

          <p className="text-gray-700 mb-6 bg-[#f0f7f2] rounded-lg p-4 border border-[#2e6b3e]/10">
            Check the product listing for item-specific details, availability, and delivery information.
          </p>

          <div className="bg-[#f0f7f2] rounded-lg p-6 border border-[#2e6b3e]/10">
            <h3 className="text-xl font-bold text-[#262626] mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#2e6b3e]" />
              How it works for customers
            </h3>
            <p className="text-gray-700 mb-3">
              When you place an order through Tazoota, contact us for help with your order, shipping updates, returns, and refunds.
            </p>
            <p className="text-gray-700 mb-3">
              Our goal is to make it easy to understand who you are buying from and where to go when you need assistance.
            </p>
            <p className="text-gray-700">
              Browse practical products for gardening, home projects, and outdoor living, backed by clear store policies and customer support.
            </p>
          </div>
        </div>

        {/* Our Mission */}
        <div className="bg-gradient-to-r from-[#2e6b3e] to-[#2e6b3e] rounded-2xl shadow-lg p-10 mb-12 text-[#f0f7f2] text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#e3e823]/15 rounded-full mb-6">
            <Target className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-xl text-[#f0f7f2]/85 mb-4">
            To help people care for their homes and outdoor spaces with practical garden and home products, clear information, and straightforward service.
          </p>
          <p className="text-lg text-[#f0f7f2]/85">
            From watering and planting to organizing and improving your space, Tazoota brings useful everyday products together in one place.
          </p>
        </div>

        {/* What Makes Us Different */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#2e6b3e]/10 p-8 mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-[#e3e823] rounded-xl">
              <Sparkles className="h-8 w-8 text-[#2e6b3e]" />
            </div>
            <h2 className="text-3xl font-bold text-[#262626]">What Makes Us Different</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#f0f7f2] rounded-xl p-6 border border-[#2e6b3e]/10">
              <div className="flex items-center gap-3 mb-3">
                <Package className="h-6 w-6 text-[#2e6b3e]" />
                <h3 className="text-xl font-bold text-[#262626]">Practical Selection</h3>
              </div>
              <p className="text-gray-700">Find useful products for gardening, home projects, outdoor care, and everyday organization.</p>
            </div>

            <div className="bg-[#f0f7f2] rounded-xl p-6 border border-[#2e6b3e]/10">
              <div className="flex items-center gap-3 mb-3">
                <Eye className="h-6 w-6 text-[#2e6b3e]" />
                <h3 className="text-xl font-bold text-[#262626]">Transparent Product Details</h3>
              </div>
              <p className="text-gray-700">We bring product descriptions, specifications, and images together to help you make an informed choice.</p>
            </div>

            <div className="bg-[#f0f7f2] rounded-xl p-6 border border-[#2e6b3e]/10">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="h-6 w-6 text-[#2e6b3e]" />
                <h3 className="text-xl font-bold text-[#262626]">Real Value</h3>
              </div>
              <p className="text-gray-700">Clear prices and store policies help you know what to expect before placing an order.</p>
            </div>

            <div className="bg-[#f0f7f2] rounded-xl p-6 border border-[#2e6b3e]/10">
              <div className="flex items-center gap-3 mb-3">
                <Headphones className="h-6 w-6 text-[#2e6b3e]" />
                <h3 className="text-xl font-bold text-[#262626]">Customer Focus</h3>
              </div>
              <p className="text-gray-700">We offer free shipping within the United States, a 30-day return policy, and customer support when you need it.</p>
            </div>

            <div className="bg-[#f0f7f2] rounded-xl p-6 border border-[#2e6b3e]/10 md:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <Leaf className="h-6 w-6 text-[#2e6b3e]" />
                <h3 className="text-xl font-bold text-[#262626]">Sustainable Shopping</h3>
              </div>
              <p className="text-gray-700">We encourage thoughtful purchases by sharing product details and helping customers choose items suited to their needs.</p>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#2e6b3e]/10 p-8 mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-[#e3e823] rounded-xl">
              <Heart className="h-8 w-8 text-[#2e6b3e]" />
            </div>
            <h2 className="text-3xl font-bold text-[#262626]">Our Values</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#f0f7f2] rounded-xl p-6 text-center border border-[#2e6b3e]/10">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#e3e823]">
                <Shield className="h-8 w-8 text-[#2e6b3e]" />
              </div>
              <h3 className="font-bold text-[#262626] text-lg">Integrity</h3>
            </div>
            <div className="bg-[#f0f7f2] rounded-xl p-6 text-center border border-[#2e6b3e]/10">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#e3e823]">
                <Award className="h-8 w-8 text-[#2e6b3e]" />
              </div>
              <h3 className="font-bold text-[#262626] text-lg">Quality</h3>
            </div>
            <div className="bg-[#f0f7f2] rounded-xl p-6 text-center border border-[#2e6b3e]/10">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#e3e823]">
                <Users className="h-8 w-8 text-[#2e6b3e]" />
              </div>
              <h3 className="font-bold text-[#262626] text-lg">Customer Trust</h3>
            </div>
            <div className="bg-[#f0f7f2] rounded-xl p-6 text-center border border-[#2e6b3e]/10">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#e3e823]">
                <Zap className="h-8 w-8 text-[#2e6b3e]" />
              </div>
              <h3 className="font-bold text-[#262626] text-lg">Innovation and continuous improvement</h3>
            </div>
          </div>
        </div>

        {/* Service Commitments */}
        <div className="bg-gradient-to-r from-[#2e6b3e] to-[#2e6b3e] rounded-2xl shadow-lg p-10 mb-12 text-[#f0f7f2]">
          <h3 className="text-3xl font-bold mb-8 text-center">Service Commitments</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-[#f0f7f2]/10 backdrop-blur-sm rounded-xl border border-[#f0f7f2]/20">
              <div className="text-4xl font-bold mb-2">US</div>
              <div className="text-[#f0f7f2]/80 text-sm">shipping coverage</div>
            </div>
            <div className="text-center p-6 bg-[#f0f7f2]/10 backdrop-blur-sm rounded-xl border border-[#f0f7f2]/20">
              <div className="text-4xl font-bold mb-2">30</div>
              <div className="text-[#f0f7f2]/80 text-sm">day return window</div>
            </div>
            <div className="text-center p-6 bg-[#f0f7f2]/10 backdrop-blur-sm rounded-xl border border-[#f0f7f2]/20">
              <div className="text-4xl font-bold mb-2">1</div>
              <div className="text-[#f0f7f2]/80 text-sm">business day processing</div>
            </div>
            <div className="text-center p-6 bg-[#f0f7f2]/10 backdrop-blur-sm rounded-xl border border-[#f0f7f2]/20">
              <div className="text-4xl font-bold mb-2">6</div>
              <div className="text-[#f0f7f2]/80 text-sm">support days weekly</div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#2e6b3e]/10 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-[#2e6b3e]/10 rounded-xl">
              <Phone className="h-8 w-8 text-[#2e6b3e]" />
            </div>
            <h3 className="text-2xl font-bold text-[#262626]">Contact Information</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#f0f7f2] rounded-xl p-6 border border-[#2e6b3e]/10">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="h-5 w-5 text-[#2e6b3e]" />
                <div className="font-medium text-[#262626]">Headquarters</div>
              </div>
              <div className="text-gray-600 ml-8">41 Wilkins Peak Dr, Rock Springs, WY 82901, United States</div>
            </div>
            <div className="bg-[#f0f7f2] rounded-xl p-6 border border-[#2e6b3e]/10">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="h-5 w-5 text-[#2e6b3e]" />
                <div className="font-medium text-[#262626]">Phone</div>
              </div>
              <div className="ml-8 space-y-3 text-gray-600">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-1">
                  <a href="tel:+19083256283" className="whitespace-nowrap hover:text-[#2e6b3e] transition-colors">
                    +19083256283
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-[#f0f7f2] rounded-xl p-6 border border-[#2e6b3e]/10">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="h-5 w-5 text-[#2e6b3e]" />
                <div className="font-medium text-[#262626]">Email:</div>
              </div>
              <div className="text-gray-600 ml-8">contact@tazoota.com</div>
            </div>
            <div className="bg-[#f0f7f2] rounded-xl p-6 border border-[#2e6b3e]/10">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-5 w-5 text-[#2e6b3e]" />
                <div className="font-medium text-[#262626]">Business Hours:</div>
              </div>
              <div className="text-gray-600 ml-8 space-y-1">
                <div>Monday to Friday, 9:00 AM to 5:00 PM CST</div>
                <div>Saturday, 10:00 AM to 3:00 PM CST</div>
                <div>Sunday, Closed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

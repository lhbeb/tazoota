import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import AboutNotifier from '@/components/AboutNotifier';
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
    'Learn about Tazoota, your trusted source for lawn mowers, power tools, portable generators, and garden essentials. Operating across the United States with fair prices and quality service.',
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
          'Tazoota is an ecommerce retailer serving customers in the United Kingdom and United States with outdoor power equipment and garden essentials.',
        'mainEntity': {
          '@id': 'https://tazoota.com/#organization',
        },
      },
      {
        '@type': 'OnlineStore',
        '@id': 'https://tazoota.com/#organization',
        'name': 'Tazoota',
        'url': 'https://tazoota.com',
        'description':
          'Ecommerce store serving the United Kingdom and United States with lawn mowers, power tools, portable generators, and garden essentials.',
        'email': 'contact@tazoota.com',
        'telephone': ['+19129231747'],
        'address': [
          {
            '@type': 'PostalAddress',
            'streetAddress': 'Choats Rd',
            'addressLocality': 'Barking',
            'addressRegion': 'Dagenham',
            'postalCode': 'RM9 6BF',
            'addressCountry': 'GB',
          },
          {
            '@type': 'PostalAddress',
            'streetAddress': '5850 E Raines Rd',
            'addressLocality': 'Memphis',
            'addressRegion': 'TN',
            'postalCode': '38115',
            'addressCountry': 'US',
          },
        ],
        'contactPoint': [
          {
            '@type': 'ContactPoint',
            'telephone': '+19129231747',
            'contactType': 'customer service',
            'areaServed': ['GB', 'US'],
            'availableLanguage': ['en'],
          },
        ],
      },
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
            Welcome to Tazoota, your trusted source for outdoor power equipment and home project essentials. Based in the United States, we help smart shoppers find reliable lawn mowers, power tools, portable generators, and garden essentials at fair and transparent prices.
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
              <h2 className="mt-4 text-2xl font-bold text-[#262626]">Proudly US-based</h2>
            </div>
            <div className="space-y-4 text-base leading-7 text-gray-700">
              <p>
                Tazoota operates out of Memphis, Tennessee, serving customers across the United States. Our central warehouse and fulfillment operations are designed to get your order to you fast.
              </p>
              <p>
                Eligible products can be collected locally from our Memphis location. Our team confirms the available pickup address and collection time for each order before you travel.
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
            <h2 className="text-3xl font-bold text-[#262626]">How We Keep Prices Low While Staying 100 Percent Legit</h2>
          </div>
          <p className="text-gray-700 mb-8 text-lg">
            Our business model is based on experience, smart sourcing, and efficiency. The reason our items are often 30 to 50 percent below retail is because we purchase differently from traditional stores.
          </p>

          <div className="space-y-6">
            <div className="bg-[#f0f7f2] rounded-xl p-6 border border-[#2e6b3e]/10 border-l-4 border-l-[#2e6b3e]">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#2e6b3e] text-[#f0f7f2] rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#262626] mb-2">We win thousands of online auctions before items reach the public</h3>
                  <p className="text-gray-700">
                    Our sourcing team participates daily in high volume auctions across multiple platforms. By buying in bulk before products reach regular marketplaces, we secure lower costs and pass those savings directly to our customers.
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
                  <h3 className="text-xl font-bold text-[#262626] mb-2">We negotiate deals across major online marketplaces</h3>
                  <p className="text-gray-700">
                    Our dedicated team searches Facebook Marketplace, OfferUp, eBay, Kleinanzeigen, and other local platforms. We negotiate directly with private sellers, compare prices, and secure the highest value possible, which allows us to keep prices low and inventory diverse.
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
                  <h3 className="text-xl font-bold text-[#262626] mb-2">We partner with the return and liquidation departments of major retailers</h3>
                  <p className="text-gray-700 mb-2">
                    When possible, we obtain bulk lots from companies such as Amazon, Target, Best Buy, and others. These lots include overstock, open box items, shelf pulls, refurbished pieces, and customer returns.
                  </p>
                  <p className="text-gray-700">
                    Every product is carefully inspected, tested, cleaned, or refurbished before being listed.
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
                  <h3 className="text-xl font-bold text-[#262626] mb-2">We hunt for deals locally</h3>
                  <p className="text-gray-700">
                    Our team regularly visits community auctions, garage sales, estate sales, local wholesalers, and liquidation centers. This allows us to discover unique finds and high value items that are often unavailable in traditional stores.
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
                  <h3 className="text-xl font-bold text-[#262626] mb-2">Fair pricing keeps our store competitive</h3>
                  <p className="text-gray-700">
                    Instead of adding heavy markups, we focus on fair margins and fast turnover. This approach keeps our prices consistent, honest, and genuinely competitive.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Private Sellers Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#2e6b3e]/10 p-8 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-[#2e6b3e]/10 rounded-xl">
              <Users className="h-8 w-8 text-[#2e6b3e]" />
            </div>
            <h2 className="text-3xl font-bold text-[#262626]">A New Addition to Our Model: Approved Private Sellers</h2>
          </div>
          <p className="text-gray-700 mb-4 text-lg">
            Over the past three years, we have expanded our sourcing model by partnering with a network of private sellers who share the same dedication to quality and fairness as our in-house team.
          </p>
          <p className="text-gray-700 mb-6">
            These private sellers find, source, and curate their own products, then ship their items to our warehouse. Once the items arrive, our inspection team performs a full evaluation, which includes:
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#f0f7f2] rounded-lg p-4 border border-[#2e6b3e]/10">
              <CheckCircle2 className="h-6 w-6 text-[#2e6b3e] mb-2" />
              <p className="text-gray-700 font-medium">verifying authentic condition</p>
            </div>
            <div className="bg-[#f0f7f2] rounded-lg p-4 border border-[#2e6b3e]/10">
              <Zap className="h-6 w-6 text-[#2e6b3e] mb-2" />
              <p className="text-gray-700 font-medium">confirming that the product works perfectly</p>
            </div>
            <div className="bg-[#f0f7f2] rounded-lg p-4 border border-[#2e6b3e]/10">
              <DollarSign className="h-6 w-6 text-[#2e6b3e] mb-2" />
              <p className="text-gray-700 font-medium">validating that the price reflects real market value</p>
            </div>
          </div>

          <p className="text-gray-700 mb-6 bg-[#f0f7f2] rounded-lg p-4 border border-[#2e6b3e]/10">
            Only after the inspection is complete does the item become available for purchase.
          </p>

          <div className="bg-[#f0f7f2] rounded-lg p-6 border border-[#2e6b3e]/10">
            <h3 className="text-xl font-bold text-[#262626] mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#2e6b3e]" />
              How it works for customers
            </h3>
            <p className="text-gray-700 mb-3">
              When you purchase from a private seller on our platform, it is clearly stated on the product page. The seller sends the item to us first, we inspect it, and only then do we ship it to you.
            </p>
            <p className="text-gray-700 mb-3">
              This process protects buyers and ensures that every product, whether sold by us or by a trusted partner, meets the same high standard.
            </p>
            <p className="text-gray-700">
              Private sellers benefit by earning their own fair profits, while customers benefit from greater variety and consistent quality control.
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
            To give every homeowner and professional access to quality outdoor and power equipment at honest prices.
          </p>
          <p className="text-lg text-[#f0f7f2]/85">
            Whether you need a ride mower, pressure washer, generator, or set of power tools, you should not have to pay more than necessary.
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
                <h3 className="text-xl font-bold text-[#262626]">Curated Inventory</h3>
              </div>
              <p className="text-gray-700">Every product is carefully inspected and verified before it is shipped to the customer.</p>
            </div>

            <div className="bg-[#f0f7f2] rounded-xl p-6 border border-[#2e6b3e]/10">
              <div className="flex items-center gap-3 mb-3">
                <Eye className="h-6 w-6 text-[#2e6b3e]" />
                <h3 className="text-xl font-bold text-[#262626]">Transparent Product Details</h3>
              </div>
              <p className="text-gray-700">We clearly list whether an item is new, open box, refurbished, or pre owned. Customers always know what they are buying.</p>
            </div>

            <div className="bg-[#f0f7f2] rounded-xl p-6 border border-[#2e6b3e]/10">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="h-6 w-6 text-[#2e6b3e]" />
                <h3 className="text-xl font-bold text-[#262626]">Real Value</h3>
              </div>
              <p className="text-gray-700">We constantly compare and track market prices to ensure every listing is a genuine deal.</p>
            </div>

            <div className="bg-[#f0f7f2] rounded-xl p-6 border border-[#2e6b3e]/10">
              <div className="flex items-center gap-3 mb-3">
                <Headphones className="h-6 w-6 text-[#2e6b3e]" />
                <h3 className="text-xl font-bold text-[#262626]">Customer Focus</h3>
              </div>
              <p className="text-gray-700">We offer fast and free shipping within the United States and United Kingdom, a 30-day return policy, and reliable human support.</p>
            </div>

            <div className="bg-[#f0f7f2] rounded-xl p-6 border border-[#2e6b3e]/10 md:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <Leaf className="h-6 w-6 text-[#2e6b3e]" />
                <h3 className="text-xl font-bold text-[#262626]">Sustainable Shopping</h3>
              </div>
              <p className="text-gray-700">By reselling returns, overstock, and refurbished goods, you help reduce waste and support a more sustainable buying cycle.</p>
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

        {/* Company Stats */}
        <div className="bg-gradient-to-r from-[#2e6b3e] to-[#2e6b3e] rounded-2xl shadow-lg p-10 mb-12 text-[#f0f7f2]">
          <h3 className="text-3xl font-bold mb-8 text-center">Company Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-[#f0f7f2]/10 backdrop-blur-sm rounded-xl border border-[#f0f7f2]/20">
              <div className="text-4xl font-bold mb-2">5000+</div>
              <div className="text-[#f0f7f2]/80 text-sm">happy customers</div>
            </div>
            <div className="text-center p-6 bg-[#f0f7f2]/10 backdrop-blur-sm rounded-xl border border-[#f0f7f2]/20">
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-[#f0f7f2]/80 text-sm">products sold</div>
            </div>
            <div className="text-center p-6 bg-[#f0f7f2]/10 backdrop-blur-sm rounded-xl border border-[#f0f7f2]/20">
              <div className="text-4xl font-bold mb-2">99%</div>
              <div className="text-[#f0f7f2]/80 text-sm">satisfaction rate</div>
            </div>
            <div className="text-center p-6 bg-[#f0f7f2]/10 backdrop-blur-sm rounded-xl border border-[#f0f7f2]/20">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-[#f0f7f2]/80 text-sm">support available</div>
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
                <div className="font-medium text-[#262626]">UK Registered Office</div>
              </div>
              <div className="text-gray-600 ml-8">Choats Rd, Barking, Dagenham RM9 6BF, United Kingdom</div>
            </div>
            <div className="bg-[#f0f7f2] rounded-xl p-6 border border-[#2e6b3e]/10">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="h-5 w-5 text-[#2e6b3e]" />
                <div className="font-medium text-[#262626]">US Dispatch Center</div>
              </div>
              <div className="text-gray-600 ml-8">5850 E Raines Rd, Memphis, TN 38115, United States</div>
            </div>
            <div className="bg-[#f0f7f2] rounded-xl p-6 border border-[#2e6b3e]/10">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="h-5 w-5 text-[#2e6b3e]" />
                <div className="font-medium text-[#262626]">Phone</div>
              </div>
              <div className="ml-8 space-y-3 text-gray-600">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-1">
                  <a href="tel:+19129231747" className="whitespace-nowrap hover:text-[#2e6b3e] transition-colors">
                    +19129231747
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
                <div>Monday to Friday, 9:00 AM to 5:00 PM EST</div>
                <div>Saturday, 10:00 AM to 3:00 PM EST</div>
                <div>Sunday, Closed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

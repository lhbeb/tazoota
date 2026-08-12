"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Truck, MapPin, Package } from 'lucide-react';

interface SameDayShippingProps {
  fullWidth?: boolean;
  contained?: boolean;
}

const SameDayShipping: React.FC<SameDayShippingProps> = ({ fullWidth = false, contained = false }) => {
  const content = (
    <div className={`w-full ${fullWidth ? '' : 'max-w-7xl'} mx-auto`}>
      {/* Main Banner */}
      <div className="rounded-2xl overflow-hidden shadow-sm mb-8">
        <div className="flex flex-col md:flex-row">
          {/* Left Section - Image */}
          <div className="relative min-h-[360px] w-full md:min-h-[400px] md:w-[45%]">
            <Image
              src="/delivery-guy.png"
              alt="Tazoota delivery person"
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover object-center"
              priority
            />
          </div>

          {/* Right Section - Content */}
          <div className="md:w-[55%] bg-[#2e6b3e] text-[#f0f7f2] p-12 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-[#e3e823]">
              Same-Day Dispatch
            </h1>

            <p className="text-lg leading-relaxed font-normal mb-12">
              Place your order by 2:00 PM EST and we&apos;ll process, pack, and hand it to one of our trusted delivery partners that same day. At <strong>Tazoota</strong>, fast, dependable fulfillment is part of every order.
            </p>
            <Link
              href="/shipping-policy"
              className="text-[#f0f7f2]/80 hover:text-[#f0f7f2] text-lg underline underline-offset-2 transition-colors"
            >
              See our shipping policy →
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-[#2e6b3e] rounded-full p-3 flex-shrink-0">
              <Clock className="w-6 h-6 text-[#f0f7f2]" />
            </div>
            <div>
              <h3 className="font-bold text-[#262626] text-lg mb-2">
                Fast, Same-Day Processing
              </h3>
              <p className="text-gray-600 text-sm">
                Order before 2:00 PM EST and we&apos;ll prepare your package to begin its journey that same day.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-[#2e6b3e] rounded-full p-3 flex-shrink-0">
              <Package className="w-6 h-6 text-[#f0f7f2]" />
            </div>
            <div>
              <h3 className="font-bold text-[#262626] text-lg mb-2">
                Simple 30-Day Returns
              </h3>
              <p className="text-gray-600 text-sm">
                If an item isn&apos;t right for you, return it within 30 days through our straightforward returns process.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-[#2e6b3e] rounded-full p-3 flex-shrink-0">
              <Truck className="w-6 h-6 text-[#f0f7f2]" />
            </div>
            <div>
              <h3 className="font-bold text-[#262626] text-lg mb-2">
                Tracking You Can Follow
              </h3>
              <p className="text-gray-600 text-sm">
                Our trusted carrier partners provide real-time tracking, so you can follow your package from dispatch to delivery.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="bg-white rounded-xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-gray-500 text-sm mb-2">
            Ready to get your order moving?
          </p>
          <p className="text-2xl md:text-3xl font-bold text-[#262626]">
            Order by <span className="text-[#2e6b3e]">2:00 PM EST</span> for same-day dispatch
          </p>
        </div>
        <a
          href="#products"
          className="bg-[#e3e823] hover:bg-[#e3e823]/90 text-[#2e6b3e] font-bold py-4 px-10 rounded-xl text-lg transition-colors whitespace-nowrap"
        >
          Browse Products
        </a>
      </div>
    </div>
  );

  if (contained) {
    return (
      <div className="py-8 bg-gray-100 rounded-xl">
        {content}
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        {content}
      </div>
    </section>
  );
};

export default SameDayShipping;

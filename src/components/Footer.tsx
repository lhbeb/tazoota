import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Instagram } from 'lucide-react';

const socialIconClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e3e823]/60 text-[#f0f7f2] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#e3e823] hover:bg-[#e3e823] hover:text-[#2e6b3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e3e823] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2e6b3e]';

const Footer = () => {
  return (
    <footer className="bg-[#2e6b3e] text-[#f0f7f2]">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image
                src="/logosvg.svg"
                alt="Tazoota Logo"
                width={160}
                height={36}
                className="h-auto w-36 sm:w-40"
              />
            </Link>
            <p className="mb-4 text-[#f0f7f2]">
              Dependable lawn mowers, power tools, generators, and garden essentials for projects of every size.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <Phone className="h-5 w-5 shrink-0 text-[#e3e823] mr-2" />
                <a href="tel:+19083256283" className="hover:text-[#e3e823] transition-colors duration-300">
                  <span className="font-semibold">United States:</span> +19083256283
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-[#e3e823] mr-2" />
                <a href="mailto:contact@tazoota.com" className="hover:text-[#e3e823] transition-colors duration-300">
                  contact@tazoota.com
                </a>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 shrink-0 text-[#e3e823] mr-2 mt-1" />
                <div>
                  <span className="block font-semibold text-white">Local Pickup Address</span>
                  <span>5850 E Raines Rd, Memphis, TN 38115, United States</span>
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <a
                  href="https://www.tiktok.com/@tazoota_officiel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialIconClass}
                  aria-label="Follow us on TikTok"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/tazoota_officiel/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialIconClass}
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://www.pinterest.com/tazoota_officiel/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialIconClass}
                  aria-label="Follow us on Pinterest"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.936 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#f0f7f2] mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-[#e3e823] transition-colors duration-300">Home</Link></li>
              <li><Link href="/#products" className="hover:text-[#e3e823] transition-colors duration-300">Products</Link></li>
              <li><Link href="/#featured" className="hover:text-[#e3e823] transition-colors duration-300">Featured</Link></li>
              <li><Link href="/track" className="hover:text-[#e3e823] transition-colors duration-300">Track Order</Link></li>
              <li><Link href="/contact" className="hover:text-[#e3e823] transition-colors duration-300">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#f0f7f2] mb-4">Policies & Info</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="hover:text-[#e3e823] transition-colors duration-300">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#e3e823] transition-colors duration-300">Terms of Service</Link></li>
              <li><Link href="/about" className="hover:text-[#e3e823] transition-colors duration-300">About Us</Link></li>
              <li><Link href="/frequently-asked-questions" className="hover:text-[#e3e823] transition-colors duration-300">FAQs</Link></li>
              <li><Link href="/return-policy" className="hover:text-[#e3e823] transition-colors duration-300">Refund & Return Policy</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-[#e3e823] transition-colors duration-300">Shipping Policy</Link></li>
              <li><Link href="/local-pickup" className="hover:text-[#e3e823] transition-colors duration-300">Local Pickup Guide</Link></li>
              <li><Link href="/contact" className="hover:text-[#e3e823] transition-colors duration-300">Contact Us</Link></li>
              <li><Link href="/cookies" className="hover:text-[#e3e823] transition-colors duration-300">Cookies Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#f0f7f2]/20 mt-12 pt-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center">
              <Image
                src="/secure-checkout.png"
                alt="Secure Checkout"
                width={400}
                height={64}
                className="h-16 w-auto max-w-full object-contain brightness-110 contrast-110"
              />
            </div>
            <p className="text-center">© 2025 Tazoota. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, Search, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { getCartCount } from '@/utils/cart';
import type { Product } from '@/types/product';
import ClientOnly from './ClientOnly';
import SearchBar from './SearchBar';

const catalogNavigation = [
  { label: 'All', href: '/#products' },
  { label: 'Lawn Mowers', href: '/search?category=Lawn%20Mowers' },
  { label: 'Swimming Pools', href: '/search?category=Swimming%20Pools' },
  { label: 'Bikes', href: '/search?category=Bikes' },
  { label: 'Electric Scooters', href: '/search?category=Electric%20Scooters' },
  { label: 'Tents', href: '/search?category=Tents' },
] as const;

const desktopNavLinkClass =
  'relative py-1 text-sm font-bold text-[#efefef] transition-colors duration-200 hover:text-[#e3e823] focus-visible:text-[#e3e823] focus-visible:outline-none after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-[#e3e823] after:transition-transform after:duration-200 hover:after:scale-x-100 focus-visible:after:scale-x-100';

const mobileMenuLinkClass =
  'text-center font-bold text-[#262626] transition-colors duration-200 hover:text-[#2e6b3e] focus-visible:text-[#2e6b3e] focus-visible:outline-none';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isSticky, setIsSticky] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const announcementIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if we're on the checkout page
  const isCheckoutPage = pathname === '/checkout';

  const announcements = [
    <span key="nav-1">🚚 <span className="font-bold">Free Shipping</span> Across North America and the UK 🇬🇧</span>,
    <span key="nav-2">📦 <span className="font-bold">Free Returns</span> for <span className="font-bold">30 Days</span></span>,
    "whatsapp-contact" // Special marker for WhatsApp announcement
  ];

  // Announcement bar animation - PRESERVED EXACTLY
  useEffect(() => {
    const startAnnouncementRotation = () => {
      announcementIntervalRef.current = setInterval(() => {
        setCurrentAnnouncement(prev => (prev + 1) % announcements.length);
      }, 2000);
    };

    startAnnouncementRotation();

    return () => {
      if (announcementIntervalRef.current) {
        clearInterval(announcementIntervalRef.current);
      }
    };
  }, [announcements.length]);

  // PRESERVED EXACTLY
  const handleAnnouncementNavigation = (direction: 'prev' | 'next') => {
    if (announcementIntervalRef.current) {
      clearInterval(announcementIntervalRef.current);
    }

    setCurrentAnnouncement(prev => {
      if (direction === 'prev') {
        return prev === 0 ? announcements.length - 1 : prev - 1;
      } else {
        return (prev + 1) % announcements.length;
      }
    });

    // Restart auto-rotation after manual navigation
    setTimeout(() => {
      announcementIntervalRef.current = setInterval(() => {
        setCurrentAnnouncement(prev => (prev + 1) % announcements.length);
      }, 2000);
    }, 100);
  };

  // PRESERVED EXACTLY
  useEffect(() => {
    const updateCartCount = () => {
      if (typeof window !== 'undefined') {
        setCartCount(getCartCount());
      }
    };
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  // PRESERVED EXACTLY
  useEffect(() => {
    const handleScroll = () => {
      // Don't make header sticky on checkout page
      if (pathname === '/checkout') {
        setIsSticky(false);
        return;
      }

      if (typeof window !== 'undefined') {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const promotionalBarHeight = 40;

        if (scrollTop > promotionalBarHeight) {
          setIsSticky(true);
        } else {
          setIsSticky(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  // PRESERVED EXACTLY
  const handleCartClick = () => {
    if (cartCount > 0) {
      router.push('/checkout');
    }
  };

  // PRESERVED EXACTLY
  const handleMobileMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Announcement bar - Yellow background with dark blue text */}
      <div suppressHydrationWarning={true} className="bg-[#e3e823] text-[#2e6b3e] py-2 relative overflow-hidden h-[40px] flex items-center">
        <div suppressHydrationWarning={true} className="container mx-auto px-4 flex items-center justify-center relative w-full h-full">
          {/* Announcement Text - PRESERVED */}
          <div suppressHydrationWarning={true} className="text-center font-medium px-4 sm:px-16 transition-all duration-500 ease-in-out h-full flex items-center justify-center min-h-[24px]">
            {announcements[currentAnnouncement] === "whatsapp-contact" ? (
              <div key={currentAnnouncement} className="flex items-center justify-center animate-fade-in text-xs sm:text-sm md:text-base h-full w-full">
                <a
                  href="https://wa.me/19129231747"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 sm:gap-1.5 hover:opacity-80 transition-opacity flex-wrap justify-center"
                  aria-label="Contact us on WhatsApp"
                >
                  <Image
                    src="/whatsapp-svgrepo-com.svg"
                    alt="WhatsApp"
                    width={20}
                    height={20}
                    className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                    style={{ filter: 'brightness(0)' }}
                  />
                  <span className="whitespace-nowrap">Need a hand? <span className="font-bold">Message us on WhatsApp</span></span>
                  <span className="underline whitespace-nowrap font-bold">+19129231747</span>
                </a>
              </div>
            ) : (
              <span key={currentAnnouncement} className="inline-block animate-fade-in whitespace-nowrap text-sm sm:text-base h-full flex items-center">
                {announcements[currentAnnouncement]}
              </span>
            )}
          </div>

          {/* Desktop Arrows */}
          <button
            onClick={() => handleAnnouncementNavigation('prev')}
            className="hidden sm:block absolute left-1/2 transform -translate-x-56 p-1 hover:bg-[#2e6b3e]/10 rounded-full transition-colors duration-200 z-10 text-[#2e6b3e]"
            aria-label="Previous announcement"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() => handleAnnouncementNavigation('next')}
            className="hidden sm:block absolute left-1/2 transform translate-x-52 p-1 hover:bg-[#2e6b3e]/10 rounded-full transition-colors duration-200 z-10 text-[#2e6b3e]"
            aria-label="Next announcement"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Header - Two-tier layout */}
      <header
        ref={headerRef}
        suppressHydrationWarning={true}
        className={`transition-all duration-300 ${isSticky
          ? 'fixed top-0 left-0 right-0 z-50'
          : 'relative'
          }`}
      >
        {/* Top Row: Logo, Search, Actions */}
        <div suppressHydrationWarning={true} className="bg-[#275e34] text-[#efefef]">
          <div suppressHydrationWarning={true} className="container mx-auto px-4 py-3">
            <div suppressHydrationWarning={true} className="flex items-center justify-between gap-4">
            {/* Logo - PRESERVED */}
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
              <Image
                src="/logosvg.svg"
                alt="Tazoota Logo"
                width={160}
                height={36}
                priority
                className="w-36 sm:w-40 h-auto"
              />
            </Link>

            {/* Desktop Search Bar - NEW */}
            <div suppressHydrationWarning={true} className="hidden lg:flex flex-1 max-w-xl mx-8">
              <div
                suppressHydrationWarning={true}
                onClick={() => setIsSearchOpen(true)}
                className="w-full flex items-center bg-[#e3e5e3] rounded-lg px-4 py-2.5 cursor-pointer transition-shadow hover:shadow-sm"
              >
                <input
                  type="text"
                  placeholder="Search for items..."
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-500 cursor-pointer"
                  readOnly
                />
                <Search className="h-5 w-5 text-gray-500" />
              </div>
            </div>

            {/* Right side actions */}
            <div suppressHydrationWarning={true} className="flex items-center gap-3">
              {/* Mobile Search Icon - Only visible when scrolling (isSticky) */}
              {isSticky && (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="lg:hidden bg-[#e3e823] text-[#2e6b3e] hover:opacity-90 rounded-full p-2"
                  aria-label="Search products"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}

              {/* Help Center Icon - Desktop */}
              <Link
                href="/contact"
                className="hidden sm:flex bg-[#e3e823] text-[#2e6b3e] hover:opacity-90 rounded-full p-2"
                aria-label="Help Center"
              >
                <Info className="h-5 w-5" />
              </Link>

              {/* Cart - PRESERVED with color update */}
              <button
                onClick={handleCartClick}
                className="relative bg-[#e3e823] text-[#2e6b3e] hover:opacity-90 rounded-full p-2"
                aria-label={`Shopping cart ${cartCount > 0 ? `with ${cartCount} items` : '(empty)'}`}
              >
                <ShoppingCart className="h-5 w-5" />
                <ClientOnly>
                  <span className={`absolute -top-2 -right-2 bg-[#efefef] text-[#2e6b3e] text-xs rounded-full h-5 min-w-[1.25rem] px-1 flex items-center justify-center font-semibold transition-opacity duration-300 ${cartCount > 0 ? 'opacity-100' : 'opacity-0'}`}>
                    {cartCount}
                  </span>
                </ClientOnly>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden bg-[#e3e823] text-[#2e6b3e] hover:opacity-90 rounded-full p-2"
                aria-label="Toggle mobile menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        </div>

        {/* Mobile Search Bar - Below header on mobile (hidden when scrolling or on checkout page) */}
        {!isSticky && !isCheckoutPage && (
          <div suppressHydrationWarning={true} className="lg:hidden bg-[#2e6b3e] border-t border-b border-white/10">
            <div suppressHydrationWarning={true} className="container mx-auto px-4 py-3">
              <div
                suppressHydrationWarning={true}
                onClick={() => setIsSearchOpen(true)}
                className="w-full flex items-center bg-[#e3e5e3] rounded-lg px-4 py-2.5 cursor-pointer transition-shadow hover:shadow-sm"
              >
                <input
                  type="text"
                  placeholder="Search for items..."
                  className="flex-1 bg-transparent outline-none text-sm text-[#262626] placeholder-gray-500 cursor-pointer"
                  readOnly
                />
                <Search className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Bar */}
        <div suppressHydrationWarning={true} className="hidden lg:block bg-[#2e6b3e]">
          <div suppressHydrationWarning={true} className="container mx-auto px-4">
            <nav className="flex items-center gap-6 bg-[#2e6b3e] py-3 font-sans">
              {catalogNavigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={desktopNavLinkClass}
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/#featured" className={desktopNavLinkClass}>
                Featured
              </Link>
              <Link href="/track" className={desktopNavLinkClass}>
                Track Order
              </Link>
              <Link href="/frequently-asked-questions" className={desktopNavLinkClass}>
                FAQs
              </Link>
              <Link href="/contact" className={desktopNavLinkClass}>
                Contact us
              </Link>
            </nav>
          </div>
        </div>

        {/* Mobile menu - Only Track Order, Contact Us, and Sell Now */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col bg-white font-sans">
                <Link href="/track" className={`${mobileMenuLinkClass} pb-4 border-b border-gray-200`} onClick={handleMobileMenuClose}>
                  Track Order
                </Link>
                <Link href="/frequently-asked-questions" className={`${mobileMenuLinkClass} py-4 border-b border-gray-200`} onClick={handleMobileMenuClose}>
                  FAQs
                </Link>
                <Link href="/contact" className={`${mobileMenuLinkClass} py-4 border-b border-gray-200`} onClick={handleMobileMenuClose}>
                  Contact Us
                </Link>
              </nav>
            </div>
          </div>
        )}

        {/* SearchBar overlay - PRESERVED */}
        <SearchBar open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </header>

      {/* Mobile Swipeable Menu - Outside header, stays at top of page (hidden on checkout page) */}
      {!isCheckoutPage && (
        <div suppressHydrationWarning={true} className="lg:hidden bg-[#2e6b3e] border-t border-white/10">
          <div suppressHydrationWarning={true} className="overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
            <nav className="flex min-w-max items-center gap-3 bg-[#2e6b3e] px-4 py-3">
              {catalogNavigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex-shrink-0 whitespace-nowrap rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-[#efefef] transition-colors duration-300 hover:border-[#e3e823]/60 hover:bg-[#e3e823]/15"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/#featured"
                className="flex-shrink-0 px-4 py-2 border border-white/20 rounded-full text-sm font-bold text-[#efefef] hover:border-[#e3e823]/60 hover:bg-[#e3e823]/15 transition-colors duration-300 whitespace-nowrap"
              >
                Featured
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

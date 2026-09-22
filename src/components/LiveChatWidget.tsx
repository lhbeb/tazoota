"use client";

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';

export default function LiveChatWidget() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isCheckoutRoute = pathname?.startsWith('/checkout');

  useEffect(() => {
    // The widget script creates this container asynchronously. Apply the route
    // visibility rule now and again when the script inserts the container.
    const chatContainer = document.getElementById('lc-container');
    if (chatContainer) {
      chatContainer.style.display = isAdminRoute || isCheckoutRoute ? 'none' : 'flex';
    }

    const observer = new MutationObserver(() => {
      const container = document.getElementById('lc-container');
      if (container) {
        container.style.display = isAdminRoute || isCheckoutRoute ? 'none' : 'flex';
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname, isAdminRoute, isCheckoutRoute]);

  if (isAdminRoute || isCheckoutRoute) {
    return null;
  }

  return (
    <>
      {/* Push the live chat widget above the mobile sticky Add-to-Cart bar (~72px)
          and above the cart drawer CTA footer (~160px) on small screens.
          On desktop the bar is not fixed so no offset is needed. */}
      <style>{`
        @media (max-width: 1023px) {
          #lc-container {
            bottom: 88px !important;
            transition: bottom 0.3s ease;
          }
        }
      `}</style>
      <Script
        id="tazoota-livechat-script"
        src="https://chatapppay-rust.vercel.app/livechat.js"
        strategy="afterInteractive"
        data-color="#2e6b3e"
        data-position="bottom-right"
        data-button-size="60"
        data-label="Chat with us"
        data-brand="Tazoota"
      />
    </>
  );
}

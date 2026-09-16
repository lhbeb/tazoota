"use client";

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';

export default function LiveChatWidget() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isCheckoutRoute = pathname?.startsWith('/checkout');

  useEffect(() => {
    const chatContainer = document.getElementById('lc-container');
    if (!chatContainer) return;

    chatContainer.style.display = isAdminRoute || isCheckoutRoute ? 'none' : 'flex';
  }, [pathname, isAdminRoute, isCheckoutRoute]);

  if (isAdminRoute || isCheckoutRoute) {
    return null;
  }

  return (
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
  );
}

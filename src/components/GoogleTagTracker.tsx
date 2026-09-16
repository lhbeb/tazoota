"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { GOOGLE_ADS_ID, PAGE_VIEW_CONVERSION_LABEL } from "@/lib/googleAds";

export default function GoogleTagTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!GOOGLE_ADS_ID) return;
    if (pathname.startsWith("/admin")) return;
    if (pathname.startsWith("/checkout")) return;
    if (pathname.startsWith("/thankyou")) return;

    const firePageView = () => {
      if (typeof window === "undefined" || !window.gtag) return;

      window.gtag("event", "page_view", {
        page_path: pathname + window.location.search,
        page_location: window.location.href,
      });

      if (PAGE_VIEW_CONVERSION_LABEL) {
        window.gtag("event", "conversion", {
          send_to: `${GOOGLE_ADS_ID}/${PAGE_VIEW_CONVERSION_LABEL}`,
          value: 1.0,
          currency: "USD",
        });
      }
    };

    if (typeof window !== "undefined" && window.gtag) {
      firePageView();
      return;
    }

    const timer = setTimeout(firePageView, 1500);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}

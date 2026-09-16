export const GOOGLE_ADS_ID = 'AW-18455868323';

const PURCHASE_CONVERSION_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL || '';
const ADD_TO_BASKET_CONVERSION_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_ADD_TO_BASKET_LABEL || '';
const BEGIN_CHECKOUT_CONVERSION_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_BEGIN_CHECKOUT_LABEL || '';
export const PAGE_VIEW_CONVERSION_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_PAGE_VIEW_LABEL || '';

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: Gtag;
  }
}

export function hasGoogleAdsConfig(): boolean {
  return Boolean(GOOGLE_ADS_ID);
}

export function getGoogleAdsTag(): Gtag | null {
  if (typeof window === 'undefined' || !hasGoogleAdsConfig()) return null;

  if (!window.gtag) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
  }

  return window.gtag;
}

export function queueGoogleAdsAddToBasket(
  value: number,
  currency: string,
  itemData?: { id?: string; name?: string },
): boolean {
  const gtag = getGoogleAdsTag();
  if (!gtag) return false;

  const validValue = Number.isFinite(value) && value > 0 ? value : 1.0;
  const validCurrency = currency || 'USD';

  if (ADD_TO_BASKET_CONVERSION_LABEL) {
    gtag('event', 'conversion', {
      send_to: `${GOOGLE_ADS_ID}/${ADD_TO_BASKET_CONVERSION_LABEL}`,
      value: validValue,
      currency: validCurrency,
    });
  }

  gtag('event', 'add_to_cart', {
    value: validValue,
    currency: validCurrency,
    items: [
      {
        item_id: itemData?.id || 'product',
        item_name: itemData?.name || 'Product',
        price: validValue,
        quantity: 1,
      },
    ],
  });

  return true;
}

export function queueGoogleAdsBeginCheckout(value: number, currency: string): boolean {
  const gtag = getGoogleAdsTag();
  if (!gtag) return false;

  const validValue = Number.isFinite(value) && value > 0 ? value : 1.0;
  const validCurrency = currency || 'USD';

  if (BEGIN_CHECKOUT_CONVERSION_LABEL) {
    gtag('event', 'conversion', {
      send_to: `${GOOGLE_ADS_ID}/${BEGIN_CHECKOUT_CONVERSION_LABEL}`,
      value: validValue,
      currency: validCurrency,
    });
  }

  gtag('event', 'begin_checkout', {
    value: validValue,
    currency: validCurrency,
  });

  return true;
}

interface PurchaseConversion {
  value: number;
  currency: string;
  transactionId: string;
  email?: string | null;
  contentId?: string;
  contentName?: string;
}

export function queueGoogleAdsPurchase({
  value,
  currency,
  transactionId,
  email,
  contentId,
  contentName,
}: PurchaseConversion): boolean {
  const gtag = getGoogleAdsTag();
  if (!gtag || !transactionId || !Number.isFinite(value) || value <= 0) return false;

  const normalizedEmail = email?.trim().toLowerCase();
  if (normalizedEmail) {
    gtag('set', 'user_data', { email: normalizedEmail });
  }

  if (PURCHASE_CONVERSION_LABEL) {
    gtag('event', 'conversion', {
      send_to: `${GOOGLE_ADS_ID}/${PURCHASE_CONVERSION_LABEL}`,
      value,
      currency: currency || 'USD',
      transaction_id: transactionId,
    });
  }

  gtag('event', 'purchase', {
    transaction_id: transactionId,
    value,
    currency: currency || 'USD',
    items: [
      {
        item_id: contentId || transactionId,
        item_name: contentName || 'Order Item',
        price: value,
        quantity: 1,
      },
    ],
  });

  return true;
}

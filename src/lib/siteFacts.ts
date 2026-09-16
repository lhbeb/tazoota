export const SITE = {
  name: 'Tazoota',
  domain: 'https://tazoota.com',
  logo: 'https://tazoota.com/logosvg.svg',
  email: 'contact@tazoota.com',
  phone: '+19083256283',
  address: {
    streetAddress: '41 Wilkins Peak Dr',
    addressLocality: 'Rock Springs',
    addressRegion: 'WY',
    postalCode: '82901',
    addressCountry: 'US',
    formatted: '41 Wilkins Peak Dr, Rock Springs, WY 82901, United States',
  },
  hoursText: [
    'Monday to Friday, 9:00 AM to 5:00 PM CST',
    'Saturday and Sunday, Closed',
  ],
  currency: 'USD',
  shipping: {
    country: 'US',
    cost: 0,
    cutoffTime: '2:00 PM CST',
    handlingMin: 0,
    handlingMax: 1,
    transitMin: 5,
    transitMax: 9,
    totalMin: 5,
    totalMax: 10,
  },
  returnPolicyLabel: 'default',
  returns: {
    windowDays: 30,
    refundTiming: 'within 5 business days of approval',
    inspectionTiming: '1-2 business days after we receive your return',
  },
} as const;

export function organizationJsonLd() {
  return {
    '@type': 'OnlineStore',
    '@id': `${SITE.domain}/#organization`,
    name: SITE.name,
    url: SITE.domain,
    logo: SITE.logo,
    image: SITE.logo,
    email: SITE.email,
    telephone: SITE.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.streetAddress,
      addressLocality: SITE.address.addressLocality,
      addressRegion: SITE.address.addressRegion,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.addressCountry,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: SITE.phone,
        email: SITE.email,
        contactType: 'customer service',
        areaServed: ['US'],
        availableLanguage: ['en'],
      },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '17:00',
      },
    ],
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE.domain}${item.path}`,
    })),
  };
}

export function pageJsonLd(type: string, path: string, name: string, description: string) {
  return {
    '@type': type,
    '@id': `${SITE.domain}${path}#webpage`,
    url: `${SITE.domain}${path}`,
    name,
    description,
    isPartOf: {
      '@id': `${SITE.domain}/#website`,
    },
    publisher: {
      '@id': `${SITE.domain}/#organization`,
    },
  };
}

export function policyGraph(type: string, path: string, name: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      pageJsonLd(type, path, name, description),
      organizationJsonLd(),
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name, path },
      ]),
    ],
  };
}

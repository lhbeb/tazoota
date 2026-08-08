export interface StoreFaq {
  question: string;
  answer: string;
  linkHref?: string;
  linkLabel?: string;
}

export const STORE_FAQS: readonly StoreFaq[] = [
  {
    question: 'What products does Tazoota sell?',
    answer:
      'Tazoota specializes in outdoor and home-project equipment, including lawn mowers, blowers, pressure washers, hardware, vacuum cleaners, and related essentials.',
  },
  {
    question: 'Are your products new or pre-owned?',
    answer:
      'Product condition varies by item. The exact condition is displayed on each product page so you can review it before adding the item to your cart.',
  },
  {
    question: 'How do I place an order?',
    answer:
      'Choose a product, add it to your cart, and continue to checkout. Review the product, delivery address, total price, and available payment instructions before completing your order.',
  },
  {
    question: 'Where do you ship and how long does delivery take?',
    answer:
      'Current shipping destinations, handling times, carriers, and estimated delivery windows are listed in our Shipping Policy. Tracking is provided after an eligible order is dispatched.',
    linkHref: '/shipping-policy',
    linkLabel: 'Read our Shipping Policy',
  },
  {
    question: 'How can I track my order?',
    answer:
      'When your order ships, we send tracking information to the email address used during checkout. You can also use our Track Order page for updates.',
    linkHref: '/track',
    linkLabel: 'Track your order',
  },
  {
    question: 'What is your return policy?',
    answer:
      'Eligible items may be returned within 30 calendar days of delivery. Return eligibility, required condition, postage responsibility, refund timing, and step-by-step instructions are explained in our Return & Exchange Policy.',
    linkHref: '/return-policy',
    linkLabel: 'Read our Return & Exchange Policy',
  },
  {
    question: 'Can I exchange an item?',
    answer:
      'Exchanges are accepted for eligible items when replacement inventory is available. Contact our support team within 30 days of delivery before sending anything back.',
  },
  {
    question: 'Is local pickup available?',
    answer:
      'Local pickup is available only for eligible products and must be confirmed by our team. Please wait for a pickup-ready confirmation before travelling to the pickup location.',
    linkHref: '/local-pickup',
    linkLabel: 'View the Local Pickup Guide',
  },
  {
    question: 'Can I change or cancel an order?',
    answer:
      'Contact us as soon as possible. We will try to help before fulfillment begins, but changes or cancellations cannot be guaranteed after an order has entered processing or shipped.',
  },
  {
    question: 'How can I contact Tazoota?',
    answer:
      'You can use our contact form, email contact@tazoota.com, or call +19129231747 during published support hours.',
    linkHref: '/contact',
    linkLabel: 'Contact our team',
  },
];

import type { Metadata } from 'next';
import { SITE, policyGraph } from '@/lib/siteFacts';

export const metadata: Metadata = {
  title: 'Terms of Service | Tazoota',
  description:
    'Tazoota Terms of Service covering orders, products, sourcing, payments, shipping, returns, fraud prevention, and customer support.',
  alternates: {
    canonical: `${SITE.domain}/terms`,
  },
};

const TermsPage = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const schemaMarkup = policyGraph(
    'WebPage',
    '/terms',
    'Terms of Service',
    'Tazoota Terms of Service covering orders, products, sourcing, payments, shipping, returns, fraud prevention, and customer support.'
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-[#262626] mb-2">Tazoota Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last Updated: {currentDate}</p>
        
        <div className="prose max-w-none text-gray-700 space-y-8">
          <p className="text-lg leading-relaxed">
            Welcome to Tazoota. By accessing or using our website or services, you agree to be bound by these Terms of Service. Please read them carefully. If you do not agree, please discontinue using the site.
          </p>

          {/* Section 1: Overview */}
          <div>
            <h2 className="text-3xl font-bold text-[#262626] mt-10 mb-4">1. Overview</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Tazoota operates as an independent ecommerce retailer and reseller.</li>
              <li>We source products through wholesale suppliers, distributors, closeout inventory, overstock programs, and other business supply channels.</li>
              <li>Tazoota is the customer-facing merchant for orders placed through our website.</li>
              <li>All purchases made through Tazoota are processed under these Terms.</li>
            </ul>
          </div>

          {/* Section 2: Account Terms */}
          <div>
            <h2 className="text-3xl font-bold text-[#262626] mt-10 mb-4">2. Account Terms</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must be 18 years or older to use this service.</li>
              <li>You must provide accurate and complete information during account creation.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You must notify us immediately of any unauthorized access or security concerns.</li>
            </ul>
          </div>

          {/* Section 3: Order Review and Fulfillment */}
          <div>
            <h2 className="text-3xl font-bold text-[#262626] mt-10 mb-4">3. Order Review and Fulfillment</h2>
            <p className="mb-4">
              Tazoota reviews orders before fulfillment to protect customers, confirm availability, and verify shipping details.
            </p>

            <h3 className="text-xl font-bold text-[#262626] mt-6 mb-3">3.1 Product Verification</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Product details, condition, pricing, and images are reviewed before publication.</li>
              <li>Inventory availability is verified before an order is shipped.</li>
            </ul>

            <h3 className="text-xl font-bold text-[#262626] mt-6 mb-3">3.2 Fulfillment Process</h3>
            <p className="mb-2">When you place an order:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>We confirm the product, payment status, and delivery information.</li>
              <li>We prepare the item for carrier pickup within the stated processing window.</li>
              <li>Tracking information is sent after the order is dispatched.</li>
            </ul>
            <p className="mb-4">
              Tazoota reserves the right to refund or cancel an order if inventory cannot be fulfilled, payment cannot be verified, or shipping details are incomplete.
            </p>

            <h3 className="text-xl font-bold text-[#262626] mt-6 mb-3">3.3 Customer Support Responsibility</h3>
            <p className="mb-2">For orders placed on Tazoota, our support team assists with:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Order questions and tracking</li>
              <li>Shipping updates</li>
              <li>Return and refund requests</li>
            </ul>
            <p>
              Contact details and support hours are published on our Contact page and in these Terms.
            </p>
          </div>

          {/* Section 4: Product Terms */}
          <div>
            <h2 className="text-3xl font-bold text-[#262626] mt-10 mb-4">4. Product Terms</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>We aim to provide accurate and detailed product descriptions.</li>
              <li>We sell brand new products sourced through business supply and resale channels.</li>
              <li>Products are reviewed for key specifications, condition, and listing accuracy before publication.</li>
              <li>Product availability is not guaranteed until an order is processed.</li>
              <li>Prices may change at any time due to market conditions and sourcing costs.</li>
              <li>We reserve the right to modify, limit, or discontinue any product or listing.</li>
            </ul>
          </div>

          {/* Section 5: Sourcing Transparency */}
          <div>
            <h2 className="text-3xl font-bold text-[#262626] mt-10 mb-4">5. Sourcing Transparency</h2>
            <p className="mb-4">
              By using our website, you acknowledge that Tazoota sources products through:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Manufacturer or distributor agreements where available</li>
              <li>Authorized retail partners where applicable</li>
              <li>Wholesalers and bulk suppliers</li>
              <li>Overstock and closeout inventory of brand new items</li>
            </ul>
            <p>
              These sourcing methods allow us to offer competitive pricing.
            </p>
            <p className="mt-2">
              You agree that cosmetic variations, packaging differences, or shelf pull characteristics may occur with certain items unless stated otherwise.
            </p>
          </div>

          {/* Section 6: Shipping Policy */}
          <div>
            <h2 className="text-3xl font-bold text-[#262626] mt-10 mb-4">6. Shipping Policy</h2>
            <p className="mb-4">
              Free standard shipping applies to all orders within the United States.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Orders placed before 2:00 PM CST are processed the same business day. Orders placed after the cutoff are processed within 1 business day.</li>
              <li>Domestic USA transit time is estimated at 5 to 9 business days after dispatch.</li>
              <li>Total estimated delivery time is 5 to 10 business days.</li>
              <li>All orders qualify for free standard shipping with no minimum spend required.</li>
              <li>Tracking information is sent to the customer via email once the order ships.</li>
            </ul>
            <p className="mt-4">
              Tazoota is not responsible for delays caused by carriers or incorrect shipping information provided by the customer.
            </p>
          </div>

          {/* Section 7: Payment Terms */}
          <div>
            <h2 className="text-3xl font-bold text-[#262626] mt-10 mb-4">7. Payment Terms</h2>
            <p className="mb-4">We accept the following payment methods:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Credit and debit cards</li>
              <li>Visa, Mastercard, American Express</li>
              <li>PayPal</li>
              <li>Apple Pay</li>
            </ul>
            <p className="mt-4">
              All payments must be received in full before an order is processed.
            </p>
          </div>

          {/* Section 8: Returns and Satisfaction Guarantee */}
          <div>
            <h2 className="text-3xl font-bold text-[#262626] mt-10 mb-4">8. Returns and Satisfaction Guarantee</h2>
            <p className="mb-4">Your satisfaction is our priority.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We offer a 30 day hassle free return policy.</li>
              <li>Items must be returned in the same condition received.</li>
              <li>Refunds are issued after the item passes inspection at our warehouse.</li>
              <li>Exchanges are available when inventory permits.</li>
              <li>We work quickly to resolve any concerns, disputes, or issues.</li>
            </ul>
            <p className="mt-4">
              This return policy applies to eligible products purchased directly through Tazoota unless a product page clearly states a specific exception required by law or product type.
            </p>
          </div>

          {/* Section 9: Limitation of Liability */}
          <div>
            <h2 className="text-3xl font-bold text-[#262626] mt-10 mb-4">9. Limitation of Liability</h2>
            <p className="mb-4">
              Tazoota is not liable for indirect, incidental, punitive, or consequential damages arising from your use of our services, products, or platform.
            </p>
            <p>
              However, we are committed to resolving legitimate customer concerns and will work with you to reach a fair and reasonable solution.
            </p>
          </div>

          {/* Section 10: Fraud Prevention and Compliance */}
          <div>
            <h2 className="text-3xl font-bold text-[#262626] mt-10 mb-4">10. Fraud Prevention and Compliance</h2>
            <p className="mb-4">
              Tazoota monitors orders for unusual activity to protect customers and the store.
            </p>
            <p className="mb-4">
              We reserve the right to cancel or delay orders suspected of fraud or unauthorized use of payment methods.
            </p>
            <p>
              Creating false accounts, using unauthorized payment methods, or misrepresenting order information is strictly prohibited.
            </p>
          </div>

          {/* Section 11: Contact Information */}
          <div>
            <h2 className="text-3xl font-bold text-[#262626] mt-10 mb-4">11. Contact Information</h2>
            <p className="mb-4">
              If you have questions about these Terms of Service, please contact us.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <div>
                <div className="font-medium text-[#262626] mb-1">Phone:</div>
                <div className="text-gray-600">+19083256283</div>
              </div>
              <div>
                <div className="font-medium text-[#262626] mb-1">Email:</div>
                <div className="text-gray-600">contact@tazoota.com</div>
              </div>
              <div>
                <div className="font-medium text-[#262626] mb-1">Headquarters:</div>
                <div className="text-gray-600">41 Wilkins Peak Dr, Rock Springs, WY 82901, United States</div>
              </div>
              <div>
                <div className="font-medium text-[#262626] mb-1">Hours:</div>
                <div className="text-gray-600">Monday to Friday, 9:00 AM to 5:00 PM CST</div>
                <div className="text-gray-600">Saturday, 10:00 AM to 3:00 PM CST</div>
                <div className="text-gray-600">Sunday, Closed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage; 

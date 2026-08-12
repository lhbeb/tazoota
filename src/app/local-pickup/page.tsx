import Link from 'next/link';
import { Clock3, MapPin, PackageCheck, ShieldCheck } from 'lucide-react';

const pickupSteps = [
  {
    title: 'Place your order first',
    body: 'Choose your item online and complete checkout before heading to our pickup location.',
    icon: PackageCheck,
  },
  {
    title: 'Wait for pickup confirmation',
    body: 'We will contact you as soon as your order is packed, verified, and ready to be collected.',
    icon: ShieldCheck,
  },
  {
    title: 'Bring your order details',
    body: 'Have your order confirmation, a valid ID, and any collection message ready when you arrive.',
    icon: Clock3,
  },
];

export default function LocalPickupPage() {
  return (
    <div className="min-h-screen bg-[#f0f7f2] py-10 sm:py-14">
      <div className="container mx-auto px-4">
        <div className="overflow-hidden rounded-[32px] border border-[#d8e6da] bg-white shadow-[0_24px_80px_rgba(0,48,153,0.10)]">
          <section className="bg-gradient-to-br from-[#2e6b3e] via-[#2e6b3e] to-[#2e6b3e] px-6 py-10 text-[#f0f7f2] sm:px-10 sm:py-12">
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#f5970c]">
              Local Pickup Guide
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Pick up your Tazoota order with confidence
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#dae6dc] sm:text-base">
              Eligible outdoor power equipment and garden products can be collected from our location in Memphis, Tennessee. This page covers what to expect, what to bring, and how collection works once your order is ready.
            </p>
          </section>

          <div className="grid gap-6 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[minmax(0,1.2fr)_360px]">
            <div className="space-y-8">
              <section className="rounded-[24px] border border-[#dce7de] bg-white p-6 sm:p-7">
                <h2 className="text-2xl font-semibold text-[#262626]">How local pickup works</h2>
                <div className="mt-6 grid gap-4">
                  {pickupSteps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.title} className="rounded-[20px] border border-[#e5ede6] bg-[#f7faf8] p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#edf3ee] text-[#2e6b3e]">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-[#262626]">{step.title}</h3>
                            <p className="mt-2 text-sm leading-7 text-[#5d6b62]">{step.body}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-[24px] border border-[#dce7de] bg-white p-6 sm:p-7">
                <h2 className="text-2xl font-semibold text-[#262626]">Before you arrive</h2>
                <ul className="mt-5 space-y-3 text-sm leading-7 text-[#5d6b62]">
                  <li>Make sure you have received a pickup-ready confirmation from our team.</li>
                  <li>Bring a valid photo ID and your order number.</li>
                  <li>If someone else is collecting for you, contact us in advance so we can note it on the order.</li>
                  <li>For high-value items, we may ask for an extra confirmation step before release.</li>
                </ul>
              </section>

              <section className="rounded-[24px] border border-[#dce7de] bg-white p-6 sm:p-7">
                <h2 className="text-2xl font-semibold text-[#262626]">Need help first?</h2>
                <p className="mt-3 text-sm leading-7 text-[#5d6b62]">
                  If you are unsure whether a product is available for local pickup, please contact us before placing the order so we can confirm availability and timing.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="mailto:contact@tazoota.com"
                    className="inline-flex items-center justify-center rounded-2xl bg-[#2e6b3e] px-5 py-3 text-sm font-semibold text-[#f0f7f2] transition hover:bg-[#082317]"
                  >
                    Email Support
                  </a>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-2xl border border-[#2e6b3e]/20 bg-white px-5 py-3 text-sm font-semibold text-[#2e6b3e] transition hover:bg-[#edf3ee]"
                  >
                    Contact Page
                  </Link>
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-[24px] border border-[#dce7de] bg-[#f7faf8] p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#edf3ee] text-[#2e6b3e]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-[#262626]">Pickup location</h2>
                    <div className="mt-4 space-y-4 text-sm leading-7 text-[#5d6b62]">
                      <address className="not-italic">
                        <span className="block font-semibold text-[#262626]">United States</span>
                        5850 E Raines Rd
                        <br />
                        Memphis, TN 38115
                        <br />
                        United States
                      </address>

                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[24px] border border-[#dce7de] bg-[#f7faf8] p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#edf3ee] text-[#2e6b3e]">
                    <Clock3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#262626]">Collection timing</h2>
                    <p className="mt-3 text-sm leading-7 text-[#5d6b62]">
                      Pickup timing is confirmed directly by our team after your order is prepared. Please do not travel before you receive the ready-for-pickup message.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-[24px] border border-[#dce7de] bg-white p-6">
                <h2 className="text-lg font-semibold text-[#262626]">Important note</h2>
                <p className="mt-3 text-sm leading-7 text-[#5d6b62]">
                  Local pickup availability varies by item. Some products remain shipping-only. Wait for your confirmation message before travelling.
                </p>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

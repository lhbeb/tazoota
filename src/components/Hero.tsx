import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '@/types/product';

const categoryPriority = [
  'garden hose reels',
  'lawn sprinklers',
  'garden hoses',
  'garden hose storage',
  'plant supports & trellises',
  'raised garden beds',
  'water pump hoses',
];

const categoryHeadlines: Record<string, string> = {
  'garden hose reels': 'Make watering easier',
  'lawn sprinklers': 'Water every corner',
  'garden hoses': 'Reach the whole garden',
  'garden hose storage': 'Keep your garden tidy',
  'plant supports & trellises': 'Give climbing plants room',
  'raised garden beds': 'Make space to grow',
  'water pump hoses': 'Move water with confidence',
};

function categoryHref(category: string) {
  return `/search?category=${encodeURIComponent(category)}`;
}

function getCategoryTitle(category: string) {
  return categoryHeadlines[category.toLowerCase()] || `Explore ${category.toLowerCase()}`;
}

export default function Hero({ products }: { products: Product[] }) {
  const grouped = new Map<string, Product[]>();

  for (const product of products) {
    const category = product.category?.trim();
    if (!category || /^all products$/i.test(category) || !product.images?.[0]) continue;

    const key = category.toLowerCase();
    const group = grouped.get(key);
    if (group) group.push(product);
    else grouped.set(key, [product]);
  }

  const categories = Array.from(grouped.values())
    .map((group) => ({
      name: group[0].category.trim(),
      count: group.length,
      product: group.reduce((best, current) =>
        (current.images?.length || 0) > (best.images?.length || 0) ? current : best,
      ),
    }))
    .sort((a, b) => {
      const aPriority = categoryPriority.indexOf(a.name.toLowerCase());
      const bPriority = categoryPriority.indexOf(b.name.toLowerCase());
      const aRank = aPriority === -1 ? categoryPriority.length : aPriority;
      const bRank = bPriority === -1 ? categoryPriority.length : bPriority;
      return b.count - a.count || aRank - bRank || a.name.localeCompare(b.name);
    })
    .slice(0, 4);

  const [primaryCategory, secondaryCategory, ...smallCategories] = categories;
  if (!primaryCategory) return null;

  return (
    <section className="bg-[#f4f7f5] py-4 sm:py-5" aria-labelledby="home-hero-title">
      <div className="container mx-auto px-4">
        <div className="grid w-full gap-3 lg:grid-cols-[1.08fr_1fr]">
          <Link
            href={categoryHref(primaryCategory.name)}
            className="group relative flex min-h-[300px] overflow-hidden rounded-xl bg-[#173a24] shadow-sm sm:min-h-[360px] lg:min-h-[420px]"
          >
            <Image
              src={primaryCategory.product.images[0]}
              alt={primaryCategory.product.title}
              fill
              priority
              unoptimized
              sizes="(max-width: 1023px) 100vw, 52vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.025]"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#173a24]/95 via-[#173a24]/75 to-[#173a24]/10"
              aria-hidden="true"
            />
            <div className="relative z-10 flex max-w-[620px] flex-col justify-end p-6 text-white sm:p-8 md:p-10">
              <p className="text-sm font-semibold text-[#e3e823]">{primaryCategory.name}</p>
              <h1 id="home-hero-title" className="mt-2 text-3xl font-bold leading-tight sm:text-4xl lg:text-[2.75rem]">
                Make more of your outdoor space
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/90 sm:text-base">
                Find practical gear for watering, growing, and caring for your garden.
              </p>
              <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-lg bg-[#e3e823] px-5 py-3 text-sm font-bold text-[#173a24] transition-colors group-hover:bg-white">
                Explore the collection
                <ArrowUpRight size={17} aria-hidden="true" />
              </span>
            </div>
          </Link>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            {secondaryCategory && (
              <Link
                href={categoryHref(secondaryCategory.name)}
                className="group col-span-full grid min-h-[174px] grid-cols-[1fr_0.56fr] overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md lg:min-h-[204px] lg:grid-cols-[1fr_0.72fr]"
              >
                <div className="flex flex-col justify-center p-5 sm:p-6">
                  <p className="text-sm font-semibold text-[#2e6b3e]">{secondaryCategory.name}</p>
                  <h2 className="mt-2 text-xl font-bold leading-tight text-[#202923] sm:text-2xl">
                    {getCategoryTitle(secondaryCategory.name)}
                  </h2>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#2e6b3e]">
                    Browse {secondaryCategory.name} <ArrowUpRight size={16} aria-hidden="true" />
                  </span>
                </div>
                <div className="relative overflow-hidden bg-[#f1f5ec]">
                  <Image
                    src={secondaryCategory.product.images[0]}
                    alt={secondaryCategory.product.title}
                    fill
                    unoptimized
                    sizes="(max-width: 1023px) 40vw, 24vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </Link>
            )}

            {smallCategories.map((category) => (
              <Link
                key={category.name}
                href={categoryHref(category.name)}
                className="group grid min-h-[164px] grid-cols-[1fr_88px] overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md sm:grid-cols-[1fr_100px]"
              >
                <div className="flex flex-col justify-center p-4 sm:p-5">
                  <p className="text-xs font-semibold text-[#2e6b3e] sm:text-sm">{category.name}</p>
                  <h2 className="mt-2 text-lg font-bold leading-tight text-[#202923] sm:text-xl">
                    {getCategoryTitle(category.name)}
                  </h2>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#2e6b3e]">
                    Browse <ArrowUpRight size={15} aria-hidden="true" />
                  </span>
                </div>
                <div className="relative overflow-hidden bg-[#e3e823]">
                  <Image
                    src={category.product.images[0]}
                    alt={category.product.title}
                    fill
                    unoptimized
                    sizes="100px"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

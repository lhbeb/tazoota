import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/product';

const POPULAR_CATEGORY_NAMES = [
  'Blowers',
  'Hardware',
  'Lawn Mowers',
  'Pressure Washers',
  'Vacuum Cleaners',
] as const;

interface PopularCategoriesProps {
  products: Product[];
}

function matchesCategory(productCategory: string | undefined, categoryName: string): boolean {
  if (!productCategory) return false;
  const cat = productCategory.trim().toLowerCase();
  const target = categoryName.trim().toLowerCase();
  if (cat === target) return true;
  if (target === 'lawn mowers') return cat.includes('mower');
  if (target === 'blowers') return cat.includes('blower');
  if (target === 'pressure washers') return cat.includes('pressure washer');
  if (target === 'vacuum cleaners') return cat.includes('vacuum');
  if (target === 'hardware') return cat.includes('hardware') || cat.includes('tool');
  return false;
}

export default function PopularCategories({ products }: PopularCategoriesProps) {
  const categories = POPULAR_CATEGORY_NAMES.map((name) => {
    const categoryProducts = products.filter((product) =>
      matchesCategory(product.category, name),
    );

    const chosenProduct =
      categoryProducts.find((product) => product.isFeatured && product.images?.[0]) ||
      categoryProducts.find((product) => product.images?.[0]);

    return {
      name,
      count: categoryProducts.length,
      image: chosenProduct?.images[0],
    };
  }).filter((category) => category.count > 0 && category.image);

  if (categories.length === 0) return null;

  return (
    <section className="w-full bg-[#f4f7f5] py-12 sm:py-16 md:py-20" aria-labelledby="popular-categories-title">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 md:mb-12 text-center">
            <h2
              id="popular-categories-title"
              className="text-3xl font-extrabold tracking-tight text-[#2e6b3e] sm:text-4xl md:text-5xl text-center"
            >
              Explore Popular Categories
            </h2>
            <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-3xl mx-auto text-center">
              Browse our top-rated equipment collections engineered for strength and reliability.
            </p>
          </div>

          {/* Centered cards container */}
          <div className="flex flex-wrap items-stretch justify-center gap-5 sm:gap-6 w-full">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/search?category=${encodeURIComponent(category.name)}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#2e6b3e]/15 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#2e6b3e]/40 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] max-w-[320px] sm:max-w-none"
                aria-label={`Shop ${category.name}`}
              >
                {/* Centered Image Container */}
                <div className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden bg-white p-4 sm:p-6 flex items-center justify-center">
                  <Image
                    src={category.image!}
                    alt={`${category.name} collection`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain p-4 sm:p-6 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Centered Category Banner */}
                <div className="mt-auto flex items-center justify-center bg-[#2e6b3e] px-4 py-4 text-[#f0f7f2] transition-colors duration-300 group-hover:bg-[#0b2a17]">
                  <h3 className="text-base sm:text-lg font-bold leading-tight tracking-wide text-center">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

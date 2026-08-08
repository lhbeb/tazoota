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

export default function PopularCategories({ products }: PopularCategoriesProps) {
  const categories = POPULAR_CATEGORY_NAMES.map((name) => {
    const categoryProducts = products.filter(
      (product) => product.category?.trim().toLowerCase() === name.toLowerCase(),
    );

    return {
      name,
      count: categoryProducts.length,
      image: categoryProducts.find((product) => product.images?.[0])?.images[0],
    };
  }).filter((category) => category.count > 0 && category.image);

  if (categories.length === 0) return null;

  return (
    <section className="bg-[#f3f4f6] py-14 md:py-20" aria-labelledby="popular-categories-title">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 md:mb-10">
            <h2
              id="popular-categories-title"
              className="text-3xl font-bold tracking-tight text-[#0a3075] md:text-4xl"
            >
              Explore Popular Categories
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/search?category=${encodeURIComponent(category.name)}`}
                className="relative overflow-hidden rounded-2xl border border-[#0a3075]/10 bg-white shadow-[0_12px_30px_rgba(10,48,117,0.06)] transition-colors duration-200 hover:border-[#0a3075]/25"
                aria-label={`Shop ${category.name}`}
              >
                <div className="relative aspect-square overflow-hidden bg-white p-3 sm:p-5">
                  <Image
                    src={category.image!}
                    alt={`${category.name} collection`}
                    fill
                    sizes="(max-width: 1023px) 50vw, 20vw"
                    className="object-contain p-5 sm:p-7"
                  />
                </div>

                <div className="flex min-h-20 items-center bg-[#0a3075] px-4 py-4 text-[#F0F6FF] sm:px-5">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold leading-tight sm:text-base">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

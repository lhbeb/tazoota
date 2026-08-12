import React, { Suspense } from 'react';
import Hero from '@/components/Hero';
import SameDayShipping from '@/components/SameDayShipping';
import ProductGrid from '@/components/ProductGrid';
import HomeReviews from '@/components/HomeReviews';
import CategorySection from '@/components/CategorySection';
import PopularCategories from '@/components/PopularCategories';
import { getFeaturedProducts } from '@/lib/data';
import { homeReviews, homeReviewsStats } from '@/lib/homeReviews';
import ScrollToTop from '@/components/ScrollToTop';
import { FEATURED_PRODUCT_LIMIT } from '@/config/products';

export default async function HomePage() {
  try {
    // Treat featured status as the homepage's data boundary. Keeping this
    // defensive check here prevents any future data-source regression from
    // leaking a non-featured product into a homepage section.
    const featuredProducts = (await getFeaturedProducts()).filter(
      (product) => product.isFeatured === true,
    );

    const lawnGardenProducts = featuredProducts
      .filter(p =>
        p.collections?.includes('lawn-garden') ||
        p.category?.trim().toLowerCase() === 'lawn mowers' ||
        p.category?.trim().toLowerCase().includes('mower')
      );

    const smallToolProducts = featuredProducts.filter((product) =>
      product.collections?.includes('power-tools') &&
      product.category.trim().toLowerCase() === 'hardware'
    );

  return (
    <>
      <Suspense fallback={null}>
        <ScrollToTop />
      </Suspense>
      <Hero />

      <PopularCategories products={featuredProducts} />

      <CategorySection
        products={featuredProducts}
        title="Featured Equipment"
        subtitle="A considered selection of reliable tools and outdoor essentials."
        maxDisplay={FEATURED_PRODUCT_LIMIT}
        shuffleForVisitor
        visitorShuffleKey="home-featured"
      />

      <SameDayShipping />

      {lawnGardenProducts.length > 0 && (
        <Suspense fallback={null}>
          <ProductGrid
            products={lawnGardenProducts}
            sectionId="lawn-garden-equipment"
            title=""
            editorialCard={{
              title: 'Dependable Performance for Every Lawn',
              description:
                'Tazoota lawn mowers combine dependable power, durable construction, and clean, consistent cutting across lawns of every size. Choose gas or cordless performance and make routine yard care simpler, faster, and easier to manage.',
            }}
            randomizeForVisitor
            visitorShuffleKey="home-lawn-garden"
          />
        </Suspense>
      )}

      {smallToolProducts.length > 0 && (
        <Suspense fallback={null}>
          <ProductGrid
            products={smallToolProducts}
            sectionId="durable-tools"
            title="Dependable Tools for Every Job"
            randomizeForVisitor
            visitorShuffleKey="home-durable-tools"
          />
        </Suspense>
      )}

      <HomeReviews
        reviews={homeReviews}
        averageRating={homeReviewsStats.averageRating}
        totalReviews={homeReviewsStats.totalReviews}
      />
    </>
  );
  } catch (error) {
    console.error('Error loading homepage:', error);
    return (
      <>
        <Hero />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-[#262626] mb-4">Unable to load products</h2>
          <p className="text-gray-600">Please refresh the page or try again later.</p>
        </div>
      </>
    );
  }
}

"use client";

import React, { useEffect, useMemo, useState } from 'react';
import ProductCard from './ProductCard';
import type { Product } from '@/types/product';
import { createVisitorRotationSeed, selectRotatedProducts } from '@/utils/visitorProductRotation';

interface CategorySectionProps {
  products: Product[];
  sectionId?: string;
  title?: string;
  subtitle?: string;
  maxDisplay?: number;
  shuffleForVisitor?: boolean;
  visitorShuffleKey?: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  products,
  sectionId = 'products',
  title = 'Power Tools & Generators',
  subtitle = 'Reliable equipment to get the job done.',
  maxDisplay = 8,
  shuffleForVisitor = false,
  visitorShuffleKey = 'home-power-tools',
}) => {
  const featuredProducts = useMemo(() => products, [products]);

  const [displayedProducts, setDisplayedProducts] = useState<Product[]>(() =>
    featuredProducts.slice(0, maxDisplay),
  );

  useEffect(() => {
    if (!featuredProducts || featuredProducts.length === 0) {
      setDisplayedProducts([]);
      return;
    }

    if (!shuffleForVisitor) {
      setDisplayedProducts(featuredProducts.slice(0, maxDisplay));
      return;
    }

    const seed = createVisitorRotationSeed(visitorShuffleKey);
    setDisplayedProducts(selectRotatedProducts(featuredProducts, seed, maxDisplay));
  }, [featuredProducts, shuffleForVisitor, visitorShuffleKey, maxDisplay]);

  if (!displayedProducts || displayedProducts.length === 0) {
    return null;
  }

  return (
    <section id={sectionId} className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="w-full max-w-7xl mx-auto">
          <div className="mb-12 text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-[#262626] mb-4">
              {title}
            </h2>
            <p className="max-w-2xl text-lg text-gray-600">
              {subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cardBackground="bg-gray-100"
                showFullImage
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;

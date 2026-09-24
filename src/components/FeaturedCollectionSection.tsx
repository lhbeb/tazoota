"use client";

import React, { useMemo } from 'react';
import ProductCard from './ProductCard';
import type { Product } from '@/types/product';

interface FeaturedCollectionSectionProps {
  products: Product[];
}

const COLLECTION_LABELS: Record<string, string> = {
  'lawn-garden': 'Lawn & Garden',
  'power-tools': 'Power Tools & Equipment',
  electronics: 'Electronics',
};

export default function FeaturedCollectionSection({ products }: FeaturedCollectionSectionProps) {
  const featuredCollection = useMemo(() => {
    const counts = new Map<string, number>();

    products.forEach((product) => {
      product.collections?.forEach((collection) => {
        const key = collection.trim().toLowerCase();
        if (key) counts.set(key, (counts.get(key) || 0) + 1);
      });
    });

    const preferredOrder = ['power-tools', 'lawn-garden', 'electronics'];
    return preferredOrder
      .filter((collection) => (counts.get(collection) || 0) > 0)
      .sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0))[0] || null;
  }, [products]);

  const collectionProducts = useMemo(() => {
    if (!featuredCollection) return [];
    return products
      .filter((product) => product.collections?.some((collection) => collection.toLowerCase() === featuredCollection))
      .slice(0, 8);
  }, [featuredCollection, products]);

  if (!featuredCollection || collectionProducts.length === 0) return null;

  const collectionLabel = COLLECTION_LABELS[featuredCollection] || featuredCollection;

  return (
    <section id="featured" className="bg-[#f4f7f5] py-16" aria-labelledby="featured-collection-title">
      <div className="container mx-auto px-4">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-[#2e6b3e]">Featured Collection</p>
              <h2 id="featured-collection-title" className="text-3xl font-bold text-[#262626] md:text-4xl">
                {collectionLabel}
              </h2>
              <p className="mt-3 max-w-2xl text-lg text-gray-600">
                Explore a focused collection of dependable products selected for your next project.
              </p>
            </div>
            <a
              href={`/search?collection=${encodeURIComponent(featuredCollection)}`}
              className="font-semibold text-[#2e6b3e] underline decoration-[#e3e823] decoration-2 underline-offset-4"
            >
              View collection
            </a>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {collectionProducts.map((product) => (
              <ProductCard key={product.id} product={product} cardBackground="bg-white" showFullImage />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


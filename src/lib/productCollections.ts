import {
  CATALOG_CLUSTERS,
  getCatalogCollectionsForProduct,
  type CatalogProductLike,
} from '@/lib/catalogClusters';

export const PRODUCT_COLLECTION_OPTIONS = CATALOG_CLUSTERS.map((cluster) => ({
  value: cluster.slug,
  label: cluster.label,
}));

export function getCollectionsForProduct(product: CatalogProductLike): string[] {
  return getCatalogCollectionsForProduct(product);
}

export function getCollectionsForCategory(category: string): string[] {
  return getCatalogCollectionsForProduct({ category });
}

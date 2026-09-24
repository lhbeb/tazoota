export type CatalogProductLike = {
  title?: string | null;
  category?: string | null;
  description?: string | null;
  brand?: string | null;
  collections?: string[] | null;
};

export type CatalogCluster = {
  label: string;
  slug: string;
  patterns: RegExp[];
};

export const CATALOG_CLUSTERS: CatalogCluster[] = [
  {
    label: 'Lawn Mowers',
    slug: 'lawn-mowers',
    patterns: [
      /mower/i,
      /lawn tractor/i,
      /zero[-\s]?turn/i,
      /walk[-\s]?behind/i,
      /field and brush/i,
      /timemaster/i,
      /recycler/i,
      /z master/i,
    ],
  },
  {
    label: 'Generators',
    slug: 'generators',
    patterns: [
      /generator/i,
      /portable power station/i,
      /standby power/i,
      /inverter/i,
      /ecoflow/i,
      /duromax/i,
      /westinghouse/i,
      /predator/i,
    ],
  },
  {
    label: 'Water Heaters',
    slug: 'water-heaters',
    patterns: [
      /water heater/i,
      /tankless/i,
      /boiler/i,
      /combi[-\s]?boiler/i,
      /navien/i,
    ],
  },
  {
    label: 'Garage Lifts',
    slug: 'garage-lifts',
    patterns: [
      /car lift/i,
      /auto lift/i,
      /truck hoist/i,
      /scissor lift/i,
      /two[-\s]?post/i,
      /four[-\s]?post/i,
      /bendpak/i,
      /atlas/i,
      /triumph/i,
      /apluslift/i,
      /maxjax/i,
    ],
  },
  {
    label: 'Snow & Utility',
    slug: 'snow-utility',
    patterns: [
      /snow/i,
      /plow/i,
      /dump cart/i,
      /tiller/i,
      /cultivator/i,
      /skid steer/i,
      /track loader/i,
      /outdoor power equipment/i,
    ],
  },
  {
    label: 'Outdoor Grills',
    slug: 'outdoor-grills',
    patterns: [
      /grill/i,
      /bbq/i,
      /barbecue/i,
      /weber/i,
    ],
  },
  {
    label: 'Home Equipment',
    slug: 'home-equipment',
    patterns: [
      /shed/i,
      /storage/i,
      /refrigerator/i,
      /appliance/i,
      /vehicle parts/i,
      /conversion pump/i,
    ],
  },
] as const;

export const CATALOG_NAVIGATION = [
  { label: 'All', href: '/#products' },
  ...CATALOG_CLUSTERS.slice(0, 6).map((cluster) => ({
    label: cluster.label,
    href: `/search?category=${encodeURIComponent(cluster.label)}`,
  })),
] as const;

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function getProductText(product: CatalogProductLike): string {
  return [
    product.title,
    product.category,
    product.description,
    product.brand,
  ]
    .filter(Boolean)
    .join(' ');
}

export function getCatalogCluster(value: string): CatalogCluster | undefined {
  const normalizedValue = normalize(value);
  return CATALOG_CLUSTERS.find(
    (cluster) =>
      normalize(cluster.label) === normalizedValue ||
      normalize(cluster.slug) === normalizedValue,
  );
}

export function getExactCatalogCategory(value: string): string {
  return getCatalogCluster(value)?.label || '';
}

export function matchesCatalogCluster(product: CatalogProductLike, categoryOrSlug: string): boolean {
  const cluster = getCatalogCluster(categoryOrSlug);
  if (!cluster) return false;

  const explicitCollections = product.collections || [];
  if (
    explicitCollections.some((collection) => {
      const normalizedCollection = normalize(collection);
      return normalizedCollection === normalize(cluster.slug) || normalizedCollection === normalize(cluster.label);
    })
  ) {
    return true;
  }

  const productCategory = normalize(String(product.category || ''));
  if (productCategory && productCategory !== 'all products' && productCategory === normalize(cluster.label)) {
    return true;
  }

  const productText = getProductText(product);
  return cluster.patterns.some((pattern) => pattern.test(productText));
}

export function getCatalogCollectionsForProduct(product: CatalogProductLike): string[] {
  const matches = CATALOG_CLUSTERS
    .filter((cluster) => matchesCatalogCluster(product, cluster.slug))
    .map((cluster) => cluster.slug);

  return matches.length > 0 ? matches : ['home-equipment'];
}

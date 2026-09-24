export const PRODUCT_COLLECTION_OPTIONS = [
  { value: 'lawn-garden', label: 'Lawn & Garden' },
  { value: 'power-tools', label: 'Power Tools & Equipment' },
  { value: 'electronics', label: 'Electronics' },
] as const;

export function getCollectionsForCategory(category: string): string[] {
  const normalized = category.toLowerCase().trim();

  const collections = new Set<string>();

  if (/mower|bike|bicycle|ebike|e-bike|scooter|tent|pool|swimming|trimmer|blower/.test(normalized)) {
    collections.add('lawn-garden');
  }

  if (/pressure washer|vacuum|power|generator|tool|hardware|blower|trimmer/.test(normalized)) {
    collections.add('power-tools');
  }

  if (/console|electronic|camera/.test(normalized)) {
    collections.add('electronics');
  }

  return collections.size > 0 ? [...collections] : ['lawn-garden'];
}

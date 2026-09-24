import SearchPageClient from '@/components/SearchPageClient';

interface SearchPageProps {
  searchParams: Promise<{ query?: string; category?: string; collection?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.query || '';
  const category = params.category || '';
  const collection = params.collection || '';

  return <SearchPageClient initialQuery={query} initialCategory={category} initialCollection={collection} />;
}

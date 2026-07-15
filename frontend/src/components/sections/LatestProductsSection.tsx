import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../../services/productService';
import { ProductGrid } from './ProductGrid';
import { Spinner } from '../ui';

export function LatestProductsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'latest'],
    queryFn: () => getProducts({ sort: 'newest', limit: 8 }),
  });

  if (!isLoading && !data?.products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="mb-6 text-2xl font-bold">Latest Products</h2>
      {isLoading ? <Spinner /> : <ProductGrid products={data?.products || []} />}
    </section>
  );
}

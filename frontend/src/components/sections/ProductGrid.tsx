import type { Product } from '../../types';
import { ProductCard } from '../ProductCard';

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}

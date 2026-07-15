import { useQuery } from '@tanstack/react-query';
import { getWishlist } from '../../services/customerService';
import { ProductGrid } from '../../components/sections/ProductGrid';
import { EmptyState, Spinner } from '../../components/ui';

export default function AccountWishlist() {
  const { data, isLoading } = useQuery({ queryKey: ['wishlist'], queryFn: getWishlist });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h2 className="mb-4 font-semibold">My Wishlist</h2>
      {!data?.wishlist.length ? (
        <EmptyState title="Your wishlist is empty" subtitle="Tap the heart icon on any product to save it here." />
      ) : (
        <ProductGrid products={data.wishlist} />
      )}
    </div>
  );
}

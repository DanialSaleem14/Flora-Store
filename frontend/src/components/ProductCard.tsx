import { Link } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toggleWishlist } from '../services/customerService';
import { getErrorMessage } from '../services/api';
import { useCurrency } from '../hooks/useCurrency';
import { QuickViewModal } from './QuickViewModal';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const formatPrice = useCurrency();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const price = product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.discountPrice! / product.price) * 100) : 0;

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] || '',
      price,
      stock: product.stock,
    });
    toast.success('Added to cart');
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.error('Log in to save items to your wishlist');
      return;
    }
    try {
      await toggleWishlist(product._id);
      setWishlisted((w) => !w);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg">
      <Link to={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.images[0] || 'https://placehold.co/600x600?text=No+Image'}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {hasDiscount && (
          <span className="absolute top-2 left-2 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">
            -{discountPct}%
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setQuickViewOpen(true);
          }}
          className="absolute inset-x-0 bottom-0 hidden translate-y-full bg-black/70 py-2 text-center text-xs font-medium text-white transition-transform group-hover:flex group-hover:translate-y-0 group-hover:justify-center"
        >
          Quick View
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleWishlist();
          }}
          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm shadow"
          aria-label="Toggle wishlist"
        >
          {wishlisted ? '♥' : '♡'}
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link to={`/products/${product.slug}`} className="line-clamp-2 text-sm font-medium text-gray-900">
          {product.name}
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-semibold" style={{ color: 'var(--store-accent)' }}>
            {formatPrice(price)}
          </span>
          {hasDiscount && <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>}
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="store-btn mt-2 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
        >
          {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>

      {quickViewOpen && <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />}
    </div>
  );
}

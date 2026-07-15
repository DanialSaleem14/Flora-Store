import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../hooks/useCurrency';

export function QuickViewModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addItem } = useCart();
  const formatPrice = useCurrency();
  const price = product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="grid w-full max-w-2xl grid-cols-1 gap-4 rounded-lg bg-white p-4 sm:grid-cols-2"
        >
          <img
            src={product.images[0] || 'https://placehold.co/600x600?text=No+Image'}
            alt={product.name}
            className="aspect-square w-full rounded-md object-cover"
          />
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="mt-1 font-semibold" style={{ color: 'var(--store-accent)' }}>
              {formatPrice(price)}
            </p>
            <p className="mt-2 line-clamp-4 text-sm text-gray-600">{product.shortDescription || product.description}</p>
            <button
              type="button"
              onClick={() => {
                addItem({
                  productId: product._id,
                  name: product.name,
                  slug: product.slug,
                  image: product.images[0] || '',
                  price,
                  stock: product.stock,
                });
                toast.success('Added to cart');
                onClose();
              }}
              className="store-btn mt-4 py-2 text-sm font-medium"
            >
              Add to Cart
            </button>
            <Link to={`/products/${product.slug}`} className="mt-2 text-center text-sm underline">
              View full details
            </Link>
            <button type="button" onClick={onClose} className="mt-4 text-xs text-gray-500">
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

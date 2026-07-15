import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { getProductBySlug } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../hooks/useCurrency';
import { FullscreenSpinner } from '../../components/ProtectedRoute';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const formatPrice = useCurrency();
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <FullscreenSpinner />;
  if (!data?.product) return <div className="mx-auto max-w-7xl px-4 py-16 text-center">Product not found.</div>;

  const product = data.product;
  const price = product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Helmet>
        <title>{product.name}</title>
        <meta name="description" content={product.shortDescription || product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:image" content={product.images[0] || ''} />
      </Helmet>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            <img
              src={product.images[activeImage] || 'https://placehold.co/800x800?text=No+Image'}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-md border-2 ${i === activeImage ? 'border-gray-900' : 'border-transparent'}`}
                >
                  <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xl font-semibold" style={{ color: 'var(--store-accent)' }}>
              {formatPrice(price)}
            </span>
            {product.discountPrice && product.discountPrice < product.price && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
            )}
          </div>
          <p className="mt-4 text-sm text-gray-600">{product.description || product.shortDescription}</p>

          {product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-md border border-gray-300">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2">
                −
              </button>
              <span className="px-3 text-sm">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-3 py-2">
                +
              </button>
            </div>
            <button
              disabled={product.stock <= 0}
              onClick={() => {
                addItem(
                  {
                    productId: product._id,
                    name: product.name,
                    slug: product.slug,
                    image: product.images[0] || '',
                    price,
                    stock: product.stock,
                  },
                  qty
                );
                toast.success('Added to cart');
              }}
              className="store-btn flex-1 py-2.5 font-medium disabled:opacity-50"
            >
              {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            SKU: {product.sku || '—'} · {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          <Link to="/products" className="mt-6 inline-block text-sm underline">
            ← Back to products
          </Link>
        </div>
      </div>
    </div>
  );
}

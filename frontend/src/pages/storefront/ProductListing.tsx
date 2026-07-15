import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { getProducts, type ProductPage, type ProductQuery } from '../../services/productService';

type ProductSort = NonNullable<ProductQuery['sort']>;
import { getCategories } from '../../services/categoryService';
import { ProductGrid } from '../../components/sections/ProductGrid';
import { useDebounce } from '../../hooks/useDebounce';
import { Spinner, EmptyState, Button } from '../../components/ui';
import type { Product } from '../../types';

export default function ProductListing() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');
  const debouncedSearch = useDebounce(search);
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';

  const [products, setProducts] = useState<Product[]>([]);
  const [cursor, setCursor] = useState<ProductPage['nextCursor']>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (debouncedSearch) next.set('search', debouncedSearch);
    else next.delete('search');
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  // Reset and refetch the first page whenever filters change.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProducts({ search: debouncedSearch || undefined, category: category || undefined, sort: sort as ProductSort, limit: 12 }).then((res) => {
      if (cancelled) return;
      setProducts(res.products);
      setCursor(res.nextCursor);
      setHasMore(res.hasMore);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, category, sort]);

  const loadMore = async () => {
    setLoadingMore(true);
    const res = await getProducts({ search: debouncedSearch || undefined, category: category || undefined, sort: sort as ProductSort, limit: 12, cursor });
    setProducts((prev) => [...prev, ...res.products]);
    setCursor(res.nextCursor);
    setHasMore(res.hasMore);
    setLoadingMore(false);
  };

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Helmet>
        <title>Shop Products</title>
      </Helmet>
      <h1 className="mb-6 text-2xl font-bold">All Products</h1>

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <select
          value={category}
          onChange={(e) => updateParam('category', e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {categoriesData?.categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="featured">Featured</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : !products.length ? (
        <EmptyState title="No products found" subtitle="Try adjusting your search or filters." />
      ) : (
        <>
          <ProductGrid products={products} />
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button variant="secondary" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

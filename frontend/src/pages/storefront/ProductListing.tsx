import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { getProducts } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { ProductGrid } from '../../components/sections/ProductGrid';
import { useDebounce } from '../../hooks/useDebounce';
import { Spinner, EmptyState } from '../../components/ui';

export default function ProductListing() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');
  const debouncedSearch = useDebounce(search);
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';
  const page = Number(params.get('page') || 1);

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (debouncedSearch) next.set('search', debouncedSearch);
    else next.delete('search');
    next.set('page', '1');
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const { data, isLoading } = useQuery({
    queryKey: ['products', { search: debouncedSearch, category, sort, page }],
    queryFn: () => getProducts({ search: debouncedSearch || undefined, category: category || undefined, sort: sort as any, page, limit: 12 }),
  });

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
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

      {isLoading ? (
        <Spinner />
      ) : !data?.products.length ? (
        <EmptyState title="No products found" subtitle="Try adjusting your search or filters." />
      ) : (
        <>
          <ProductGrid products={data.products} />
          {data.pagination.pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateParam('page', String(p))}
                  className={`h-9 w-9 rounded-md text-sm ${p === page ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

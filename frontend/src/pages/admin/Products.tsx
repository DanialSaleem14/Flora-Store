import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as productService from '../../services/productService';
import type { ProductPage } from '../../services/productService';
import { getErrorMessage } from '../../services/api';
import { useCurrency } from '../../hooks/useCurrency';
import { Button, EmptyState, PageHeader, Spinner } from '../../components/ui';
import type { Product } from '../../types';

export default function AdminProducts() {
  const formatPrice = useCurrency();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [cursor, setCursor] = useState<ProductPage['nextCursor']>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const res = await productService.getProducts({ limit: 10, includeUnpublished: true, search: search || undefined });
    setProducts(res.products);
    setCursor(res.nextCursor);
    setHasMore(res.hasMore);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    reload();
  }, [reload]);

  const loadMore = async () => {
    setLoadingMore(true);
    const res = await productService.getProducts({ limit: 10, includeUnpublished: true, search: search || undefined, cursor });
    setProducts((prev) => [...prev, ...res.products]);
    setCursor(res.nextCursor);
    setHasMore(res.hasMore);
    setLoadingMore(false);
  };

  const runAction = async (id: string, action: () => Promise<unknown>, successMsg: string) => {
    setBusyId(id);
    try {
      await action();
      toast.success(successMsg);
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Products"
        actions={
          <Link to="/admin/products/new">
            <Button>+ Add Product</Button>
          </Link>
        }
      />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products…"
        className="mb-4 w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm"
      />

      {loading ? (
        <Spinner />
      ) : !products.length ? (
        <EmptyState title="No products yet" subtitle="Add your first product to get started." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-gray-100 last:border-0">
                  <td className="flex items-center gap-3 px-4 py-3">
                    <img
                      src={p.images[0] || 'https://placehold.co/60x60'}
                      alt=""
                      className="h-10 w-10 rounded object-cover"
                    />
                    <span className="font-medium">{p.name}</span>
                    {p.featured && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">Featured</span>}
                  </td>
                  <td className="px-4 py-3">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    {p.archived ? (
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">Archived</span>
                    ) : p.published ? (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">Published</span>
                    ) : (
                      <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-700">Draft</span>
                    )}
                  </td>
                  <td className="space-x-2 px-4 py-3 whitespace-nowrap">
                    <Link to={`/admin/products/${p._id}/edit`} className="text-xs underline">
                      Edit
                    </Link>
                    <button
                      disabled={busyId === p._id}
                      onClick={() => runAction(p._id, () => productService.duplicateProduct(p._id), 'Product duplicated')}
                      className="text-xs underline disabled:opacity-50"
                    >
                      Duplicate
                    </button>
                    <button
                      disabled={busyId === p._id}
                      onClick={() => runAction(p._id, () => productService.toggleArchiveProduct(p._id), 'Product updated')}
                      className="text-xs underline disabled:opacity-50"
                    >
                      {p.archived ? 'Unarchive' : 'Archive'}
                    </button>
                    <button
                      disabled={busyId === p._id}
                      onClick={() => {
                        if (confirm('Delete this product?')) runAction(p._id, () => productService.deleteProduct(p._id), 'Product deleted');
                      }}
                      className="text-xs text-red-600 underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading…' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}

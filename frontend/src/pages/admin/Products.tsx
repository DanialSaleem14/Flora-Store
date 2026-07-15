import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as productService from '../../services/productService';
import { getErrorMessage } from '../../services/api';
import { Button, EmptyState, PageHeader, Spinner } from '../../components/ui';

export default function AdminProducts() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => productService.getProducts({ page, limit: 10, includeUnpublished: true, search: search || undefined }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-products'] });

  const deleteMutation = useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      invalidate();
      toast.success('Product deleted');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const duplicateMutation = useMutation({
    mutationFn: productService.duplicateProduct,
    onSuccess: () => {
      invalidate();
      toast.success('Product duplicated');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const archiveMutation = useMutation({
    mutationFn: productService.toggleArchiveProduct,
    onSuccess: () => {
      invalidate();
      toast.success('Product updated');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

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
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        placeholder="Search products…"
        className="mb-4 w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm"
      />

      {isLoading ? (
        <Spinner />
      ) : !data?.products.length ? (
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
              {data.products.map((p) => (
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
                  <td className="px-4 py-3">${p.price.toFixed(2)}</td>
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
                    <button onClick={() => duplicateMutation.mutate(p._id)} className="text-xs underline">
                      Duplicate
                    </button>
                    <button onClick={() => archiveMutation.mutate(p._id)} className="text-xs underline">
                      {p.archived ? 'Unarchive' : 'Archive'}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this product?')) deleteMutation.mutate(p._id);
                      }}
                      className="text-xs text-red-600 underline"
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

      {data && data.pagination.pages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-8 w-8 rounded-md text-sm ${p === page ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

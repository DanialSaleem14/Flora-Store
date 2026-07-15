import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { getCategories } from '../../services/categoryService';
import { Spinner, EmptyState } from '../../components/ui';

export default function Categories() {
  const { data, isLoading } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Helmet>
        <title>Categories</title>
      </Helmet>
      <h1 className="mb-6 text-2xl font-bold">Categories</h1>
      {isLoading ? (
        <Spinner />
      ) : !data?.categories.length ? (
        <EmptyState title="No categories yet" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {data.categories.map((c) => (
            <Link key={c._id} to={`/categories/${c.slug}`} className="group relative aspect-video overflow-hidden rounded-lg bg-gray-100">
              <img
                src={c.image || 'https://placehold.co/400x300?text=' + encodeURIComponent(c.name)}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-end bg-black/30 p-3">
                <span className="font-medium text-white">{c.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { getCategoryBySlug } from '../../services/categoryService';
import { getProducts } from '../../services/productService';
import { ProductGrid } from '../../components/sections/ProductGrid';
import { Spinner, EmptyState } from '../../components/ui';
import { FullscreenSpinner } from '../../components/ProtectedRoute';

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => getCategoryBySlug(slug!),
    enabled: !!slug,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'category', categoryData?.category._id],
    queryFn: () => getProducts({ category: categoryData!.category._id, limit: 24 }),
    enabled: !!categoryData?.category._id,
  });

  if (categoryLoading) return <FullscreenSpinner />;
  if (!categoryData?.category) return <div className="mx-auto max-w-7xl px-4 py-16 text-center">Category not found.</div>;

  const category = categoryData.category;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Helmet>
        <title>{category.name}</title>
        <meta name="description" content={category.description} />
      </Helmet>
      <h1 className="mb-2 text-2xl font-bold">{category.name}</h1>
      {category.description && <p className="mb-6 text-sm text-gray-600">{category.description}</p>}

      {productsLoading ? (
        <Spinner />
      ) : !productsData?.products.length ? (
        <EmptyState title="No products in this category yet" />
      ) : (
        <ProductGrid products={productsData.products} />
      )}
    </div>
  );
}

import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { getPageBySlug } from '../../services/pageService';
import { FullscreenSpinner } from '../../components/ProtectedRoute';
import { sanitizeHtml } from '../../utils/sanitize';

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['page', slug],
    queryFn: () => getPageBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <FullscreenSpinner />;
  if (!data?.page) return <div className="mx-auto max-w-3xl px-4 py-16 text-center">Page not found.</div>;

  const page = data.page;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Helmet>
        <title>{page.metaTitle || page.title}</title>
        <meta name="description" content={page.metaDescription} />
      </Helmet>
      <h1 className="mb-6 text-2xl font-bold">{page.title}</h1>
      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }} />
    </div>
  );
}

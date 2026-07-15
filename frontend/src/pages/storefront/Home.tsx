import { Helmet } from 'react-helmet-async';
import { useStore } from '../../context/StoreContext';
import { SectionRenderer } from '../../components/SectionRenderer';
import { FullscreenSpinner } from '../../components/ProtectedRoute';

export default function Home() {
  const { website, isLoading } = useStore();

  if (isLoading || !website) return <FullscreenSpinner />;

  return (
    <>
      <Helmet>
        <title>{website.settings.seo.metaTitle || website.storeName}</title>
        <meta name="description" content={website.settings.seo.metaDescription} />
        <meta property="og:title" content={website.storeName} />
        <meta property="og:description" content={website.settings.seo.metaDescription} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <SectionRenderer sections={website.homepageSections} />
    </>
  );
}

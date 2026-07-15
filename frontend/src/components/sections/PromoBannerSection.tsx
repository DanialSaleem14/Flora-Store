import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

export function PromoBannerSection() {
  const { website } = useStore();
  const banner = website?.appearance?.bannerImages?.[0];
  if (!banner) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <Link to="/products" className="block overflow-hidden rounded-lg">
        <img src={banner} alt="Promotion" loading="lazy" className="w-full object-cover" />
      </Link>
    </section>
  );
}

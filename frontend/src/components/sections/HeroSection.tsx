import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

export function HeroSection() {
  const { website } = useStore();
  const hero = website?.hero;
  if (!hero) return null;

  return (
    <section
      className="relative flex min-h-[420px] items-center justify-center bg-cover bg-center text-center text-white"
      style={{
        backgroundImage: hero.image
          ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${hero.image})`
          : 'linear-gradient(135deg, var(--store-primary), var(--store-accent))',
      }}
    >
      <div className="mx-auto max-w-2xl px-4">
        <h1 className="text-3xl font-bold sm:text-5xl">{hero.title}</h1>
        <p className="mt-4 text-base sm:text-lg">{hero.subtitle}</p>
        {hero.buttonText && (
          <Link to={hero.buttonLink || '/products'} className="store-btn mt-6 inline-block px-6 py-3 font-medium">
            {hero.buttonText}
          </Link>
        )}
      </div>
    </section>
  );
}

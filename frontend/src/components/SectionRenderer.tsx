import type { HomepageSection } from '../types';
import { HeroSection } from './sections/HeroSection';
import { FeaturedProductsSection } from './sections/FeaturedProductsSection';
import { CategoriesSection } from './sections/CategoriesSection';
import { PromoBannerSection } from './sections/PromoBannerSection';
import { LatestProductsSection } from './sections/LatestProductsSection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { NewsletterSection } from './sections/NewsletterSection';

const SECTION_COMPONENTS: Record<HomepageSection['key'], React.ComponentType> = {
  hero: HeroSection,
  featuredProducts: FeaturedProductsSection,
  categories: CategoriesSection,
  promoBanner: PromoBannerSection,
  latestProducts: LatestProductsSection,
  testimonials: TestimonialsSection,
  newsletter: NewsletterSection,
};

export function SectionRenderer({ sections }: { sections: HomepageSection[] }) {
  const ordered = [...sections].filter((s) => s.enabled).sort((a, b) => a.order - b.order);

  return (
    <>
      {ordered.map((section) => {
        const Component = SECTION_COMPONENTS[section.key];
        return Component ? <Component key={section.key} /> : null;
      })}
    </>
  );
}

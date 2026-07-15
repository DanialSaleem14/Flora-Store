import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWebsite } from '../services/websiteService';
import type { Website } from '../types';

interface StoreContextValue {
  website: Website | undefined;
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const BUTTON_RADIUS: Record<Website['appearance']['buttonStyle'], string> = {
  rounded: '8px',
  square: '2px',
  pill: '999px',
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ['website'],
    queryFn: () => getWebsite().then((r) => r.website),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!data) return;
    const root = document.documentElement;
    const { appearance } = data;
    root.style.setProperty('--store-primary', appearance.primaryColor);
    root.style.setProperty('--store-secondary', appearance.secondaryColor);
    root.style.setProperty('--store-accent', appearance.accentColor);
    root.style.setProperty('--store-font', appearance.fontFamily);
    root.style.setProperty('--store-radius', BUTTON_RADIUS[appearance.buttonStyle] || appearance.borderRadius);
    root.classList.toggle('dark', appearance.defaultMode === 'dark');

    if (appearance.favicon) {
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = appearance.favicon;
    }

    document.title = data.settings.seo.metaTitle || data.storeName;
  }, [data]);

  return <StoreContext.Provider value={{ website: data, isLoading }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

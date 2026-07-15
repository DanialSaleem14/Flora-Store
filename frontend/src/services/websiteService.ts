import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Website } from '../types';

const WEBSITE_REF = doc(db, 'settings', 'website');

const DEFAULT_WEBSITE: Website = {
  storeName: 'My Store',
  logo: '',
  hero: { title: 'Welcome to our store', subtitle: 'Discover products you will love.', image: '', buttonText: 'Shop Now', buttonLink: '/products' },
  about: '',
  footer: { text: '', columns: [] },
  contact: { email: '', phone: '', address: '' },
  social: { facebook: '', instagram: '', twitter: '', youtube: '', tiktok: '' },
  testimonials: [],
  homepageSections: [
    { key: 'hero', enabled: true, order: 0 },
    { key: 'featuredProducts', enabled: true, order: 1 },
    { key: 'categories', enabled: true, order: 2 },
    { key: 'promoBanner', enabled: true, order: 3 },
    { key: 'latestProducts', enabled: true, order: 4 },
    { key: 'testimonials', enabled: true, order: 5 },
    { key: 'newsletter', enabled: true, order: 6 },
  ],
  appearance: {
    primaryColor: '#1a1a1a',
    secondaryColor: '#f5f5f5',
    accentColor: '#4f46e5',
    fontFamily: 'Inter',
    buttonStyle: 'rounded',
    borderRadius: '8px',
    defaultMode: 'light',
    favicon: '',
    bannerImages: [],
  },
  settings: {
    storeEmail: '',
    phone: '',
    address: '',
    currency: 'USD',
    timezone: 'UTC',
    language: 'en',
    seo: { metaTitle: '', metaDescription: '', metaKeywords: '', gaId: '' },
  },
};

// Flattens nested objects into Firestore dot-path keys so a partial update
// (e.g. just `hero.title`) merges into the existing document instead of
// clobbering sibling fields — this is what the old backend's manual
// deep-merge logic was working around; Firestore does it natively via
// updateDoc + dot-notation keys.
const flatten = (obj: Record<string, unknown>, prefix = ''): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flatten(value as Record<string, unknown>, path));
    } else {
      out[path] = value;
    }
  }
  return out;
};

export const getWebsite = async () => {
  const snap = await getDoc(WEBSITE_REF);
  if (!snap.exists()) {
    await setDoc(WEBSITE_REF, DEFAULT_WEBSITE);
    return { success: true, website: DEFAULT_WEBSITE };
  }
  return { success: true, website: snap.data() as Website };
};

export const updateWebsite = async (patch: Partial<Website>) => {
  await updateDoc(WEBSITE_REF, flatten(patch as Record<string, unknown>));
  const snap = await getDoc(WEBSITE_REF);
  return { success: true, website: snap.data() as Website };
};

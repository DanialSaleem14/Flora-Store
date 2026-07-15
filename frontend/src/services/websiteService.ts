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

// Plain (non-Firestore-path) deep merge, used only when writing a brand new
// document — there's no existing doc to apply dot-path partial updates onto.
const deepMerge = <T extends Record<string, unknown>>(base: T, patch: Partial<T>): T => {
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && typeof out[key] === 'object') {
      out[key] = deepMerge(out[key] as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out as T;
};

export const getWebsite = async () => {
  const snap = await getDoc(WEBSITE_REF);
  if (snap.exists()) return { success: true, website: snap.data() as Website };

  // Doc doesn't exist yet. Try to create it with defaults (works if the
  // caller is an admin); if not (any anonymous/customer visitor loading the
  // storefront before an admin ever has), firestore.rules will reject the
  // write — that's expected, not an error, so just serve the defaults
  // in-memory rather than letting the whole storefront crash on it.
  try {
    await setDoc(WEBSITE_REF, DEFAULT_WEBSITE);
  } catch {
    // not authorized to create it — fine, defaults below still render.
  }
  return { success: true, website: DEFAULT_WEBSITE };
};

export const updateWebsite = async (patch: Partial<Website>) => {
  const snap = await getDoc(WEBSITE_REF);
  if (!snap.exists()) {
    // First-ever save (no one has loaded the storefront as an admin yet to
    // trigger the self-heal in getWebsite) — write a full document instead
    // of updateDoc, which requires the doc to already exist.
    await setDoc(WEBSITE_REF, deepMerge(DEFAULT_WEBSITE as unknown as Record<string, unknown>, patch as Record<string, unknown>));
  } else {
    await updateDoc(WEBSITE_REF, flatten(patch as Record<string, unknown>));
  }
  const updated = await getDoc(WEBSITE_REF);
  return { success: true, website: updated.data() as Website };
};

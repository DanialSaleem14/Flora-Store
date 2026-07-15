import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  type DocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Page } from '../types';
import { slugify } from '../utils/slug';

const PAGES = collection(db, 'pages');

const toPage = (snap: DocumentSnapshot<DocumentData>): Page => {
  const data = snap.data();
  if (!data) throw new Error('Page not found');
  return {
    _id: snap.id,
    key: data.key,
    title: data.title,
    slug: snap.id,
    content: data.content || '',
    metaTitle: data.metaTitle || '',
    metaDescription: data.metaDescription || '',
    isSystem: !!data.isSystem,
  };
};

const SYSTEM_PAGES = [
  { key: 'home', title: 'Home' },
  { key: 'about', title: 'About' },
  { key: 'contact', title: 'Contact' },
  { key: 'privacy-policy', title: 'Privacy Policy' },
  { key: 'terms-conditions', title: 'Terms & Conditions' },
  { key: 'faq', title: 'FAQ' },
  { key: 'return-policy', title: 'Return Policy' },
];

// Idempotent — call once (e.g. during migration/first admin setup) to ensure
// the system page slots exist. Mirrors the old backend's ensureSystemPages().
export const ensureSystemPages = async () => {
  for (const sp of SYSTEM_PAGES) {
    const ref = doc(PAGES, sp.key);
    // eslint-disable-next-line no-await-in-loop
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      // eslint-disable-next-line no-await-in-loop
      await setDoc(ref, { key: sp.key, title: sp.title, content: '', metaTitle: '', metaDescription: '', isSystem: true });
    }
  }
};

export const getPages = async () => {
  const snap = await getDocs(query(PAGES, orderBy('title', 'asc')));
  const pages = snap.docs.map(toPage).sort((a, b) => Number(b.isSystem) - Number(a.isSystem));
  return { success: true, pages };
};

export const getPageBySlug = async (slug: string) => {
  const snap = await getDoc(doc(PAGES, slug));
  if (!snap.exists()) throw new Error('Page not found');
  return { success: true, page: toPage(snap) };
};

export const createPage = async (data: Partial<Page>) => {
  const slug = slugify(data.title || '') || `page-${Date.now().toString(36)}`;
  const ref = doc(PAGES, slug);
  await setDoc(ref, {
    key: `custom-${Date.now().toString(36)}`,
    title: data.title,
    content: data.content || '',
    metaTitle: data.metaTitle || '',
    metaDescription: data.metaDescription || '',
    isSystem: false,
  });
  const snap = await getDoc(ref);
  return { success: true, page: toPage(snap) };
};

export const updatePage = async (id: string, data: Partial<Page>) => {
  const payload: Record<string, unknown> = {};
  if (data.title !== undefined) payload.title = data.title;
  if (data.content !== undefined) payload.content = data.content;
  if (data.metaTitle !== undefined) payload.metaTitle = data.metaTitle;
  if (data.metaDescription !== undefined) payload.metaDescription = data.metaDescription;
  await updateDoc(doc(PAGES, id), payload);
  const snap = await getDoc(doc(PAGES, id));
  return { success: true, page: toPage(snap) };
};

export const deletePage = async (id: string) => {
  const snap = await getDoc(doc(PAGES, id));
  if (snap.exists() && snap.data().isSystem) {
    throw new Error('System pages cannot be deleted, only edited');
  }
  await deleteDoc(doc(PAGES, id));
  return { success: true, message: 'Page deleted' };
};

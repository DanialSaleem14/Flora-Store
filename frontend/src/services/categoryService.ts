import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp,
  type DocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Category } from '../types';
import { slugify } from '../utils/slug';

const CATEGORIES = collection(db, 'categories');
const PRODUCTS = collection(db, 'products');

const toCategory = (snap: DocumentSnapshot<DocumentData>): Category => {
  const data = snap.data();
  if (!data) throw new Error('Category not found');
  return {
    _id: snap.id,
    name: data.name,
    slug: data.slug,
    image: data.image || '',
    description: data.description || '',
    featured: !!data.featured,
  };
};

export const getCategories = async () => {
  const snap = await getDocs(query(CATEGORIES, orderBy('name', 'asc')));
  return { success: true, categories: snap.docs.map(toCategory) };
};

export const getCategoryBySlug = async (slug: string) => {
  const snap = await getDocs(query(CATEGORIES, where('slug', '==', slug)));
  if (snap.empty) throw new Error('Category not found');
  return { success: true, category: toCategory(snap.docs[0]) };
};

export const createCategory = async (data: Partial<Category>) => {
  const payload = {
    name: data.name,
    slug: data.slug || slugify(data.name || ''),
    image: data.image || '',
    description: data.description || '',
    featured: !!data.featured,
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(CATEGORIES, payload);
  const snap = await getDoc(ref);
  return { success: true, category: toCategory(snap) };
};

export const updateCategory = async (id: string, data: Partial<Category>) => {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.image !== undefined) payload.image = data.image;
  if (data.description !== undefined) payload.description = data.description;
  if (data.featured !== undefined) payload.featured = !!data.featured;
  await updateDoc(doc(CATEGORIES, id), payload);
  const snap = await getDoc(doc(CATEGORIES, id));
  return { success: true, category: toCategory(snap) };
};

export const deleteCategory = async (id: string) => {
  // Firestore has no foreign-key cascade — clear the reference on any
  // products pointing at this category before deleting it, otherwise they'd
  // be left with a dangling categoryId.
  const referencing = await getDocs(query(PRODUCTS, where('categoryId', '==', id)));
  const batch = writeBatch(db);
  referencing.docs.forEach((d) => batch.update(d.ref, { categoryId: null }));
  batch.delete(doc(CATEGORIES, id));
  await batch.commit();
  return { success: true, message: 'Category deleted', productsUpdated: referencing.size };
};

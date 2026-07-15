import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as fbLimit,
  startAfter,
  serverTimestamp,
  Timestamp,
  getCountFromServer,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type DocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Product } from '../types';
import { uniqueSlug } from '../utils/slug';

const PRODUCTS = collection(db, 'products');

const toProduct = (snap: DocumentSnapshot<DocumentData>): Product => {
  const data = snap.data();
  if (!data) throw new Error('Product not found');
  return {
    _id: snap.id,
    name: data.name,
    slug: data.slug,
    images: data.images || [],
    price: data.price,
    discountPrice: data.discountPrice ?? null,
    description: data.description || '',
    shortDescription: data.shortDescription || '',
    sku: data.sku || '',
    stock: data.stock ?? 0,
    category: data.categoryId ?? null,
    tags: data.tags || [],
    featured: !!data.featured,
    published: data.published !== false,
    archived: !!data.archived,
    createdAt: (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date()).toISOString(),
  };
};

export interface ProductQuery {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  sort?: 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'featured';
  limit?: number;
  includeUnpublished?: boolean;
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
}

export interface ProductPage {
  success: true;
  products: Product[];
  nextCursor: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

const SORT_ORDER: Record<NonNullable<ProductQuery['sort']>, [string, 'asc' | 'desc']> = {
  newest: ['createdAt', 'desc'],
  oldest: ['createdAt', 'asc'],
  'price-asc': ['price', 'asc'],
  'price-desc': ['price', 'desc'],
  featured: ['createdAt', 'desc'], // featured docs are pulled separately then merged; see getProducts
};

// Firestore has no full-text search, so when a search term is present we pull
// a generously-sized batch (fine at boutique-store scale) and filter/paginate
// client-side instead of relying on server-side cursors for that path.
const SEARCH_FETCH_CAP = 300;

export const getProducts = async (opts: ProductQuery = {}): Promise<ProductPage> => {
  const pageSize = opts.limit || 12;
  const constraints: QueryConstraint[] = [];

  if (!opts.includeUnpublished) {
    constraints.push(where('published', '==', true));
    constraints.push(where('archived', '==', false));
  }
  if (opts.category) constraints.push(where('categoryId', '==', opts.category));
  if (opts.featured) constraints.push(where('featured', '==', true));

  if (opts.search) {
    const [field, dir] = SORT_ORDER[opts.sort || 'newest'];
    const snap = await getDocs(query(PRODUCTS, ...constraints, orderBy(field, dir), fbLimit(SEARCH_FETCH_CAP)));
    const term = opts.search.trim().toLowerCase();
    const all = snap.docs.map(toProduct).filter((p) => p.name.toLowerCase().includes(term) || p.tags.some((t) => t.toLowerCase().includes(term)));
    return { success: true, products: all.slice(0, pageSize), nextCursor: null, hasMore: false };
  }

  const [field, dir] = SORT_ORDER[opts.sort || 'newest'];
  constraints.push(orderBy(field, dir));
  if (opts.cursor) constraints.push(startAfter(opts.cursor));
  constraints.push(fbLimit(pageSize));

  const snap = await getDocs(query(PRODUCTS, ...constraints));
  const products = snap.docs.map(toProduct);
  const nextCursor = snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1] : null;

  return { success: true, products, nextCursor, hasMore: !!nextCursor };
};

// Storefront-only (ProductDetail.tsx) — the published/archived filters are
// required, not just filtering: firestore.rules only allows non-admins to
// read products matching that exact shape, so a query without them is
// rejected outright for a signed-out or customer caller, not silently empty.
export const getProductBySlug = async (slug: string) => {
  const snap = await getDocs(
    query(PRODUCTS, where('slug', '==', slug), where('published', '==', true), where('archived', '==', false), fbLimit(1))
  );
  if (snap.empty) throw new Error('Product not found');
  return { success: true, product: toProduct(snap.docs[0]) };
};

export const getProductById = async (id: string) => {
  const snap = await getDoc(doc(PRODUCTS, id));
  if (!snap.exists()) throw new Error('Product not found');
  return { success: true, product: toProduct(snap) };
};

const toFirestoreProduct = (data: Partial<Product>) => ({
  name: data.name,
  images: data.images || [],
  price: data.price,
  discountPrice: data.discountPrice ?? null,
  description: data.description || '',
  shortDescription: data.shortDescription || '',
  sku: data.sku || '',
  stock: data.stock ?? 0,
  categoryId: (data.category as string) || null,
  tags: data.tags || [],
  featured: !!data.featured,
  published: data.published !== false,
  archived: !!data.archived,
});

export const createProduct = async (data: Partial<Product>) => {
  const payload = {
    ...toFirestoreProduct(data),
    slug: uniqueSlug(data.name || 'product'),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(PRODUCTS, payload);
  const snap = await getDoc(ref);
  return { success: true, product: toProduct(snap) };
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
  await updateDoc(doc(PRODUCTS, id), { ...toFirestoreProduct(data), updatedAt: serverTimestamp() });
  const snap = await getDoc(doc(PRODUCTS, id));
  return { success: true, product: toProduct(snap) };
};

export const deleteProduct = async (id: string) => {
  // Images are stored as data URLs inline on the document itself, so
  // deleting the document deletes the images too — no separate cleanup step.
  await deleteDoc(doc(PRODUCTS, id));
  return { success: true, message: 'Product deleted' };
};

export const duplicateProduct = async (id: string) => {
  const snap = await getDoc(doc(PRODUCTS, id));
  if (!snap.exists()) throw new Error('Product not found');
  const original = snap.data();
  const payload = {
    ...original,
    name: `${original.name} (Copy)`,
    slug: uniqueSlug(original.name),
    published: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(PRODUCTS, payload);
  const copySnap = await getDoc(ref);
  return { success: true, product: toProduct(copySnap) };
};

export const toggleArchiveProduct = async (id: string) => {
  const ref = doc(PRODUCTS, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Product not found');
  const archived = !snap.data().archived;
  await updateDoc(ref, { archived, updatedAt: serverTimestamp() });
  const updated = await getDoc(ref);
  return { success: true, product: toProduct(updated) };
};

export const getProductCount = async () => {
  const snap = await getCountFromServer(query(PRODUCTS, where('archived', '==', false)));
  return snap.data().count;
};

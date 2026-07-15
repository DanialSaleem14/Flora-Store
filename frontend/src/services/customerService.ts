import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { collection, getDocs, query, documentId, where } from 'firebase/firestore';
import type { Address, Product } from '../types';

const requireUid = () => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  return uid;
};

const userRef = () => doc(db, 'users', requireUid());

export const getAddresses = async () => {
  const snap = await getDoc(userRef());
  const addresses: Address[] = snap.exists() ? snap.data().addresses || [] : [];
  return { success: true, addresses };
};

export const addAddress = async (data: Address) => {
  const ref = userRef();
  const snap = await getDoc(ref);
  const addresses: Address[] = snap.exists() ? snap.data().addresses || [] : [];
  const withId = { ...data, _id: crypto.randomUUID() };
  const next = data.isDefault ? addresses.map((a) => ({ ...a, isDefault: false })) : addresses;
  await updateDoc(ref, { addresses: [...next, withId] });
  return { success: true, addresses: [...next, withId] };
};

export const updateAddress = async (id: string, data: Partial<Address>) => {
  const ref = userRef();
  const snap = await getDoc(ref);
  const addresses: Address[] = snap.exists() ? snap.data().addresses || [] : [];
  const next = addresses.map((a) => {
    if (a._id !== id) return data.isDefault ? { ...a, isDefault: false } : a;
    return { ...a, ...data };
  });
  await updateDoc(ref, { addresses: next });
  return { success: true, addresses: next };
};

export const deleteAddress = async (id: string) => {
  const ref = userRef();
  const snap = await getDoc(ref);
  const addresses: Address[] = snap.exists() ? snap.data().addresses || [] : [];
  const next = addresses.filter((a) => a._id !== id);
  await updateDoc(ref, { addresses: next });
  return { success: true, addresses: next };
};

export const getWishlist = async () => {
  const snap = await getDoc(userRef());
  const ids: string[] = snap.exists() ? snap.data().wishlist || [] : [];
  if (!ids.length) return { success: true, wishlist: [] as Product[] };

  // Firestore 'in' queries cap at 30 IDs — fine at this app's scale. The
  // published/archived filters are required, not just filtering: a customer
  // (non-admin) query without them is rejected outright by firestore.rules.
  const productsSnap = await getDocs(
    query(
      collection(db, 'products'),
      where(documentId(), 'in', ids.slice(0, 30)),
      where('published', '==', true),
      where('archived', '==', false)
    )
  );
  const wishlist = productsSnap.docs.map((d) => {
    const data = d.data();
    return {
      _id: d.id,
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
      createdAt: new Date().toISOString(),
    } as Product;
  });
  return { success: true, wishlist };
};

export const toggleWishlist = async (productId: string) => {
  const ref = userRef();
  const snap = await getDoc(ref);
  const current: string[] = snap.exists() ? snap.data().wishlist || [] : [];
  const isWishlisted = current.includes(productId);
  await updateDoc(ref, { wishlist: isWishlisted ? arrayRemove(productId) : arrayUnion(productId) });
  return { success: true, wishlist: isWishlisted ? current.filter((id) => id !== productId) : [...current, productId] };
};

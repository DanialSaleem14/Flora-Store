import { doc, getDoc, setDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import type { User } from '../types';

const sanitize = (uid: string, data: Record<string, unknown>): User => ({
  id: uid,
  name: data.name as string,
  email: data.email as string,
  role: data.role as User['role'],
});

// Reads the caller's app-specific profile, auto-provisioning it (always as
// 'customer') the first time a Firebase account is seen — mirrors what the
// old backend's `protect` middleware used to do server-side.
export const getMe = async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');

  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { success: true, user: sanitize(uid, snap.data()) };
  }

  const profile = {
    name: auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'User',
    email: auth.currentUser?.email || '',
    role: 'customer' as const,
  };
  await setDoc(ref, profile);
  return { success: true, user: sanitize(uid, profile) };
};

export const updateMe = async (data: Partial<{ name: string }>) => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  const ref = doc(db, 'users', uid);
  if (data.name) await updateDoc(ref, { name: data.name });
  const snap = await getDoc(ref);
  return { success: true, user: sanitize(uid, snap.data()!) };
};

// One-time bootstrap: the first authenticated user to call this becomes the
// store admin. Firestore rules (see firestore.rules) only allow this
// self-promotion while meta/adminBootstrap.claimed is still false, and the
// transaction flips it to true in the same atomic write so a second caller
// can never win the race.
export const claimFirstAdmin = async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');

  const userRef = doc(db, 'users', uid);
  const bootstrapRef = doc(db, 'meta', 'adminBootstrap');

  await runTransaction(db, async (tx) => {
    const bootstrapSnap = await tx.get(bootstrapRef);
    if (bootstrapSnap.exists() && bootstrapSnap.data().claimed) {
      throw new Error('An admin already exists for this store. Ask them to grant you access.');
    }
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) {
      throw new Error('Profile not found — please try logging in again first.');
    }
    tx.update(userRef, { role: 'admin' });
    tx.set(bootstrapRef, { claimed: true });
  });

  const snap = await getDoc(userRef);
  return { success: true, user: sanitize(uid, snap.data()!) };
};

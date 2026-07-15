import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export const subscribeNewsletter = async (email: string) => {
  await addDoc(collection(db, 'newsletter'), { email, createdAt: serverTimestamp() });
  return { success: true, message: 'Subscribed successfully.' };
};

import { collection, addDoc, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export const subscribeNewsletter = async (email: string) => {
  await addDoc(collection(db, 'newsletter'), { email, createdAt: serverTimestamp() });
  return { success: true, message: 'Subscribed successfully.' };
};

export interface NewsletterSubscriber {
  _id: string;
  email: string;
  createdAt: string;
}

export const getNewsletterSubscribers = async () => {
  const snap = await getDocs(query(collection(db, 'newsletter'), orderBy('createdAt', 'desc')));
  const subscribers: NewsletterSubscriber[] = snap.docs.map((d) => {
    const data = d.data();
    return {
      _id: d.id,
      email: data.email,
      createdAt: (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date()).toISOString(),
    };
  });
  return { success: true, subscribers };
};

export const deleteNewsletterSubscriber = async (id: string) => {
  await deleteDoc(doc(db, 'newsletter', id));
  return { success: true };
};

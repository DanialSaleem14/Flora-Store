import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

// Uploads straight from the browser to Firebase Storage — no backend
// involvement. Storage security rules (see README) restrict writes to
// authenticated admins, same trust boundary the old backend-mediated
// upload endpoint enforced, just moved into Storage rules instead of code.
export const uploadImageToStorage = (file: File, folder = 'store', onProgress?: (pct: number) => void) =>
  new Promise<string>((resolve, reject) => {
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      'state_changed',
      (snapshot) => {
        if (onProgress) onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
      },
      reject,
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        } catch (err) {
          reject(err);
        }
      }
    );
  });

export const uploadImagesToStorage = (files: File[], folder = 'store', onProgress?: (pct: number) => void) =>
  Promise.all(files.map((file) => uploadImageToStorage(file, folder, onProgress)));

// Client-side image compression + base64 encoding — images are stored
// directly as data URLs inside Firestore documents (no Firebase Storage
// involved), so every image must be resized/compressed to comfortably fit
// within Firestore's 1MB-per-document limit. A product can hold up to 10
// images in one document alongside its other fields, so the per-image
// budget has to be tight enough that even a full set stays well under 1MB.
const MAX_DIMENSION = 640;
const JPEG_QUALITY = 0.6;
const MAX_DATA_URL_BYTES = 90_000; // ~90KB/image — 10 images stays ~900KB, leaving room for the rest of the document
export const MAX_TOTAL_IMAGES_BYTES = 900_000; // safety cap across an entire images[] array

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });

export const dataUrlByteSize = (dataUrl: string) => Math.round((dataUrl.length * 3) / 4);

export const compressImageToDataUrl = async (file: File): Promise<string> => {
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process image');
  ctx.drawImage(img, 0, 0, width, height);
  URL.revokeObjectURL(img.src);

  let quality = JPEG_QUALITY;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);

  // Step quality down further if still too large (e.g. very busy/detailed photos).
  while (dataUrlByteSize(dataUrl) > MAX_DATA_URL_BYTES && quality > 0.25) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  if (dataUrlByteSize(dataUrl) > MAX_DATA_URL_BYTES) {
    throw new Error('This image is too detailed to compress small enough — try a simpler/smaller photo.');
  }

  return dataUrl;
};

export const compressImagesToDataUrls = (files: File[], onProgress?: (pct: number) => void): Promise<string[]> => {
  let completed = 0;
  return Promise.all(
    files.map(async (file) => {
      const result = await compressImageToDataUrl(file);
      completed += 1;
      onProgress?.(Math.round((completed / files.length) * 100));
      return result;
    })
  );
};

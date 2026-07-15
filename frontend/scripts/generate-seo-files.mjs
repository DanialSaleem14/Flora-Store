// Runs as a `prebuild` step: reads published products/pages from Firestore
// (public read, no auth needed) and writes static sitemap.xml/robots.txt into
// public/ before Vite builds. No server needed to serve these dynamically —
// they're just regenerated fresh on every deploy.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');

const env = {};
try {
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) env[match[1]] = match[2].trim();
  }
} catch {
  console.warn('No .env found — skipping SEO file generation (using defaults).');
}

const clientUrl = env.VITE_CLIENT_URL || 'https://flora-store-c4f9e.web.app';
const publicDir = path.join(__dirname, '..', 'public');

const writeFallback = () => {
  writeFileSync(path.join(publicDir, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /account\n\nSitemap: ${clientUrl}/sitemap.xml\n`);
  writeFileSync(
    path.join(publicDir, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>${clientUrl}/</loc></url>\n</urlset>\n`
  );
  console.log('Wrote fallback robots.txt/sitemap.xml (no Firestore data).');
};

if (!env.VITE_FIREBASE_PROJECT_ID) {
  writeFallback();
  process.exit(0);
}

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});
const db = getFirestore(app);

try {
  const [productsSnap, pagesSnap] = await Promise.all([
    getDocs(query(collection(db, 'products'), where('published', '==', true), where('archived', '==', false))),
    getDocs(collection(db, 'pages')),
  ]);

  const staticUrls = ['/', '/products', '/categories', '/cart'];
  const urlEntries = [
    ...staticUrls.map((p) => `<url><loc>${clientUrl}${p}</loc></url>`),
    ...pagesSnap.docs.map((d) => `<url><loc>${clientUrl}/pages/${d.id}</loc></url>`),
    ...productsSnap.docs.map((d) => `<url><loc>${clientUrl}/products/${d.data().slug}</loc></url>`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join('\n')}\n</urlset>\n`;
  writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
  writeFileSync(
    path.join(publicDir, 'robots.txt'),
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /account\n\nSitemap: ${clientUrl}/sitemap.xml\n`
  );
  console.log(`Wrote sitemap.xml (${urlEntries.length} URLs) and robots.txt.`);
  process.exit(0);
} catch (err) {
  console.warn('Could not read Firestore for sitemap generation, writing fallback:', err.message);
  writeFallback();
  process.exit(0);
}

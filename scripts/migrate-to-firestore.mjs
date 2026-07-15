// One-time migration: copies Flora's existing MongoDB data into Firestore.
// Run once, from repo root: node scripts/migrate-to-firestore.mjs
//
// Auth sequencing matters here — it deliberately walks through the same
// self-provision -> bootstrap-claim -> admin-promotes-others path that a real
// user would, so it also doubles as an end-to-end check that firestore.rules
// actually allows the flows they're designed for (no rule relaxation needed).
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  inMemoryPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

// Only creates the profile if it doesn't exist yet — never overwrites an
// already-promoted role back down to 'customer' (a plain unconditional
// setDoc here would be a real bug on re-runs, since an admin re-running this
// script is allowed by the rules to update their own doc to anything).
const ensureCustomerProfile = async (db, uid, name, email) => {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { name, email, role: 'customer' });
  }
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });
dotenv.config({ path: path.join(__dirname, '..', 'frontend', '.env') });

// Credentials come from env vars (set them in your shell or a local, gitignored
// .env before running) — never hardcode real passwords in a committed script.
const ADMIN_1 = { email: process.env.MIGRATE_ADMIN1_EMAIL, password: process.env.MIGRATE_ADMIN1_PASSWORD };
const ADMIN_2 = { email: process.env.MIGRATE_ADMIN2_EMAIL, password: process.env.MIGRATE_ADMIN2_PASSWORD };

if (!ADMIN_1.email || !ADMIN_1.password || !ADMIN_2.email || !ADMIN_2.password) {
  console.error(
    'Missing admin credentials. Set MIGRATE_ADMIN1_EMAIL, MIGRATE_ADMIN1_PASSWORD, MIGRATE_ADMIN2_EMAIL, MIGRATE_ADMIN2_PASSWORD as env vars before running this script.'
  );
  process.exit(1);
}

const firebaseApp = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
});
const auth = initializeAuth(firebaseApp, { persistence: inMemoryPersistence });
const db = getFirestore(firebaseApp);

const slugify = (text) =>
  text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

const run = async () => {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);

  const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }), 'categories');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }), 'products');
  const Page = mongoose.model('Page', new mongoose.Schema({}, { strict: false }), 'pages');
  const Website = mongoose.model('Website', new mongoose.Schema({}, { strict: false }), 'websites');

  const [categories, products, pages, website] = await Promise.all([
    Category.find().lean(),
    Product.find().lean(),
    Page.find().lean(),
    Website.findOne().lean(),
  ]);
  console.log(`Found: ${categories.length} categories, ${products.length} products, ${pages.length} pages, website config: ${website ? 'yes' : 'no'}`);

  // --- Step 1: admin@example.com self-provisions a customer profile ---
  console.log(`Signing in as ${ADMIN_1.email}...`);
  const cred1 = await signInWithEmailAndPassword(auth, ADMIN_1.email, ADMIN_1.password);
  const admin1Uid = cred1.user.uid;
  await ensureCustomerProfile(db, admin1Uid, 'Store Admin', ADMIN_1.email);
  await signOut(auth);

  // --- Step 2: flora.bym.pk@gmail.com self-provisions, then claims the bootstrap admin slot ---
  console.log(`Signing in as ${ADMIN_2.email}...`);
  const cred2 = await signInWithEmailAndPassword(auth, ADMIN_2.email, ADMIN_2.password);
  const admin2Uid = cred2.user.uid;
  await ensureCustomerProfile(db, admin2Uid, 'Flora Admin', ADMIN_2.email);

  console.log('Claiming first-admin bootstrap...');
  await runTransaction(db, async (tx) => {
    const bootstrapRef = doc(db, 'meta', 'adminBootstrap');
    const bootstrapSnap = await tx.get(bootstrapRef);
    if (bootstrapSnap.exists() && bootstrapSnap.data().claimed) {
      console.log('Bootstrap already claimed — skipping (expected on a re-run).');
      return;
    }
    tx.update(doc(db, 'users', admin2Uid), { role: 'admin' });
    tx.set(bootstrapRef, { claimed: true });
  });

  // --- Step 3: now admin, promote admin@example.com too and write all store data ---
  const admin1Snap = await getDoc(doc(db, 'users', admin1Uid));
  if (admin1Snap.data()?.role !== 'admin') {
    console.log(`Promoting ${ADMIN_1.email} to admin...`);
    await updateDoc(doc(db, 'users', admin1Uid), { role: 'admin' });
  } else {
    console.log(`${ADMIN_1.email} is already admin — skipping.`);
  }

  console.log('Writing categories...');
  const categoryIdMap = new Map(); // Mongo _id -> Firestore doc id
  for (const c of categories) {
    const ref = doc(db, 'categories', c._id.toString());
    // eslint-disable-next-line no-await-in-loop
    await setDoc(ref, {
      name: c.name,
      slug: c.slug || slugify(c.name),
      image: c.image || '',
      description: c.description || '',
      featured: !!c.featured,
      createdAt: c.createdAt ? Timestamp.fromDate(new Date(c.createdAt)) : serverTimestamp(),
    });
    categoryIdMap.set(c._id.toString(), c._id.toString());
  }

  console.log('Writing products...');
  for (const p of products) {
    const ref = doc(db, 'products', p._id.toString());
    // eslint-disable-next-line no-await-in-loop
    await setDoc(ref, {
      name: p.name,
      slug: p.slug,
      images: p.images || [],
      price: p.price,
      discountPrice: p.discountPrice ?? null,
      description: p.description || '',
      shortDescription: p.shortDescription || '',
      sku: p.sku || '',
      stock: p.stock ?? 0,
      categoryId: p.category ? categoryIdMap.get(p.category.toString()) || null : null,
      tags: p.tags || [],
      featured: !!p.featured,
      published: p.published !== false,
      archived: !!p.archived,
      createdAt: p.createdAt ? Timestamp.fromDate(new Date(p.createdAt)) : serverTimestamp(),
      updatedAt: p.updatedAt ? Timestamp.fromDate(new Date(p.updatedAt)) : serverTimestamp(),
    });
  }

  console.log('Writing pages...');
  for (const p of pages) {
    const ref = doc(db, 'pages', p.slug);
    // eslint-disable-next-line no-await-in-loop
    await setDoc(ref, {
      key: p.key,
      title: p.title,
      content: p.content || '',
      metaTitle: p.metaTitle || '',
      metaDescription: p.metaDescription || '',
      isSystem: !!p.isSystem,
    });
  }

  if (website) {
    console.log('Writing website config...');
    const { _id, __v, createdAt, updatedAt, ...rest } = website;
    // JSON round-trip strips any remaining Mongo ObjectId/Date instances
    // (e.g. testimonial subdocument _ids) that Firestore's SDK can't accept directly.
    await setDoc(doc(db, 'settings', 'website'), JSON.parse(JSON.stringify(rest)));
  }

  console.log('\nMigration complete.');
  console.log(`  categories: ${categories.length}`);
  console.log(`  products: ${products.length}`);
  console.log(`  pages: ${pages.length}`);
  console.log(`  website config: ${website ? 'migrated' : 'skipped (none found)'}`);
  console.log(`  admins: ${ADMIN_1.email}, ${ADMIN_2.email}`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

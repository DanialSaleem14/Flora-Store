import dotenv from 'dotenv';

dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import { ensureSystemPages } from '../controllers/pageController.js';

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'Store Admin';

// Creates the Firebase Auth account via the public Auth REST API (uses the
// same web API key the frontend uses — no service account needed). If the
// account already exists, signs in instead to recover its uid.
const getOrCreateFirebaseUser = async (email, password) => {
  const apiKey = process.env.FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error('FIREBASE_API_KEY is not set in backend/.env');
  }

  const signUp = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  ).then((r) => r.json());

  if (signUp.localId) return signUp.localId;

  if (signUp.error?.message === 'EMAIL_EXISTS') {
    const signIn = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    ).then((r) => r.json());
    if (signIn.localId) return signIn.localId;
    throw new Error(`Could not sign in existing Firebase user: ${signIn.error?.message}`);
  }

  throw new Error(`Firebase signUp failed: ${signUp.error?.message}`);
};

const run = async () => {
  await connectDB();

  const firebaseUid = await getOrCreateFirebaseUser(ADMIN_EMAIL, ADMIN_PASSWORD);

  let user = await User.findOne({ firebaseUid });
  if (!user) {
    user = await User.create({ firebaseUid, name: ADMIN_NAME, email: ADMIN_EMAIL, role: 'admin' });
    console.log(`Created admin profile for ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else if (user.role !== 'admin') {
    user.role = 'admin';
    await user.save();
    console.log(`Promoted existing profile for ${ADMIN_EMAIL} to admin`);
  } else {
    console.log('Admin user already exists, skipping.');
  }

  await ensureSystemPages();
  console.log('System pages ensured.');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

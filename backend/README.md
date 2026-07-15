# Backend — Store Builder API

Express + MongoDB API for the Store Builder platform. Authentication is handled by Firebase Auth — this API only verifies Firebase ID tokens, it never issues its own.

## Setup

```bash
cp .env.example .env   # fill in MONGO_URI, FIREBASE_PROJECT_ID, FIREBASE_API_KEY
npm install
npm run dev
```

Runs on `http://localhost:5000` by default. The server starts listening immediately and connects to MongoDB in the background — if `MONGO_URI` is unreachable it logs a clear error instead of crashing, so you can still verify the process boots before wiring up a real database.

## Scripts

- `npm run dev` — start with nodemon (auto-restart)
- `npm start` — start once (production)
- `npm run seed` — create a bootstrap admin (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` env vars, defaults to `admin@example.com` / `admin123`) both in Firebase Auth (via the Auth REST API) and as a Mongo profile with `role: 'admin'`, plus ensure the system pages exist (Home/About/Contact/etc.)

## Environment Variables

See `.env.example`. Required for full functionality:
- `MONGO_URI` — MongoDB connection string
- `FIREBASE_PROJECT_ID` — used to verify that incoming ID tokens were issued for your Firebase project (checked against Google's public signing keys — no service account/private key needed)
- `FIREBASE_API_KEY` — the public web API key; only used by `npm run seed` to create the bootstrap admin account via the Auth REST API

## Notable design choices

- **Website singleton**: `models/Website.js` holds branding, hero, appearance, homepage section order, and store settings as one document (`Website.getSingleton()`), not per-user — the spec's own "Future Features" list names multi-store support as future work, so this milestone is single-store by design.
- **Firebase-verified auth, no service account**: `utils/firebaseAuth.js` verifies ID tokens against Google's JWKS endpoint for Firebase Auth (`securetoken@system.gserviceaccount.com`) rather than using the Admin SDK — this avoids needing a service account private key on the server, at the cost of not being able to do privileged operations like setting custom claims or managing users from the backend.
- **`User` model is a profile, not a credential store**: no password field at all — `firebaseUid` is the link back to Firebase Auth, and `role` / `wishlist` / `addresses` are the only app-specific data kept here. A profile is auto-created (as `role: 'customer'`) the first time a Firebase account is seen by `protect` middleware.
- **Admin bootstrap, not open registration**: `POST /api/auth/claim-first-admin` only succeeds while zero admins exist — this replaces what used to be an open `/register` endpoint that (correctly) got flagged as a security hole during review, since anyone could otherwise self-grant admin access at any time.
- **No upload endpoint**: images go straight from the browser to Firebase Storage; this API never touches image bytes. See `firebase-storage.rules` at the repo root for the write-access rules.

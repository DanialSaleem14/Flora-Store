# Deploying Flora

100% Firebase — no separate server to deploy or pay for. Firebase Hosting serves the static frontend; Firestore, Auth, and Storage handle everything else directly from the browser.

## First-time setup (already done for flora-store-c4f9e)

1. Firebase Console → **Authentication** → Get started → enable **Email/Password**.
2. Firebase Console → **Firestore Database** → Create database (pick a region — permanent choice).
3. Firebase Console → **Storage** → Get started, then paste `firebase-storage.rules` into Storage → Rules → Publish.
4. `firebase deploy --only firestore` — publishes `firestore.rules` + `firestore.indexes.json`.

## Every deploy after that

```bash
cd frontend
npm install
npm run build          # runs scripts/generate-seo-files.mjs (prebuild), then tsc + vite build
cd ..
firebase deploy --only hosting
```

Or deploy hosting + Firestore rules + Storage rules together:

```bash
firebase deploy --only hosting,firestore,storage
```

Live URL: **https://flora-store-c4f9e.web.app**

## Environment variables

`frontend/.env` needs the Firebase web app config (Project Settings → Your apps) plus `VITE_CLIENT_URL` (used by the sitemap generator). See `frontend/.env.example`.

## Local development

```bash
cd frontend
npm install
npm run dev             # http://localhost:5173, talks directly to the same live Firebase project
```

There's no local backend to run — `npm run dev` in `frontend/` is the entire local dev setup.

## One-time data migration script

`scripts/migrate-to-firestore.mjs` was used once to move Flora's original data from a local MongoDB into Firestore. It's safe to leave in the repo for reference but won't need to run again — Firestore is now the source of truth.

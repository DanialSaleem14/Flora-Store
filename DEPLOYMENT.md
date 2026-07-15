# Deploying Flora to production

The frontend is already live on Firebase Hosting: **https://flora-store-c4f9e.web.app**

It won't be fully functional yet — nothing that talks to the API (products, login, categories, etc.) will work — until the backend is deployed somewhere publicly reachable and MongoDB is a real hosted database instead of the local Docker container. Here's the fastest free path.

## 1. MongoDB Atlas (free database)

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) (no credit card needed for the free M0 tier).
2. Create a free M0 cluster (any region close to you).
3. **Database Access** → add a database user with a password.
4. **Network Access** → add `0.0.0.0/0` (allow from anywhere) — Render's servers have dynamic IPs, so this is the simplest option for a small store.
5. **Connect** → "Drivers" → copy the connection string, looks like:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/store_builder?retryWrites=true&w=majority`

## 2. Render (free backend hosting)

`backend/render.yaml` is already set up as a Render "Blueprint" — the fastest path:

1. Push this repo to GitHub (if it isn't already).
2. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint** → connect the repo.
3. Render will read `backend/render.yaml` and prompt you for the two secret values it doesn't auto-fill:
   - `MONGO_URI` — paste the Atlas connection string from step 1.
   - `FIREBASE_API_KEY` — from `backend/.env` (the same value used for the seed script).
4. Deploy. Render gives you a URL like `https://flora-store-api.onrender.com`.

Note: Render's free tier spins the service down after ~15 minutes of inactivity — the first request after a quiet period takes 30–60s to wake it up. Fine for a small store getting started; upgrade to a paid plan later if that's a problem.

## 3. Point the frontend at the real backend

Once Render gives you the live API URL:

```bash
# frontend/.env
VITE_API_URL=https://flora-store-api.onrender.com/api
```

Then rebuild and redeploy to Firebase Hosting:

```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting --project flora-store-c4f9e
```

## 4. Update CORS

`backend/.env` on Render needs `CLIENT_URL=https://flora-store-c4f9e.web.app` (already set in `render.yaml`) so the deployed backend accepts requests from the deployed frontend.

---

Everything above is optional for local development — `npm run dev` in both `backend/` and `frontend/` against the local Mongo container works without any of this.

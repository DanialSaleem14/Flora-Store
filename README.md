# Store Builder — Shopify-Inspired Website Builder

A full-stack SaaS-style e-commerce platform: store owners manage everything — products, categories, pages, branding, and homepage layout — from a web admin dashboard, and changes appear instantly on the public storefront. No mobile app; everything is web-based.

This is a **Core MVP** build. See [Scope](#scope) below for what's included versus what's intentionally deferred.

## Tech Stack

**Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, React Router, React Hook Form, Axios, TanStack Query, Framer Motion, Tiptap (rich text), dnd-kit (drag & drop), Recharts, react-helmet-async, react-hot-toast, Firebase (Auth + Storage)

**Backend:** Node.js, Express, MongoDB (Mongoose) for product/store data, Firebase Auth (ID token verification only — no service account required)

## Project Structure

```
Store/
├── firebase-storage.rules   # paste into Firebase Console -> Storage -> Rules
├── backend/
│   ├── config/         # db.js
│   ├── models/         # User (profile only), Product, Category, Page, Website, NewsletterSubscriber
│   ├── controllers/
│   ├── routes/
│   ├── middleware/     # auth (Firebase token verification), error handling, rate limiting, validation
│   ├── utils/          # asyncHandler, firebaseAuth, seed
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/ # ProductCard, ImageUploader, SortableList, RichTextEditor, sections/...
    │   ├── pages/       # admin/, storefront/, account/
    │   ├── layouts/     # AdminLayout, StorefrontLayout, AccountLayout
    │   ├── config/       # firebase.ts (client SDK init)
    │   ├── context/      # AuthContext, CartContext, StoreContext
    │   ├── services/     # one module per API resource, plus storageService (Firebase Storage uploads)
    │   ├── hooks/
    │   └── types/
    └── index.html
```

## Authentication & image storage: Firebase

Authentication (signup, login, session, password reset) and image storage (product photos, logos, banners) are both handled by **Firebase** — not by this app's own backend:

- **Auth**: the frontend talks to Firebase Auth directly (`firebase/auth`) for signup/login/logout/password-reset emails. The backend never sees a password — it only verifies the Firebase-issued ID token on each request, against Google's public signing keys. No service account key is needed for this.
- **App-specific data** (role: admin/customer, wishlist, saved addresses) still lives in MongoDB, in a lightweight `User` profile document keyed by the Firebase UID — auto-created the first time a new Firebase account is seen, always starting as `role: 'customer'`.
- **Admin bootstrap**: the very first person to call `POST /api/auth/claim-first-admin` after registering becomes the store admin. Once any admin exists, that endpoint is closed — further admins must be granted access by an existing admin (currently a direct database action; no self-serve invite flow yet).
- **Image storage**: the frontend uploads images directly to Firebase Storage (`firebase/storage`), bypassing the backend entirely. Storage security rules (see `firebase-storage.rules` at the repo root) restrict writes to an allowlist of admin emails and require an image content-type + 5MB size limit; reads are public.

## Installation

### Prerequisites
- Node.js 18+
- A MongoDB instance (local or Atlas)
- A Firebase project with **Authentication** enabled (Build → Authentication → Get started → enable the **Email/Password** sign-in provider) and **Storage** enabled

### 1. Firebase Console setup (one-time)
1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication** → Get started → Sign-in method → enable **Email/Password**.
3. **Storage** → Get started → paste the contents of `firebase-storage.rules` into the Rules tab (update the admin email allowlist inside it first) → Publish.
4. **Project settings** → Your apps → add a Web app → copy the config object.

### 2. Backend

```bash
cd backend
cp .env.example .env   # fill in MONGO_URI, FIREBASE_PROJECT_ID, FIREBASE_API_KEY (only used by npm run seed)
npm install
npm run dev             # starts on http://localhost:5000
```

Optional: seed a bootstrap admin user and the system pages —

```bash
npm run seed             # creates admin@example.com / admin123 in Firebase + Mongo (override via SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD)
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env    # set VITE_API_URL and the VITE_FIREBASE_* values from your Firebase web app config
npm install
npm run dev              # starts on http://localhost:5173
```

Visit `http://localhost:5173/admin/register` to create your store owner account (the first registrant can claim admin), or log in with the seeded admin above. The public storefront is at `http://localhost:5173/`.

## Scope

### Included in this MVP
- Full auth (register/login/logout/password-reset email) for both admin (store owner) and customer roles, via Firebase Auth, with Firebase-verified requests on every protected API route
- Admin dashboard shell with sidebar nav, stat cards, and dummy-data charts
- Product CRUD with multi-image drag & drop upload direct to Firebase Storage, duplicate, archive, search/filter/sort, pagination
- Category CRUD with image upload
- Website Builder: branding, hero, about, footer, contact, social links, testimonials, drag-and-drop homepage section ordering/toggling
- Appearance editor: colors, font (with real Google Fonts loading), button style, border radius, light/dark default, favicon, banners — applied live via CSS variables
- Pages manager with a rich text editor (Tiptap, sanitized on render) for Home/About/Contact/Privacy/Terms/FAQ/Return Policy
- Storefront with all homepage sections reading live from the database, responsive product grid, quick view, wishlist, cart (localStorage), checkout placeholder, store-currency-aware price formatting
- Customer account area: profile, addresses, wishlist, order history placeholder
- SEO: meta/OG/Twitter tags, `/robots.txt`, dynamic `/sitemap.xml`
- Security: helmet, rate limiting, Firebase-verified auth, input validation, mongo-sanitize, CORS, HTML sanitization on rendered rich text, admin-registration bootstrap gate, Storage rules restricting writes to admins
- Performance: route-level code splitting, lazy-loaded images, pagination, debounced search, client-side query caching

### Deferred (intentionally, see "Future Features" in the original spec)
- Full nested drag-and-drop navigation builder (storefront nav is currently a fixed link set)
- Real order creation, payment gateways (Stripe/PayPal/JazzCash/EasyPaisa), coupons, gift cards
- Self-serve admin invite flow (adding a second admin is currently a direct database action)
- Multi-store / multi-tenant support (the Website/Settings model is a single-store singleton by design)
- AI features, multi-language, theme/plugin marketplace

## API Documentation

Base URL: `/api`

| Resource | Routes |
|---|---|
| Auth / profile | `GET/PUT /auth/me`, `POST /auth/claim-first-admin`, `GET/POST/PUT/DELETE /auth/addresses[/:id]`, `GET /auth/wishlist`, `POST /auth/wishlist/:productId` |
| Products | `GET /products` (search/category/minPrice/maxPrice/featured/sort/page/limit), `GET /products/slug/:slug`, `GET /products/:id` (admin), `POST /products`, `PUT /products/:id`, `DELETE /products/:id`, `POST /products/:id/duplicate`, `PATCH /products/:id/archive` |
| Categories | `GET /categories`, `GET /categories/:slug`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id` |
| Pages | `GET /pages` (admin), `GET /pages/slug/:slug`, `POST /pages`, `PUT /pages/:id`, `DELETE /pages/:id` |
| Website | `GET /website`, `PUT /website` (admin) |
| Newsletter | `POST /newsletter/subscribe` |
| Dashboard | `GET /dashboard/stats` (admin) |
| SEO | `GET /robots.txt`, `GET /sitemap.xml` |

All routes under `/auth`, and all write routes elsewhere, require `Authorization: Bearer <Firebase ID token>`; admin-only routes additionally require the caller's synced Mongo profile to have `role: 'admin'`. Image uploads don't go through this API at all — see [Authentication & image storage](#authentication--image-storage-firebase) above.

## Notes

- The `Website` document is a singleton — there is one store configuration per deployment (see "Future Features: Multi-store Support" in the original spec, which signals multi-tenancy is intentionally out of scope for this milestone).
- Checkout does not process payments yet; it's structured so a payment provider can be dropped in later without reshaping the form.
- Storage write rules use an email allowlist rather than a role check, because reading our Mongo-based role from a Storage rule would require Firebase custom claims (which need a service account — deliberately avoided). Add new admin emails to `firebase-storage.rules` when you grant someone admin access.

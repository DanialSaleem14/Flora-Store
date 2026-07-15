# Flora — Shopify-Inspired Website Builder

A full-stack e-commerce platform: the store owner manages everything — products, categories, pages, branding, and homepage layout — from a web admin dashboard, and changes appear instantly on the public storefront. No mobile app; everything is web-based.

**100% Firebase stack** — Firebase Hosting (static frontend), Cloud Firestore (data), Firebase Auth (login/signup/password reset), Firebase Storage (images). There is no separate backend server to run or deploy.

## Tech Stack

React 19, Vite, TypeScript, Tailwind CSS v4, React Router, React Hook Form, TanStack Query, Framer Motion, Tiptap (rich text), dnd-kit (drag & drop), Recharts, react-helmet-async, react-hot-toast, and the Firebase JS SDK (`firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/storage`).

## Project Structure

```
Store/
├── firebase.json              # Hosting + Firestore + Storage config
├── firestore.rules            # Security rules (auth/role-based access)
├── firestore.indexes.json     # Composite indexes for product queries
├── firebase-storage.rules     # Storage security rules (admin-email allowlist)
├── scripts/
│   └── migrate-to-firestore.mjs   # one-time Mongo → Firestore migration (historical)
└── frontend/
    ├── scripts/
    │   └── generate-seo-files.mjs  # prebuild: writes public/sitemap.xml + robots.txt
    └── src/
        ├── components/         # ProductCard, ImageUploader, SortableList, RichTextEditor, sections/...
        ├── pages/               # admin/, storefront/, account/
        ├── layouts/             # AdminLayout, StorefrontLayout, AccountLayout
        ├── config/firebase.ts   # Firebase app init (auth, db, storage exports)
        ├── context/             # AuthContext, CartContext, StoreContext
        ├── services/            # one module per resource, all talking to Firestore/Storage/Auth directly
        ├── hooks/
        └── types/
```

## How data flows (no backend)

- **Auth**: the frontend calls Firebase Auth directly (`firebase/auth`) for signup/login/logout/password-reset emails. `AuthContext` mirrors the Firebase session and keeps it in sync with an app-specific profile document.
- **App data** (role, wishlist, saved addresses) lives in a `users/{uid}` Firestore document, auto-created (always as `role: customer`) the first time a Firebase account is seen.
- **Admin bootstrap**: the first person to call `claimFirstAdmin()` (wired to the "Create your store" admin registration flow) becomes the store admin, via a Firestore transaction gated by `meta/adminBootstrap`. Once any admin exists, that path closes — further admins are granted access by an existing admin directly (no self-serve invite flow yet).
- **Products / Categories / Pages / Website config**: plain Firestore collections, read/written directly from the client, protected by `firestore.rules` (`isAdmin()` checks the caller's own `users/{uid}` doc — see the rules file for the exact logic, including why it doesn't use custom claims).
- **Images**: uploaded straight from the browser to Firebase Storage (`services/storageService.ts`); `firebase-storage.rules` restricts writes to an admin email allowlist and requires an image content-type + 5MB cap.
- **Search**: Firestore has no full-text search, so product search fetches a filtered/sorted batch and matches client-side — fine at boutique-catalog scale.
- **Pagination**: cursor-based "Load More" (Firestore doesn't support cheap numbered-page/offset pagination).
- **Sitemap/robots.txt**: static files regenerated at build time by `frontend/scripts/generate-seo-files.mjs` (a `prebuild` npm script) — no server needed to serve them dynamically.

## Installation

### Prerequisites
- Node.js 18+
- A Firebase project with Authentication (Email/Password), Firestore, and Storage all enabled (Console → Build → each service → "Get started" is a one-time, per-project manual step Firebase requires)

### Setup

```bash
cd frontend
cp .env.example .env    # fill in the Firebase web app config + VITE_CLIENT_URL
npm install
npm run dev              # http://localhost:5173
```

First time only, deploy the security rules from the repo root:

```bash
firebase deploy --only firestore,storage
```

Then either register the first admin at `/admin/register` (the first registrant can claim admin), or see `DEPLOYMENT.md` for the full one-time console setup.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deploying to production.

## Scope

### Included
- Full auth (register/login/logout/password-reset email) for both admin (store owner) and customer roles, via Firebase Auth
- Admin dashboard shell with sidebar nav, live product/category counts, dummy-data charts
- Product CRUD with multi-image drag & drop upload direct to Firebase Storage, duplicate, archive, search/filter/sort, Load More pagination
- Category CRUD with image upload (deleting a category clears the reference on any products that used it)
- Website Builder: branding, hero, about, footer, contact, social links, testimonials, drag-and-drop homepage section ordering/toggling
- Appearance editor: colors, font (real Google Fonts loading), button style, border radius, light/dark default, favicon, banners — applied live via CSS variables
- Pages manager with a rich text editor (Tiptap, sanitized on render) for Home/About/Contact/Privacy/Terms/FAQ/Return Policy
- Storefront with all homepage sections reading live from Firestore, responsive product grid, quick view, wishlist, cart (localStorage), checkout placeholder, store-currency-aware price formatting
- Customer account area: profile, addresses, wishlist, order history placeholder
- SEO: meta/OG/Twitter tags, statically-generated `/robots.txt` and `/sitemap.xml`
- Security: Firestore security rules (role-based via a self-contained `isAdmin()` check, no custom claims/service account needed), Storage rules (admin email allowlist, content-type/size limits), HTML sanitization on rendered rich text, admin-bootstrap gate against open self-registration
- Performance: route-level code splitting, lazy-loaded images, cursor pagination, debounced search, client-side query caching (TanStack Query)

### Deferred (see "Future Features" in the original spec)
- Full nested drag-and-drop navigation builder (storefront nav is a fixed link set)
- Real order creation, payment gateways (Stripe/PayPal/JazzCash/EasyPaisa), coupons, gift cards
- Self-serve admin invite flow (adding a second admin is currently a direct Firestore action)
- Multi-store / multi-tenant support (the website config is a single-store singleton by design)
- AI features, multi-language, theme/plugin marketplace

## Notes

- `firestore.rules` is the actual authorization layer now — read it alongside any service file in `frontend/src/services/` to understand what a given collection allows.
- Checkout does not process payments yet; it's structured so a payment provider can be dropped in later.
- The website/settings config is a Firestore singleton at `settings/website` — see "Multi-store Support" in the original spec's Future Features, which signals multi-tenancy is intentionally out of scope for this milestone.

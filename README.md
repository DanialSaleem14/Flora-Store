# Flora — Shopify-Inspired Website Builder

A full-stack e-commerce platform: the store owner manages everything — products, categories, pages, branding, and homepage layout — from a web admin dashboard, and changes appear instantly on the public storefront. No mobile app; everything is web-based.

**100% Firebase stack** — Firebase Hosting (static frontend), Cloud Firestore (data, including images — see below), Firebase Auth (login/signup/password reset). There is no separate backend server to run or deploy, and no Firebase Storage/Blaze billing plan required.

## Tech Stack

React 19, Vite, TypeScript, Tailwind CSS v4, React Router, React Hook Form, TanStack Query, Framer Motion, Tiptap (rich text), dnd-kit (drag & drop), Recharts, react-helmet-async, react-hot-toast, and the Firebase JS SDK (`firebase/app`, `firebase/auth`, `firebase/firestore`).

## Project Structure

```
Store/
├── firebase.json              # Hosting + Firestore config
├── firestore.rules            # Security rules (auth/role-based access)
├── firestore.indexes.json     # Composite indexes for product/order queries
├── scripts/
│   └── migrate-to-firestore.mjs   # one-time Mongo → Firestore migration (historical)
└── frontend/
    ├── scripts/
    │   └── generate-seo-files.mjs  # prebuild: writes public/sitemap.xml + robots.txt
    └── src/
        ├── components/         # ProductCard, ImageUploader, SortableList, RichTextEditor, sections/...
        ├── pages/               # admin/, storefront/, account/
        ├── layouts/             # AdminLayout, StorefrontLayout, AccountLayout
        ├── config/firebase.ts   # Firebase app init (auth, db exports)
        ├── context/             # AuthContext, CartContext, StoreContext
        ├── services/            # one module per resource, all talking to Firestore/Auth directly
        ├── utils/imageEncode.ts # client-side image compression for base64-in-Firestore storage
        ├── hooks/
        └── types/
```

## How data flows (no backend)

- **Auth**: the frontend calls Firebase Auth directly (`firebase/auth`) for signup/login/logout/password-reset emails. `AuthContext` mirrors the Firebase session and keeps it in sync with an app-specific profile document.
- **App data** (role, wishlist, saved addresses) lives in a `users/{uid}` Firestore document, auto-created (always as `role: customer`) the first time a Firebase account is seen.
- **Admin bootstrap**: the first person to call `claimFirstAdmin()` (wired to the "Create your store" admin registration flow) becomes the store admin, via a Firestore transaction gated by `meta/adminBootstrap`. Once any admin exists, that path closes — further admins are granted access by an existing admin directly (no self-serve invite flow yet).
- **Products / Categories / Pages / Website config / Orders**: plain Firestore collections, read/written directly from the client, protected by `firestore.rules` (`isAdmin()` checks the caller's own `users/{uid}` doc — see the rules file for the exact logic, including why it doesn't use custom claims).
- **Images**: compressed and resized client-side (`src/utils/imageEncode.ts`, canvas-based) into small JPEG data URLs, then stored directly as string fields on the relevant Firestore document (a product's `images[]`, a category's `image`, the website config's `logo`/`hero.image`/etc). This avoids needing Firebase Storage, which now requires the paid Blaze plan even for free-tier usage. The tradeoff: Firestore documents cap at 1MB, so images are kept small (≈90KB each, with a cumulative per-document guard in `ImageUploader.tsx`) — fine for web display, not archival-quality originals.
- **Orders**: placing an order (Cash on Delivery today; card payment is a placeholder pending a gateway) re-fetches live product prices/stock at write time rather than trusting the client's cart, so a stale or tampered cart can't produce a bogus order total. Stock is *not* auto-decremented (that would require customer write-access to `products`, judged too large a security-rules surface for this milestone) — admins adjust stock manually based on orders they see come in.
- **Search**: Firestore has no full-text search, so product search fetches a filtered/sorted batch and matches client-side — fine at boutique-catalog scale.
- **Pagination**: cursor-based "Load More" (Firestore doesn't support cheap numbered-page/offset pagination).
- **Sitemap/robots.txt**: static files regenerated at build time by `frontend/scripts/generate-seo-files.mjs` (a `prebuild` npm script) — no server needed to serve them dynamically.

## Installation

### Prerequisites
- Node.js 18+
- A Firebase project with Authentication (Email/Password) and Firestore enabled (Console → Build → each service → "Get started" is a one-time, per-project manual step Firebase requires)

### Setup

```bash
cd frontend
cp .env.example .env    # fill in the Firebase web app config + VITE_CLIENT_URL
npm install
npm run dev              # http://localhost:5173
```

First time only, deploy the security rules from the repo root:

```bash
firebase deploy --only firestore
```

Then either register the first admin at `/admin/register` (the first registrant can claim admin), or see `DEPLOYMENT.md` for the full one-time console setup.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deploying to production.

## Scope

### Included
- Full auth (register/login/logout/password-reset email) for both admin (store owner) and customer roles, via Firebase Auth
- Admin dashboard with real, live numbers: product/category counts, total stock, revenue (from delivered orders), current/out-for-delivery order counts, delivered-this-week/month/year, recent orders — no placeholder data
- Product CRUD with multi-image drag & drop upload (compressed to base64, stored in Firestore), duplicate, archive, search/filter/sort, Load More pagination
- Category CRUD with image upload (deleting a category clears the reference on any products that used it)
- Real order flow: Cash-on-Delivery checkout creates an order with live-refetched prices; admin manages status (pending → processing → out for delivery → delivered/cancelled) from an Orders page; customers see their own order history
- Website Builder: branding, hero, about, footer, contact, social links, testimonials, drag-and-drop homepage section ordering/toggling
- Appearance editor: colors, font (real Google Fonts loading), button style, border radius, light/dark default, favicon, banners — applied live via CSS variables
- Pages manager with a rich text editor (Tiptap, sanitized on render) for Home/About/Contact/Privacy/Terms/FAQ/Return Policy
- Storefront with all homepage sections reading live from Firestore, responsive 2-column mobile / 4-column desktop product grid, quick view, wishlist, cart (localStorage), store-currency-aware price formatting
- Customer account area: profile, addresses, wishlist, real order history
- Newsletter signups, visible to admin (Customers page)
- SEO: meta/OG/Twitter tags, statically-generated `/robots.txt` and `/sitemap.xml`
- Security: Firestore security rules (role-based via a self-contained `isAdmin()` check, no custom claims/service account needed), HTML sanitization on rendered rich text, admin-bootstrap gate against open self-registration, checkout re-validates prices/stock server-side-equivalent (live Firestore read, not trusted client input)
- Fully usable admin dashboard on mobile (slide-in nav)
- Performance: route-level code splitting, lazy-loaded images, cursor pagination, debounced search, client-side query caching (TanStack Query)

### Deferred (see "Future Features" in the original spec)
- Full nested drag-and-drop navigation builder (storefront nav is a fixed link set)
- Card payment gateways (Stripe/PayPal/JazzCash/EasyPaisa) — Cash on Delivery works today
- Automatic stock decrement on order placement (manual for now, see "How data flows" above)
- Self-serve admin invite flow (adding a second admin is currently a direct Firestore action)
- Multi-store / multi-tenant support (the website config is a single-store singleton by design)
- Full customer directory / CRM (newsletter subscriber list exists; per-customer order history view does not yet)
- AI features, multi-language, theme/plugin marketplace

## Notes

- `firestore.rules` is the actual authorization layer now — read it alongside any service file in `frontend/src/services/` to understand what a given collection allows.
- The website/settings config is a Firestore singleton at `settings/website` — see "Multi-store Support" in the original spec's Future Features, which signals multi-tenancy is intentionally out of scope for this milestone.
- Order price integrity has a known limit: since there's no server, a sufficiently determined client could still submit a crafted order (e.g. abnormal quantities) — the live-price-refetch closes the common cases (stale cart, naive tampering) but isn't a full server-side guarantee. Admins reviewing orders before dispatch (natural with COD) is the practical backstop; a Cloud Function trigger would close this fully if ever needed, at the cost of reintroducing the Blaze plan requirement this project deliberately avoided.

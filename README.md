# Brew & Bloom — Luxury Specialty Café

> Crafted with Passion. Served with Love.

A premium, production-ready café website built with Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Framer Motion, Prisma and a hash-routed single-page architecture. It features a full menu, shopping cart, validated checkout, table reservations, a secure admin dashboard, and genuine photography throughout.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| Motion | Framer Motion 12 |
| State | Zustand (cart) + TanStack Query (server state) |
| Database | Prisma ORM + SQLite (portable SQL schema provided) |
| Auth | HMAC-signed httpOnly session cookies (scrypt password hashing) |
| Icons | Lucide React |
| Fonts | Playfair Display, Cormorant Garamond, Inter |

> **Note on Supabase:** the original brief specified Supabase. This sandbox provides Prisma + SQLite, so the equivalent relational backend is implemented here with full normalization, indexes, foreign keys and **server-side authorization that mirrors Supabase Row Level Security** (public read of products/categories, owner-scoped orders, admin-only mutations). A portable `prisma/schema.sql` with PostgreSQL DDL and RLS policies is included for a direct Supabase port.

---

## Brand system

- **Palette:** Espresso `#302019`, Dark Chocolate `#452B20`, Mocha `#79543D`, Champagne `#D6BE9B`, Ivory `#F8F4EC`, Olive `#74765C`
- **Type:** Playfair Display (headings), Cormorant Garamond (editorial accents), Inter (body/UI)
- **Direction:** editorial layouts, cinematic photography, generous whitespace, fine borders, subtle shadows, tasteful scroll-triggered animation. Reduced-motion preferences are respected.

---

## Pages (hash-routed SPA on `/`)

| Route | View |
| --- | --- |
| `#/` | Home — hero, brand intro, featured, signature collection, story, promotions, gallery, testimonials, reservation CTA |
| `#/story` | Our Story |
| `#/menu` | Menu — category filter, search, price/featured sort (deep-linkable via `?category=`) |
| `#/product/:slug` | Product detail + related items |
| `#/gallery` | Gallery with lightbox |
| `#/reservations` | Table booking with slot validation |
| `#/contact` | Contact form |
| `#/cart` | Full cart with coupon |
| `#/checkout` | Validated checkout |
| `#/confirmation/:id` | Order confirmation (owner-scoped) |
| `#/admin` | Admin login + dashboard |

Backend API routes live under `/api/*` (products, categories, orders, reservations, contact, newsletter, discounts, admin auth + CRUD).

---

## Getting started

```bash
# 1. Install dependencies
bun install

# 2. Configure environment
cp .env.example .env   # then edit values

# 3. Create the database schema
bun run db:push

# 4. Seed categories, 30 products, admin user, discounts and sample data
bun run prisma/seed.ts

# 5. Start the dev server (http://localhost:3000)
bun run dev
```

### Admin access

After seeding, sign in at `#/admin`:

- **Email:** `admin@brewbloom.cafe`
- **Password:** `BrewBloom@2025`

(Override via `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` in `.env` before seeding.)

---

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Prisma SQLite path |
| `ADMIN_SESSION_SECRET` | HMAC signing secret for admin sessions |
| `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` | First admin created by the seed |
| `NEXT_PUBLIC_CAFE_*` | Café name, phone, email, address, hours |
| `PAYMENT_MODE` | `test` — no live payment is processed |

---

## Database

Prisma schema: `prisma/schema.prisma`. Portable SQL (PostgreSQL/Supabase) with RLS policies: `prisma/schema.sql`.

Models: `Category`, `Product`, `AdminUser`, `Customer`, `Order`, `OrderItem`, `Reservation`, `ContactMessage`, `NewsletterSubscriber`, `DiscountCode`, `SiteSettings` — with foreign keys, cascade rules and indexes.

### Authorization (RLS equivalent)

- **Public read:** available products and categories.
- **Owner-scoped:** orders are readable only with the matching customer email (enforced in `/api/orders/[id]`).
- **Public create:** orders, reservations (with slot conflict prevention), contact messages, newsletter sign-ups.
- **Admin-only:** all product/order/reservation/customer mutations, verified via the signed session cookie in `/api/admin/*`.

---

## Cart & checkout

- Cart persisted to `localStorage` via Zustand.
- Server-side price recompute on order creation (client prices never trusted).
- Coupon re-validated server-side.
- Delivery charge applied below the free-delivery threshold.
- **Payments run in test mode** — no live gateway is invoked and no order is marked paid until a real gateway verifies it.

---

## Scripts

```bash
bun run dev        # dev server (port 3000)
bun run lint       # ESLint
bun run db:push    # apply schema to SQLite
bun run db:generate# regenerate Prisma client
bun run prisma/seed.ts        # seed the database
bun run scripts/build-image-manifest.ts  # rebuild the image manifest
```

---

## Project structure

```
src/
  app/
    layout.tsx            fonts + providers
    page.tsx              renders <SiteApp/>
    globals.css           design tokens
    api/                  products, orders, reservations, contact,
                          newsletter, discounts, admin/* (auth + CRUD)
  lib/                    db, auth, router, cart-store, queries, types, format, constants
  components/
    site/                 navbar, footer, cart-drawer, product-card, hero,
                          section-heading, smart-image, reveal, luxe-button, page-hero
    views/                home, story, menu, product, gallery, reservations,
                          contact, cart, checkout, confirmation
    admin/                admin-view, admin-login, dashboard, panels/*
prisma/                   schema.prisma, schema.sql, seed.ts
scripts/                  collect-images.sh, build-image-manifest.ts
```

---

## Notes

- Imagery is fetched via the in-house image search service and re-hosted on a reachable CDN. Run `scripts/collect-images.sh` then `bun run scripts/build-image-manifest.ts` to refresh.
- The site is fully responsive (mobile-first) with a sticky footer, accessible focus states, and keyboard-navigable navigation.

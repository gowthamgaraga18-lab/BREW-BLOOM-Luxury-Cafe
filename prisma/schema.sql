-- ============================================================================
-- BREW & BLOOM — Database schema (SQL)
-- ----------------------------------------------------------------------------
-- This is the relational schema expressed in SQL. The application uses Prisma
-- + SQLite in this sandbox (see prisma/schema.prisma), but this file is
-- provided for portability to PostgreSQL / Supabase. It includes Row Level
-- Security policies that mirror the server-side authorization enforced in the
-- API routes (public read of products/categories, owner-scoped orders,
-- admin-only mutations).
-- ============================================================================

-- Categories -----------------------------------------------------------------
CREATE TABLE categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  "order"     INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Products -------------------------------------------------------------------
CREATE TABLE products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  price       INTEGER NOT NULL,            -- INR, whole rupees
  description TEXT NOT NULL,
  image       TEXT NOT NULL,
  gallery     TEXT,                         -- JSON-encoded string array
  available   BOOLEAN NOT NULL DEFAULT TRUE,
  vegetarian  BOOLEAN NOT NULL DEFAULT TRUE,
  featured    BOOLEAN NOT NULL DEFAULT FALSE,
  rating      DOUBLE PRECISION NOT NULL DEFAULT 4.8,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_available ON products(available);
CREATE INDEX idx_products_slug ON products(slug);

-- Admin users ----------------------------------------------------------------
CREATE TABLE admin_users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'admin',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customers ------------------------------------------------------------------
CREATE TABLE customers (
  id        TEXT PRIMARY KEY,
  email     TEXT NOT NULL UNIQUE,
  name      TEXT,
  phone     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_customers_email ON customers(email);

-- Orders ---------------------------------------------------------------------
CREATE TABLE orders (
  id              TEXT PRIMARY KEY,
  order_number    TEXT NOT NULL UNIQUE,
  customer_name   TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT NOT NULL,
  fulfillment     TEXT NOT NULL,            -- delivery | pickup
  address         TEXT,
  instructions    TEXT,
  subtotal        INTEGER NOT NULL,
  discount        INTEGER NOT NULL DEFAULT 0,
  delivery_charge INTEGER NOT NULL DEFAULT 0,
  total           INTEGER NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending',
  payment_status  TEXT NOT NULL DEFAULT 'unpaid',
  payment_mode    TEXT NOT NULL DEFAULT 'cod',
  customer_id     TEXT REFERENCES customers(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);

-- Order items ----------------------------------------------------------------
CREATE TABLE order_items (
  id           TEXT PRIMARY KEY,
  order_id     TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  price        INTEGER NOT NULL,
  quantity     INTEGER NOT NULL
);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Reservations ---------------------------------------------------------------
CREATE TABLE reservations (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT NOT NULL,
  date             TEXT NOT NULL,           -- YYYY-MM-DD
  time             TEXT NOT NULL,           -- HH:mm
  guests           INTEGER NOT NULL,
  special_requests TEXT,
  status           TEXT NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reservations_slot ON reservations(date, time);
CREATE INDEX idx_reservations_email ON reservations(email);
CREATE INDEX idx_reservations_status ON reservations(status);

-- Contact messages -----------------------------------------------------------
CREATE TABLE contact_messages (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  email     TEXT NOT NULL,
  subject   TEXT NOT NULL,
  message   TEXT NOT NULL,
  read      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_created ON contact_messages(created_at);
CREATE INDEX idx_messages_read ON contact_messages(read);

-- Newsletter -----------------------------------------------------------------
CREATE TABLE newsletter_subscribers (
  id        TEXT PRIMARY KEY,
  email     TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Discount codes -------------------------------------------------------------
CREATE TABLE discount_codes (
  id           TEXT PRIMARY KEY,
  code         TEXT NOT NULL UNIQUE,
  percentage   INTEGER,
  flat_amount  INTEGER,
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at   TIMESTAMPTZ,
  min_subtotal INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_discounts_code ON discount_codes(code);

-- Site settings --------------------------------------------------------------
CREATE TABLE site_settings (
  id        TEXT PRIMARY KEY,
  key       TEXT NOT NULL UNIQUE,
  value     TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- Row Level Security (PostgreSQL / Supabase)
-- These policies mirror the server-side authorization enforced in the Next.js
-- API routes. The application never exposes service-role keys to the client.
-- ============================================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Public can read available products and all categories.
CREATE POLICY "public_read_products" ON products FOR SELECT USING (available = TRUE);
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (TRUE);

-- Customers can read their own orders (matched by email); inserts via the API.
CREATE POLICY "owner_read_orders" ON orders FOR SELECT USING (email = current_setting('app.current_email', true));
CREATE POLICY "owner_read_order_items" ON order_items FOR SELECT USING (
  order_id IN (SELECT id FROM orders WHERE email = current_setting('app.current_email', true))
);

-- Reservations: customers insert their own; can read their own by email.
CREATE POLICY "owner_read_reservations" ON reservations FOR SELECT USING (email = current_setting('app.current_email', true));
CREATE POLICY "owner_insert_reservations" ON reservations FOR INSERT WITH CHECK (email = current_setting('app.current_email', true));

-- Contact + newsletter: public insert only (no read).
CREATE POLICY "public_insert_messages" ON contact_messages FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "public_insert_newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (TRUE);

-- Admin-only tables (products write, orders/reservations status, admin_users,
-- customers, discount_codes) are restricted to the service role, which is only
-- used server-side. No client-facing policy is granted for these mutations.

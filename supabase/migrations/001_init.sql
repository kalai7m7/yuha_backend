-- ============================================================
-- Migration 001 — initial schema
-- Yuha Exclusives · Supabase (PostgreSQL)
-- ============================================================

-- ── 1. Lookup tables ──────────────────────────────────────────

CREATE TABLE categories (
  category_id SERIAL PRIMARY KEY,
  name        TEXT UNIQUE NOT NULL
);

CREATE TABLE finish_types (
  finish_type_id SERIAL PRIMARY KEY,
  name           TEXT UNIQUE NOT NULL
);

CREATE TABLE occasion_types (
  occasion_type_id SERIAL PRIMARY KEY,
  name             TEXT UNIQUE NOT NULL
);

-- ── 2. Products ───────────────────────────────────────────────

CREATE TABLE products (
  product_id        SERIAL PRIMARY KEY,
  p_name            TEXT NOT NULL,
  description       TEXT,
  short_description TEXT,
  price             NUMERIC(10,2) NOT NULL,
  offer_price       NUMERIC(10,2),
  offer_label       TEXT,
  finish_type_id    INT REFERENCES finish_types(finish_type_id),
  delivery_time     TEXT,
  count             INT DEFAULT 0,
  category_id       INT REFERENCES categories(category_id),
  occasion_type_id  INT REFERENCES occasion_types(occasion_type_id),
  is_available      BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_images (
  image_id   SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  alt_text   TEXT DEFAULT NULL,
  sort_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. Customers ──────────────────────────────────────────────

CREATE TABLE customers (
  customer_id     SERIAL PRIMARY KEY,
  name            TEXT,
  phone_number    TEXT NOT NULL,
  alternate_phone TEXT,
  email           TEXT,
  address_line    TEXT,
  city            TEXT,
  state           TEXT,
  pincode         TEXT,
  status          TEXT DEFAULT 'new',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. Customer addresses ─────────────────────────────────────

CREATE TABLE customer_addresses (
  address_id   SERIAL PRIMARY KEY,
  customer_id  INT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
  label        TEXT DEFAULT 'Home',
  address_line TEXT,
  city         TEXT,
  state        TEXT,
  pincode      TEXT,
  is_default   BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. Delivery pincodes ──────────────────────────────────────

CREATE TABLE delivery_pincodes (
  pincode    TEXT PRIMARY KEY,
  city       TEXT,
  state      TEXT,
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. Orders ─────────────────────────────────────────────────

CREATE TABLE orders (
  order_id           SERIAL PRIMARY KEY,
  customer_id        INT REFERENCES customers(customer_id),
  order_date         TIMESTAMPTZ DEFAULT NOW(),
  total_amount       NUMERIC(10,2),
  shipping_cost      NUMERIC(10,2) DEFAULT 0,
  discount_amount    NUMERIC(10,2) DEFAULT 0,
  grand_total        NUMERIC(10,2),
  status             TEXT DEFAULT 'pending',
  shipping_name      TEXT,
  shipping_phone     TEXT,
  shipping_alt_phone TEXT,
  shipping_address   TEXT,
  shipping_city      TEXT,
  shipping_state     TEXT,
  shipping_pincode   TEXT,
  payment_method     TEXT DEFAULT 'cod',
  payment_status     TEXT DEFAULT 'pending',
  tracking_number    TEXT,
  coupon_code        TEXT,
  notes              TEXT,
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. Order items ────────────────────────────────────────────

CREATE TABLE order_items (
  order_item_id     SERIAL PRIMARY KEY,
  order_id          INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id        INT REFERENCES products(product_id) ON DELETE SET NULL,
  product_name      TEXT,
  product_image_url TEXT,
  quantity          INT NOT NULL DEFAULT 1,
  unit_price        NUMERIC(10,2),
  total_price       NUMERIC(10,2)
);

-- ── 8. Payments ───────────────────────────────────────────────

CREATE TABLE payments (
  payment_id     SERIAL PRIMARY KEY,
  order_id       INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  gateway        TEXT DEFAULT 'cod',
  gateway_txn_id TEXT,
  amount         NUMERIC(10,2) NOT NULL,
  currency       TEXT DEFAULT 'INR',
  status         TEXT DEFAULT 'pending',
  paid_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── 9. Inventory log ──────────────────────────────────────────

CREATE TABLE inventory_log (
  log_id     SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  change     INT NOT NULL,
  reason     TEXT NOT NULL,
  order_id   INT REFERENCES orders(order_id) ON DELETE SET NULL,
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 10. Coupons ───────────────────────────────────────────────

CREATE TABLE coupons (
  coupon_id        SERIAL PRIMARY KEY,
  code             TEXT UNIQUE NOT NULL,
  description      TEXT,
  discount_type    TEXT NOT NULL DEFAULT 'flat',
  discount_value   NUMERIC(10,2) NOT NULL,
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  max_uses         INT,
  used_count       INT DEFAULT 0,
  is_active        BOOLEAN DEFAULT TRUE,
  valid_from       TIMESTAMPTZ DEFAULT NOW(),
  valid_until      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── 11. Admins ────────────────────────────────────────────────

CREATE TABLE admins (
  id         SERIAL PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  role       TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────

CREATE INDEX idx_products_category      ON products(category_id);
CREATE INDEX idx_products_finish        ON products(finish_type_id);
CREATE INDEX idx_products_occasion      ON products(occasion_type_id);
CREATE INDEX idx_products_available     ON products(is_available);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_orders_customer        ON orders(customer_id);
CREATE INDEX idx_orders_status          ON orders(status);
CREATE INDEX idx_orders_date            ON orders(order_date DESC);
CREATE INDEX idx_order_items_order      ON order_items(order_id);
CREATE INDEX idx_order_items_product    ON order_items(product_id);
CREATE INDEX idx_payments_order         ON payments(order_id);
CREATE INDEX idx_inventory_product      ON inventory_log(product_id);
CREATE INDEX idx_addresses_customer     ON customer_addresses(customer_id);
CREATE INDEX idx_pincodes_active        ON delivery_pincodes(is_active);

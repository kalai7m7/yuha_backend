-- ============================================================
-- Yuha Exclusives — Supabase (PostgreSQL) Schema  v2
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================
-- TABLE ORDER (respects FK dependencies):
--   1. categories, finish_types, occasion_types  (no deps)
--   2. products, product_images                  (→ lookup tables)
--   3. customers                                 (no deps)
--   4. customer_addresses                        (→ customers)
--   5. delivery_pincodes                         (no deps)
--   6. orders                                    (→ customers)
--   7. order_items                               (→ orders, products)
--   8. payments                                  (→ orders)
--   9. inventory_log                             (→ products)
--  10. coupons                                   (no deps)
--  11. admins                                    (no deps)
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

-- image_url = full public CDN URL from Supabase Storage bucket "products"
-- ON DELETE CASCADE auto-removes image rows when product is deleted
CREATE TABLE product_images (
  image_id   SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  alt_text   TEXT DEFAULT NULL,
  sort_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ── 3. Customers ──────────────────────────────────────────────
-- Flat address columns kept for backwards compatibility.
-- Preferred going forward: use customer_addresses table.
-- status: 'new' | 'active' | 'vip'

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
  status          TEXT DEFAULT 'new',   -- new | active | vip
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ── 4. Customer addresses ─────────────────────────────────────
-- Multiple saved addresses per customer.
-- is_default = the address pre-selected at checkout.

CREATE TABLE customer_addresses (
  address_id   SERIAL PRIMARY KEY,
  customer_id  INT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
  label        TEXT DEFAULT 'Home',     -- 'Home', 'Office', etc.
  address_line TEXT,
  city         TEXT,
  state        TEXT,
  pincode      TEXT,
  is_default   BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);


-- ── 5. Delivery pincodes ──────────────────────────────────────
-- Replaces the hardcoded DELIVERABLE_PINCODES array in Checkout.tsx.
-- Admin can toggle is_active without a frontend deploy.

CREATE TABLE delivery_pincodes (
  pincode    TEXT PRIMARY KEY,
  city       TEXT,
  state      TEXT,
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ── 6. Orders ─────────────────────────────────────────────────
-- Shipping address is snapshotted at order time — not linked by FK —
-- so it is preserved even if the customer later changes their address.
-- status:         pending | confirmed | processing | shipped | delivered | cancelled
-- payment_status: pending | paid | failed | refunded
-- payment_method: cod | upi | razorpay | card

CREATE TABLE orders (
  order_id          SERIAL PRIMARY KEY,
  customer_id       INT REFERENCES customers(customer_id),
  order_date        TIMESTAMPTZ DEFAULT NOW(),
  total_amount      NUMERIC(10,2),
  shipping_cost     NUMERIC(10,2) DEFAULT 0,
  discount_amount   NUMERIC(10,2) DEFAULT 0,
  grand_total       NUMERIC(10,2),
  status            TEXT DEFAULT 'pending',
  -- Shipping address snapshot
  shipping_name     TEXT,
  shipping_phone    TEXT,
  shipping_alt_phone TEXT,
  shipping_address  TEXT,
  shipping_city     TEXT,
  shipping_state    TEXT,
  shipping_pincode  TEXT,
  -- Payment
  payment_method    TEXT DEFAULT 'cod',
  payment_status    TEXT DEFAULT 'pending',
  -- Fulfilment
  tracking_number   TEXT,
  coupon_code       TEXT,
  notes             TEXT,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);


-- ── 7. Order items ────────────────────────────────────────────
-- product_name and product_image_url are denormalised snapshots.
-- They preserve order history even if a product is later deleted.

CREATE TABLE order_items (
  order_item_id     SERIAL PRIMARY KEY,
  order_id          INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id        INT REFERENCES products(product_id) ON DELETE SET NULL,
  product_name      TEXT,                -- snapshot of p_name at order time
  product_image_url TEXT,               -- snapshot of first image URL at order time
  quantity          INT NOT NULL DEFAULT 1,
  unit_price        NUMERIC(10,2),       -- price at time of purchase
  total_price       NUMERIC(10,2)        -- unit_price × quantity
);


-- ── 8. Payments ───────────────────────────────────────────────
-- One row per payment attempt. An order can have multiple rows
-- if the first attempt fails and the customer retries.
-- status: pending | paid | failed | refunded

CREATE TABLE payments (
  payment_id     SERIAL PRIMARY KEY,
  order_id       INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  gateway        TEXT DEFAULT 'cod',     -- 'cod' | 'razorpay' | 'upi' | 'card'
  gateway_txn_id TEXT,                   -- transaction ID from the payment gateway
  amount         NUMERIC(10,2) NOT NULL,
  currency       TEXT DEFAULT 'INR',
  status         TEXT DEFAULT 'pending', -- pending | paid | failed | refunded
  paid_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);


-- ── 9. Inventory log ─────────────────────────────────────────
-- Audit trail for every stock change.
-- reason: 'sale' | 'restock' | 'manual_correction' | 'return'

CREATE TABLE inventory_log (
  log_id      SERIAL PRIMARY KEY,
  product_id  INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  change      INT NOT NULL,             -- positive = added, negative = deducted
  reason      TEXT NOT NULL,            -- sale | restock | manual_correction | return
  order_id    INT REFERENCES orders(order_id) ON DELETE SET NULL,
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ── 10. Coupons ───────────────────────────────────────────────
-- discount_type: 'flat' (₹ off) | 'percent' (% off)
-- min_order_amount: minimum cart value to apply coupon

CREATE TABLE coupons (
  coupon_id        SERIAL PRIMARY KEY,
  code             TEXT UNIQUE NOT NULL,
  description      TEXT,
  discount_type    TEXT NOT NULL DEFAULT 'flat',   -- flat | percent
  discount_value   NUMERIC(10,2) NOT NULL,
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  max_uses         INT,                             -- NULL = unlimited
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
  password   TEXT NOT NULL,            -- bcrypt hashed
  role       TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- Indexes — common query patterns
-- ============================================================

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


-- ============================================================
-- Seed data
-- ============================================================

-- Lookup tables
INSERT INTO categories (name) VALUES
  ('Necklaces'), ('Chains'), ('Chainsets'),
  ('Pendants'), ('Bracelets'), ('Earrings'), ('Bangles');

INSERT INTO finish_types (name) VALUES
  ('Antique'), ('Adstone'), ('Gold'), ('Rosegold');

INSERT INTO occasion_types (name) VALUES
  ('Festive'), ('Casual');

-- Delivery pincodes (from DELIVERABLE_PINCODES in Checkout.tsx)
INSERT INTO delivery_pincodes (pincode, city, state) VALUES
  ('110001', 'New Delhi',  'Delhi'),
  ('110002', 'New Delhi',  'Delhi'),
  ('110003', 'New Delhi',  'Delhi'),
  ('400001', 'Mumbai',     'Maharashtra'),
  ('400002', 'Mumbai',     'Maharashtra'),
  ('400003', 'Mumbai',     'Maharashtra'),
  ('560001', 'Bengaluru',  'Karnataka'),
  ('560002', 'Bengaluru',  'Karnataka'),
  ('560003', 'Bengaluru',  'Karnataka'),
  ('600001', 'Chennai',    'Tamil Nadu'),
  ('600002', 'Chennai',    'Tamil Nadu'),
  ('600003', 'Chennai',    'Tamil Nadu'),
  ('700001', 'Kolkata',    'West Bengal'),
  ('700002', 'Kolkata',    'West Bengal'),
  ('700003', 'Kolkata',    'West Bengal'),
  ('500001', 'Hyderabad',  'Telangana'),
  ('500002', 'Hyderabad',  'Telangana'),
  ('500003', 'Hyderabad',  'Telangana');

-- Admin users (bcrypt hashed passwords — safe to insert directly)
INSERT INTO admins (email, password, role) VALUES
  ('kalai7mdhoni@gmail.com', '', 'admin'),
  ('kalai7@gmail.com',       '', 'admin');


-- ============================================================
-- Verification queries — uncomment and run to confirm
-- ============================================================

-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT * FROM categories;
-- SELECT * FROM finish_types;
-- SELECT * FROM occasion_types;
-- SELECT * FROM delivery_pincodes ORDER BY city;
-- SELECT id, email, role, created_at FROM admins;

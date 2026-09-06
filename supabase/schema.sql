-- ============================================================
-- Yuha Exclusives — Supabase PostgreSQL Schema
-- All PKs are UUID. Supabase Auth manages users.
-- Run this in: Supabase Dashboard → SQL Editor
--
-- Run order:
--   1. Drop all (if rebuilding)    → see bottom of file
--   2. Run this entire file
--   3. Run seed.sql
--   4. Create admin user in Supabase Dashboard → Authentication → Users
--      then: UPDATE profiles SET role = 'admin' WHERE email = 'you@email.com';
-- ============================================================


-- ── 1. Profiles ───────────────────────────────────────────────
-- Extends auth.users. One row per Supabase Auth user.
-- Created automatically by trigger on_auth_user_created.
-- role: 'admin' | 'customer'

CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  full_name  TEXT,
  role       TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-insert profile row when a new Supabase Auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── 2. Lookup tables ──────────────────────────────────────────

CREATE TABLE public.categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT UNIQUE NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.finish_types (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT UNIQUE NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.occasion_types (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT UNIQUE NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 3. Products ───────────────────────────────────────────────

CREATE TABLE public.products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  description       TEXT,
  short_description TEXT,
  price             NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  offer_price       NUMERIC(10,2) CHECK (offer_price IS NULL OR offer_price >= 0),
  offer_label       TEXT,
  stock_quantity    INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  category_id       UUID REFERENCES public.categories(id),
  finish_type_id    UUID REFERENCES public.finish_types(id),
  occasion_type_id  UUID REFERENCES public.occasion_types(id),
  delivery_time     TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- image_url = full public CDN URL from Supabase Storage bucket "products"
-- image_path = storage object path (e.g. "products/uuid/filename.jpg") — used for deletion
CREATE TABLE public.product_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  image_path TEXT NOT NULL,
  alt_text   TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 4. Customers ──────────────────────────────────────────────
-- status: 'new' | 'active' | 'vip'

CREATE TABLE public.customers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT,
  phone_number    TEXT NOT NULL,
  alternate_phone TEXT,
  email           TEXT,
  address_line    TEXT,
  city            TEXT,
  state           TEXT,
  pincode         TEXT,
  status          TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'active', 'vip')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.customer_addresses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  label        TEXT NOT NULL DEFAULT 'Home',
  address_line TEXT,
  city         TEXT,
  state        TEXT,
  pincode      TEXT,
  is_default   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 5. Delivery pincodes ──────────────────────────────────────

CREATE TABLE public.delivery_pincodes (
  pincode    TEXT PRIMARY KEY,
  city       TEXT,
  state      TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  source     TEXT NOT NULL DEFAULT 'admin' CHECK (source IN ('admin', 'cache')),
  cached_at  TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 6. Orders ─────────────────────────────────────────────────
-- status:         pending | confirmed | processing | shipped | delivered | cancelled
-- payment_status: pending | paid | failed | refunded
-- payment_method: cod | upi | razorpay | card
-- Shipping address is snapshotted at order time (not FK-linked)

CREATE TABLE public.orders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id        UUID REFERENCES public.customers(id),
  order_date         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_amount       NUMERIC(10,2),
  shipping_cost      NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount    NUMERIC(10,2) NOT NULL DEFAULT 0,
  grand_total        NUMERIC(10,2),
  status             TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  -- Snapshot of shipping address at order time
  shipping_name      TEXT,
  shipping_phone     TEXT,
  shipping_alt_phone TEXT,
  shipping_address   TEXT,
  shipping_city      TEXT,
  shipping_state     TEXT,
  shipping_pincode   TEXT,
  -- Payment
  payment_method     TEXT NOT NULL DEFAULT 'cod'
                     CHECK (payment_method IN ('cod','upi','razorpay','card')),
  payment_status     TEXT NOT NULL DEFAULT 'pending'
                     CHECK (payment_status IN ('pending','paid','failed','refunded')),
  -- Fulfilment
  tracking_number    TEXT,
  coupon_code        TEXT,
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- product_name and product_image_url are denormalised snapshots
-- so order history is preserved even if a product is deleted
CREATE TABLE public.order_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id        UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name      TEXT NOT NULL,
  product_image_url TEXT,
  quantity          INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price        NUMERIC(10,2) NOT NULL,
  total_price       NUMERIC(10,2) NOT NULL
);


-- ── 7. Payments ───────────────────────────────────────────────
-- One row per payment attempt

CREATE TABLE public.payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  gateway        TEXT NOT NULL DEFAULT 'cod',
  gateway_txn_id TEXT,
  amount         NUMERIC(10,2) NOT NULL,
  currency       TEXT NOT NULL DEFAULT 'INR',
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','paid','failed','refunded')),
  paid_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 8. Inventory log ──────────────────────────────────────────
-- change: positive = stock added, negative = stock deducted
-- reason: 'sale' | 'restock' | 'manual_correction' | 'return'

CREATE TABLE public.inventory_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  change     INT NOT NULL,
  reason     TEXT NOT NULL CHECK (reason IN ('sale','restock','manual_correction','return')),
  order_id   UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 9. Coupons ────────────────────────────────────────────────
-- discount_type: 'flat' (₹ off) | 'percent' (% off)

CREATE TABLE public.coupons (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code             TEXT UNIQUE NOT NULL,
  description      TEXT,
  discount_type    TEXT NOT NULL DEFAULT 'flat' CHECK (discount_type IN ('flat','percent')),
  discount_value   NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_uses         INT,
  used_count       INT NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  valid_from       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_products_category      ON public.products(category_id);
CREATE INDEX idx_products_finish        ON public.products(finish_type_id);
CREATE INDEX idx_products_occasion      ON public.products(occasion_type_id);
CREATE INDEX idx_products_active        ON public.products(is_active);
CREATE INDEX idx_products_created_at    ON public.products(created_at DESC);
CREATE INDEX idx_product_images_product ON public.product_images(product_id);
CREATE INDEX idx_product_images_primary ON public.product_images(product_id, is_primary);
CREATE INDEX idx_orders_customer        ON public.orders(customer_id);
CREATE INDEX idx_orders_status          ON public.orders(status);
CREATE INDEX idx_orders_date            ON public.orders(order_date DESC);
CREATE INDEX idx_order_items_order      ON public.order_items(order_id);
CREATE INDEX idx_order_items_product    ON public.order_items(product_id);
CREATE INDEX idx_payments_order         ON public.payments(order_id);
CREATE INDEX idx_inventory_product      ON public.inventory_log(product_id);
CREATE INDEX idx_addresses_customer     ON public.customer_addresses(customer_id);
CREATE INDEX idx_pincodes_active        ON public.delivery_pincodes(is_active);


-- ============================================================
-- Storage
-- ============================================================
-- Bucket "products" must exist and be PUBLIC.
-- Create it in: Supabase Dashboard → Storage → New bucket
--   Name: products
--   Public: yes
--
-- image_path in product_images stores the storage object path
-- (e.g. "products/<product_id>/<filename>") used by the backend
-- to delete objects via supabaseAdmin.storage.from('products').remove([path])


-- ============================================================
-- To rebuild from scratch, run this FIRST, then re-run this file
-- ============================================================
-- DROP TABLE IF EXISTS
--   public.inventory_log, public.payments, public.order_items, public.orders,
--   public.customer_addresses, public.customers, public.delivery_pincodes,
--   public.product_images, public.products, public.coupons, public.profiles,
--   public.categories, public.finish_types, public.occasion_types
-- CASCADE;
-- DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

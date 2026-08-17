-- ============================================================
-- Yuha Exclusives — Seed Data
-- Run AFTER schema.sql
-- Safe to re-run: all inserts use ON CONFLICT DO NOTHING
-- ============================================================

-- ── Categories ────────────────────────────────────────────────
INSERT INTO public.categories (name) VALUES
  ('Necklaces'),
  ('Chains'),
  ('Chainsets'),
  ('Pendants'),
  ('Bracelets'),
  ('Earrings'),
  ('Bangles')
ON CONFLICT (name) DO NOTHING;

-- ── Finish types ──────────────────────────────────────────────
INSERT INTO public.finish_types (name) VALUES
  ('Antique'),
  ('Adstone'),
  ('Gold'),
  ('Rosegold')
ON CONFLICT (name) DO NOTHING;

-- ── Occasion types ────────────────────────────────────────────
INSERT INTO public.occasion_types (name) VALUES
  ('Festive'),
  ('Casual')
ON CONFLICT (name) DO NOTHING;

-- ── Delivery pincodes ─────────────────────────────────────────
INSERT INTO public.delivery_pincodes (pincode, city, state) VALUES
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
  ('500003', 'Hyderabad',  'Telangana')
ON CONFLICT (pincode) DO NOTHING;

-- ── Sample chains (20 products for infinite-scroll validation) ─
-- Plain INSERT … SELECT with inline subselects for FKs.
-- Guarded by WHERE NOT EXISTS so it is safe to re-run.
-- offer_price cast to numeric(10,2) to avoid type-mismatch with NULLs.
INSERT INTO public.products
  (name, short_description, price, offer_price, offer_label,
   stock_quantity, delivery_time, category_id, finish_type_id, occasion_type_id, is_active)
SELECT v.name, v.short_description, v.price, v.offer_price::numeric(10,2), v.offer_label,
       v.stock_quantity, v.delivery_time,
       (SELECT id FROM public.categories     WHERE name = 'Chains'   LIMIT 1),
       (SELECT id FROM public.finish_types   WHERE name = v.finish_name LIMIT 1),
       (SELECT id FROM public.occasion_types WHERE name = v.occ_name   LIMIT 1),
       true
FROM (VALUES
  ('Classic Gold Box Chain',       'Sleek 18-inch gold box chain',           499::numeric,  NULL,        NULL,        25, '3–5 days', 'Gold',     'Casual'),
  ('Rope Twist Rosegold Chain',    'Elegant rope-twist in rose gold',        549::numeric,  499::numeric,'9% OFF',    20, '3–5 days', 'Rosegold', 'Casual'),
  ('Antique Rajwadi Chain',        'Traditional antique finish long chain',  699::numeric,  NULL,        NULL,        15, '4–6 days', 'Antique',  'Festive'),
  ('Adstone Floral Chain',         'Floral motif chain with AD stones',      799::numeric,  749::numeric,'6% OFF',    18, '3–5 days', 'Adstone',  'Festive'),
  ('Slim Curb Chain — Gold',       'Minimalist curb link chain',             399::numeric,  NULL,        NULL,        30, '2–4 days', 'Gold',     'Casual'),
  ('Figaro Link Chain — Rosegold', 'Italian Figaro pattern, rose gold',      599::numeric,  NULL,        NULL,        22, '3–5 days', 'Rosegold', 'Casual'),
  ('Oxidised Silver-Tone Chain',   'Boho-style oxidised antique chain',      449::numeric,  399::numeric,'11% OFF',   28, '2–4 days', 'Antique',  'Casual'),
  ('Bridal Adstone Haar Chain',    'Heavy bridal chain with AD stones',     1099::numeric,  999::numeric,'9% OFF',    10, '5–7 days', 'Adstone',  'Festive'),
  ('Delicate Wheat Chain — Gold',  'Fine wheat-link everyday chain',         329::numeric,  NULL,        NULL,        35, '2–4 days', 'Gold',     'Casual'),
  ('Bold Anchor Chain — Rosegold', 'Bold anchor-link statement chain',       649::numeric,  NULL,        NULL,        12, '3–5 days', 'Rosegold', 'Festive'),
  ('Vintage Coin Chain — Antique', 'Antique coins dangling on long chain',   749::numeric,  699::numeric,'7% OFF',    14, '4–6 days', 'Antique',  'Festive'),
  ('Multi-strand Adstone Chain',   'Three-strand layered AD stone chain',    899::numeric,  849::numeric,'6% OFF',     9, '4–6 days', 'Adstone',  'Festive'),
  ('Singapore Twist Chain — Gold', 'Twisted Singapore link, gold tone',      459::numeric,  NULL,        NULL,        26, '2–4 days', 'Gold',     'Casual'),
  ('Herringbone Flat Chain — Rg',  'Ultra-flat herringbone, rose gold',      529::numeric,  NULL,        NULL,        20, '3–5 days', 'Rosegold', 'Casual'),
  ('Temple Motif Antique Chain',   'South-Indian temple design chain',       849::numeric,  799::numeric,'6% OFF',    11, '4–6 days', 'Antique',  'Festive'),
  ('Peacock Adstone Long Chain',   'Peacock motif AD stone long chain',      979::numeric,  929::numeric,'5% OFF',     8, '5–7 days', 'Adstone',  'Festive'),
  ('Ball Chain Necklace — Gold',   'Uniform ball chain, gold finish',        299::numeric,  NULL,        NULL,        40, '2–4 days', 'Gold',     'Casual'),
  ('Chunky Belcher Chain — Rg',    'Wide belcher link, rose gold tone',      579::numeric,  NULL,        NULL,        17, '3–5 days', 'Rosegold', 'Casual'),
  ('Layered Antique Lariat Chain', 'Convertible lariat-style antique chain', 719::numeric,  669::numeric,'7% OFF',    13, '4–6 days', 'Antique',  'Casual'),
  ('Grand Adstone Bridal Chain',   'Full-set grand bridal AD stone chain',  1149::numeric, 1049::numeric,'9% OFF',     6, '5–7 days', 'Adstone',  'Festive')
) AS v(name, short_description, price, offer_price, offer_label,
       stock_quantity, delivery_time, finish_name, occ_name)
WHERE NOT EXISTS (
  SELECT 1 FROM public.products p WHERE p.name = v.name
);

-- ── After running seed.sql ────────────────────────────────────
-- Verify with:
--   SELECT * FROM public.categories;
--   SELECT * FROM public.finish_types;
--   SELECT * FROM public.occasion_types;
--   SELECT count(*) FROM public.delivery_pincodes;
--
-- Create your admin user:
--   Supabase Dashboard → Authentication → Users → Add user
--   Then run:
--   UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';

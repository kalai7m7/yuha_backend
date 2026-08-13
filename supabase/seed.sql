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

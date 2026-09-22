-- ============================================================
-- Migration 002 — Testimonials table
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE public.testimonials (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  city        TEXT NOT NULL,
  product     TEXT NOT NULL,
  review      TEXT NOT NULL,
  initials    TEXT NOT NULL,
  avatar_class TEXT NOT NULL DEFAULT 'bg-mint text-teal-900',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed with the existing hardcoded testimonials
INSERT INTO public.testimonials (name, city, product, review, initials, avatar_class, sort_order) VALUES
  ('Priya Ramesh',  'Chennai',    'Necklace', 'Absolutely stunning necklace! The gold finish is impeccable and it arrived beautifully packaged. Got so many compliments at my cousin''s wedding.', 'PR', 'bg-mint text-teal-900',         1),
  ('Sneha Devi',    'Coimbatore', 'Bangles',  'The antique finish bangles are exactly what I was looking for. Quality is amazing for the price and delivery was super fast!',                    'SD', 'bg-green-150 text-green-650',   2),
  ('Anitha Kumar',  'Tiruppur',   'Earrings', 'Ordered the rose gold earrings and I''m obsessed. Lightweight, don''t irritate my ears at all. Already placed my second order!',                 'AK', 'bg-yellow-100 text-yellow-800', 3),
  ('Meena Velu',    'Madurai',    'Pendant',  'My mom loves the pendant I gifted her. The craftsmanship is gorgeous and the packaging made it feel like a luxury brand experience.',              'MV', 'bg-mint text-teal-900',         4),
  ('Lakshmi Nair',  'Trichy',     'Chain',    'The chain doesn''t tarnish even after daily wear. Durable, shiny, and exactly as described. Great value for money — highly recommend!',          'LN', 'bg-green-150 text-green-650',   5),
  ('Kavitha S',     'Salem',      'Bracelet', 'The bracelet set elevated my whole casual look. Super happy with the quality and finish. Will definitely recommend Yuha to all my friends!',      'KS', 'bg-yellow-100 text-yellow-800', 6);

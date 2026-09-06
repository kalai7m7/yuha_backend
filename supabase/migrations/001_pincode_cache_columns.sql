-- Migration 001: Add source + cached_at columns to delivery_pincodes
-- Run this once in Supabase Dashboard → SQL Editor on the live database.
-- Safe to re-run (IF NOT EXISTS / DO NOTHING guards).

ALTER TABLE public.delivery_pincodes
  ADD COLUMN IF NOT EXISTS source    TEXT NOT NULL DEFAULT 'admin'
                                      CHECK (source IN ('admin', 'cache')),
  ADD COLUMN IF NOT EXISTS cached_at TIMESTAMPTZ;

-- Mark all existing rows as admin-managed
UPDATE public.delivery_pincodes
SET source = 'admin'
WHERE source IS DISTINCT FROM 'admin';

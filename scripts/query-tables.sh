#!/usr/bin/env bash
# ============================================================
# scripts/query-tables.sh
# Read all tables from your live Supabase project via CLI
# Usage:  bash scripts/query-tables.sh
# Prereq: supabase CLI linked  (supabase link --project-ref oyovmpyegdxtlkumdhzn)
# ============================================================

set -euo pipefail
cd "$(dirname "$0")/.."   # run from yuha_backend root

PROJECT_REF="oyovmpyegdxtlkumdhzn"

echo ""
echo "══════════════════════════════════════════════"
echo " Yuha DB — Live Table Query"
echo " Project: $PROJECT_REF"
echo "══════════════════════════════════════════════"

# ── Helper ────────────────────────────────────────────────────
run_query() {
  local label="$1"
  local sql="$2"
  echo ""
  echo "── $label ──────────────────────────────────"
  supabase db query --linked "$sql"
}

# ── Table list ────────────────────────────────────────────────
run_query "All tables in public schema" \
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"

# ── Row counts ────────────────────────────────────────────────
run_query "Row counts per table" \
  "SELECT
     relname  AS table_name,
     n_live_tup AS row_count
   FROM pg_stat_user_tables
   ORDER BY relname;"

# ── Lookup data ───────────────────────────────────────────────
run_query "Categories" \
  "SELECT * FROM categories ORDER BY category_id;"

run_query "Finish types" \
  "SELECT * FROM finish_types ORDER BY finish_type_id;"

run_query "Occasion types" \
  "SELECT * FROM occasion_types ORDER BY occasion_type_id;"

# ── Products ──────────────────────────────────────────────────
run_query "Products (all)" \
  "SELECT
     p.product_id,
     p.p_name,
     p.price,
     p.offer_price,
     c.name  AS category,
     f.name  AS finish,
     o.name  AS occasion,
     p.count AS stock,
     p.is_available
   FROM products p
   LEFT JOIN categories    c ON p.category_id      = c.category_id
   LEFT JOIN finish_types  f ON p.finish_type_id   = f.finish_type_id
   LEFT JOIN occasion_types o ON p.occasion_type_id = o.occasion_type_id
   ORDER BY p.product_id;"

# ── Images ────────────────────────────────────────────────────
run_query "Product images" \
  "SELECT image_id, product_id, image_url, sort_order FROM product_images ORDER BY product_id, sort_order;"

# ── Delivery pincodes ─────────────────────────────────────────
run_query "Delivery pincodes" \
  "SELECT pincode, city, state, is_active FROM delivery_pincodes ORDER BY city, pincode;"

# ── Admins (no passwords) ─────────────────────────────────────
run_query "Admins" \
  "SELECT id, email, role, created_at FROM admins;"

# ── Orders + customers ────────────────────────────────────────
run_query "Orders (latest 10)" \
  "SELECT order_id, customer_id, status, grand_total, payment_method, payment_status, order_date
   FROM orders ORDER BY order_date DESC LIMIT 10;"

run_query "Customers" \
  "SELECT customer_id, name, phone_number, email, status, created_at FROM customers ORDER BY customer_id;"

echo ""
echo "══════════════════════════════════════════════"
echo " Done."
echo "══════════════════════════════════════════════"
echo ""

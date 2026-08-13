#!/usr/bin/env bash
# ============================================================
# scripts/add-dummy-products.sh
# POST 10 dummy products to your local Express API
# Usage:  bash scripts/add-dummy-products.sh
# Prereq: npm run dev must be running in another terminal
# ============================================================

set -euo pipefail

API="http://localhost:3000/api/items"

echo ""
echo "══════════════════════════════════════════════"
echo " Yuha — Adding dummy products via API"
echo " Endpoint: $API"
echo "══════════════════════════════════════════════"

# Helper: post a product and print result
post_product() {
  local name="$1"
  shift
  echo ""
  echo "── Adding: $name"
  curl -s -X POST "$API" \
    -F "p_name=$name" \
    "$@" | python3 -m json.tool 2>/dev/null || echo "(raw response printed above)"
}

# ── Products ──────────────────────────────────────────────────
# category_id:      1=Necklaces 2=Chains 3=Chainsets 4=Pendants 5=Bracelets 6=Earrings 7=Bangles
# finish_type_id:   1=Antique   2=Adstone 3=Gold     4=Rosegold
# occasion_type_id: 1=Festive   2=Casual

post_product "Classic Gold Necklace" \
  -F "description=Elegant 22kt gold necklace with intricate floral design, perfect for weddings and festive occasions." \
  -F "short_description=Festive floral gold necklace" \
  -F "price=4999" \
  -F "offer_price=3999" \
  -F "offer_label=20% OFF" \
  -F "finish_type_id=3" \
  -F "delivery_time=5-7 business days" \
  -F "count=15" \
  -F "category_id=1" \
  -F "occasion_type_id=1"

post_product "Rosegold Chain Set" \
  -F "description=Delicate rosegold chain set with matching earrings. Ideal for casual daily wear." \
  -F "short_description=Rosegold chain set" \
  -F "price=2499" \
  -F "offer_price=1999" \
  -F "offer_label=Best Seller" \
  -F "finish_type_id=4" \
  -F "delivery_time=3-5 business days" \
  -F "count=30" \
  -F "category_id=3" \
  -F "occasion_type_id=2"

post_product "Antique Pendant" \
  -F "description=Handcrafted antique finish pendant with traditional temple design." \
  -F "short_description=Antique temple pendant" \
  -F "price=1299" \
  -F "finish_type_id=1" \
  -F "delivery_time=4-6 business days" \
  -F "count=20" \
  -F "category_id=4" \
  -F "occasion_type_id=1"

post_product "AD Stone Bangles Set" \
  -F "description=Set of 6 American diamond stone bangles with gold plating. Perfect for festive gatherings." \
  -F "short_description=AD stone bangle set of 6" \
  -F "price=3499" \
  -F "offer_price=2799" \
  -F "offer_label=Festive Deal" \
  -F "finish_type_id=2" \
  -F "delivery_time=5-7 business days" \
  -F "count=10" \
  -F "category_id=7" \
  -F "occasion_type_id=1"

post_product "Rosegold Bracelet" \
  -F "description=Slim rosegold bracelet with heart charm. A perfect everyday accessory." \
  -F "short_description=Slim heart charm bracelet" \
  -F "price=899" \
  -F "offer_price=749" \
  -F "offer_label=New Arrival" \
  -F "finish_type_id=4" \
  -F "delivery_time=2-4 business days" \
  -F "count=50" \
  -F "category_id=5" \
  -F "occasion_type_id=2"

post_product "Gold Drop Earrings" \
  -F "description=Lightweight gold drop earrings with pearl detail. Suitable for all occasions." \
  -F "short_description=Gold pearl drop earrings" \
  -F "price=1599" \
  -F "offer_price=1299" \
  -F "offer_label=18% OFF" \
  -F "finish_type_id=3" \
  -F "delivery_time=3-5 business days" \
  -F "count=25" \
  -F "category_id=6" \
  -F "occasion_type_id=2"

post_product "Antique Choker Necklace" \
  -F "description=Statement antique choker with oxidised finish and red stone accents." \
  -F "short_description=Antique choker with red stones" \
  -F "price=2999" \
  -F "offer_price=2499" \
  -F "offer_label=Limited Stock" \
  -F "finish_type_id=1" \
  -F "delivery_time=5-7 business days" \
  -F "count=8" \
  -F "category_id=1" \
  -F "occasion_type_id=1"

post_product "Gold Chain 22kt" \
  -F "description=Classic 22kt gold chain, 18 inches. Daily wear essential." \
  -F "short_description=22kt gold chain 18 inch" \
  -F "price=5999" \
  -F "finish_type_id=3" \
  -F "delivery_time=5-7 business days" \
  -F "count=12" \
  -F "category_id=2" \
  -F "occasion_type_id=2"

post_product "Casual Rosegold Earrings" \
  -F "description=Small round rosegold stud earrings. Minimalist design for everyday use." \
  -F "short_description=Rosegold studs" \
  -F "price=599" \
  -F "offer_price=499" \
  -F "offer_label=Under Rs.500" \
  -F "finish_type_id=4" \
  -F "delivery_time=2-4 business days" \
  -F "count=60" \
  -F "category_id=6" \
  -F "occasion_type_id=2"

post_product "Adstone Necklace Set" \
  -F "description=Full bridal American diamond necklace set with earrings and maang tikka." \
  -F "short_description=Bridal AD stone full set" \
  -F "price=8999" \
  -F "offer_price=7499" \
  -F "offer_label=Bridal Special" \
  -F "finish_type_id=2" \
  -F "delivery_time=7-10 business days" \
  -F "count=5" \
  -F "category_id=1" \
  -F "occasion_type_id=1"

echo ""
echo "══════════════════════════════════════════════"
echo " Done — 10 products posted."
echo " Verify: curl -s http://localhost:3000/api/items | python3 -m json.tool"
echo "══════════════════════════════════════════════"
echo ""

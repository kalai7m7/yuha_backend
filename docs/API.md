# Yuha Backend — API Reference

Base URL: `http://localhost:3000`  
All responses are JSON `{ success: boolean, data: ... }` on success  
or `{ success: false, error: { code, message }, requestId }` on failure.

---

## Health

### GET /api/health
Server liveness check.

```bash
curl -s http://localhost:3000/api/health | python3 -m json.tool
```

**Response 200**
```json
{ "success": true, "data": { "status": "ok", "service": "yuha-backend" } }
```

---

### GET /api/debug/supabase
⚠️ Temporary — confirms DB connection. Remove before production.

```bash
curl -s http://localhost:3000/api/debug/supabase | python3 -m json.tool
```

**Response 200** — connection OK
```json
{ "success": true, "data": [] }
```

---

## Catalog

### GET /api/catalog
Returns all three lookup tables in one call. Used by the frontend to populate filter dropdowns.

```bash
curl -s http://localhost:3000/api/catalog | python3 -m json.tool
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "categories":    [{ "id": "uuid", "name": "Necklaces" }, ...],
    "finish_types":  [{ "id": "uuid", "name": "Gold" }, ...],
    "occasion_types":[{ "id": "uuid", "name": "Festive" }, ...]
  }
}
```

---

### GET /api/catalog/categories

```bash
curl -s http://localhost:3000/api/catalog/categories | python3 -m json.tool
```

**Response 200**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Bangles" },
    { "id": "uuid", "name": "Bracelets" },
    { "id": "uuid", "name": "Chains" },
    { "id": "uuid", "name": "Chainsets" },
    { "id": "uuid", "name": "Earrings" },
    { "id": "uuid", "name": "Necklaces" },
    { "id": "uuid", "name": "Pendants" }
  ]
}
```

---

### GET /api/catalog/finish-types

```bash
curl -s http://localhost:3000/api/catalog/finish-types | python3 -m json.tool
```

---

### GET /api/catalog/occasion-types

```bash
curl -s http://localhost:3000/api/catalog/occasion-types | python3 -m json.tool
```

---

## Products

### GET /api/products
List products. All query params are optional and combinable.

| Param | Type | Values | Example |
|---|---|---|---|
| `category` | string | Any category name | `Necklaces` |
| `finish_type` | string | Any finish type name | `Gold` |
| `occasion_type` | string | Any occasion type name | `Festive` |
| `is_available` | boolean | `true` / `false` | `true` |
| `sort_by` | string | `price_asc` `price_desc` `newest` | `price_asc` |

```bash
# All products (newest first)
curl -s http://localhost:3000/api/products | python3 -m json.tool

# Filter by category
curl -s "http://localhost:3000/api/products?category=Necklaces" | python3 -m json.tool

# Filter by finish type
curl -s "http://localhost:3000/api/products?finish_type=Gold" | python3 -m json.tool

# Filter by occasion
curl -s "http://localhost:3000/api/products?occasion_type=Festive" | python3 -m json.tool

# Active products only
curl -s "http://localhost:3000/api/products?is_available=true" | python3 -m json.tool

# Sort by price low → high
curl -s "http://localhost:3000/api/products?sort_by=price_asc" | python3 -m json.tool

# Sort by price high → low
curl -s "http://localhost:3000/api/products?sort_by=price_desc" | python3 -m json.tool

# Combine filters
curl -s "http://localhost:3000/api/products?category=Necklaces&finish_type=Gold&sort_by=price_asc&is_available=true" | python3 -m json.tool
```

**Response 200**
```json
{
  "success": true,
  "data": [{
    "id": "uuid",
    "name": "Gold Layered Necklace",
    "description": "...",
    "short_description": "...",
    "price": "1499.00",
    "offer_price": null,
    "offer_label": null,
    "stock_quantity": 10,
    "delivery_time": "3-5 days",
    "is_active": true,
    "created_at": "2025-...",
    "updated_at": "2025-...",
    "categories":     { "id": "uuid", "name": "Necklaces" },
    "finish_types":   { "id": "uuid", "name": "Gold" },
    "occasion_types": { "id": "uuid", "name": "Festive" },
    "product_images": [
      { "id": "uuid", "image_url": "https://...supabase.co/...", "is_primary": true, "sort_order": 0 }
    ]
  }]
}
```

---

### GET /api/products/:id

```bash
# Replace with a real UUID from the list response
curl -s http://localhost:3000/api/products/YOUR-PRODUCT-UUID | python3 -m json.tool

# 404 test
curl -s http://localhost:3000/api/products/00000000-0000-0000-0000-000000000000 | python3 -m json.tool
```

**Response 404**
```json
{ "success": false, "error": { "code": "PRODUCT_NOT_FOUND", "message": "Product not found" } }
```

---

### POST /api/products
Create a new product. `name` and `price` are required.

```bash
# Minimal
curl -s -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gold Layered Necklace",
    "price": 1499
  }' | python3 -m json.tool

# Full
curl -s -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Antique Bangle Set",
    "description": "Traditional antique finish bangle set with intricate design",
    "short_description": "Antique finish bangle set",
    "price": 899,
    "offer_price": 749,
    "offer_label": "17% off",
    "stock_quantity": 5,
    "delivery_time": "3-5 days",
    "category_id": "YOUR-CATEGORY-UUID",
    "finish_type_id": "YOUR-FINISH-TYPE-UUID",
    "occasion_type_id": "YOUR-OCCASION-TYPE-UUID"
  }' | python3 -m json.tool
```

> Get `category_id`, `finish_type_id`, `occasion_type_id` from `GET /api/catalog`.

**Response 201** — returns the created product with all relations.

---

### PUT /api/products/:id
Update any fields on an existing product. All fields are optional.

```bash
# Update price and stock
curl -s -X PUT http://localhost:3000/api/products/YOUR-PRODUCT-UUID \
  -H "Content-Type: application/json" \
  -d '{
    "price": 1299,
    "stock_quantity": 8
  }' | python3 -m json.tool

# Deactivate a product
curl -s -X PUT http://localhost:3000/api/products/YOUR-PRODUCT-UUID \
  -H "Content-Type: application/json" \
  -d '{ "is_active": false }' | python3 -m json.tool

# Update offer
curl -s -X PUT http://localhost:3000/api/products/YOUR-PRODUCT-UUID \
  -H "Content-Type: application/json" \
  -d '{
    "offer_price": 999,
    "offer_label": "Sale"
  }' | python3 -m json.tool
```

**Response 200** — returns the updated product with all relations.  
**Response 404** — if product UUID does not exist.

---

### DELETE /api/products/:id

```bash
curl -s -X DELETE http://localhost:3000/api/products/YOUR-PRODUCT-UUID | python3 -m json.tool

# 404 test
curl -s -X DELETE http://localhost:3000/api/products/00000000-0000-0000-0000-000000000000 | python3 -m json.tool
```

**Response 200**
```json
{ "success": true, "data": null }
```

---

## Error Codes

| Code | HTTP | Meaning |
|---|---|---|
| `NOT_FOUND` | 404 | Route does not exist |
| `PRODUCT_NOT_FOUND` | 404 | Product UUID not found |
| `PRODUCT_QUERY_FAILED` | 500 | DB error fetching product(s) |
| `PRODUCT_CREATE_FAILED` | 500 | DB error creating product |
| `PRODUCT_UPDATE_FAILED` | 500 | DB error updating product |
| `PRODUCT_DELETE_FAILED` | 500 | DB error deleting product |
| `CATEGORY_QUERY_FAILED` | 500 | DB error fetching categories |
| `FINISH_TYPE_QUERY_FAILED` | 500 | DB error fetching finish types |
| `OCCASION_TYPE_QUERY_FAILED` | 500 | DB error fetching occasion types |
| `VALIDATION_ERROR` | 400 | Zod request validation failed |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

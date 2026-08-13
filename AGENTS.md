# AGENTS.md — Yuha Backend

> Canonical reference for AI agents working on `yuha_backend/`.
> Read before making any changes. Update whenever architecture or status changes.

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 |
| Framework | Express 5 |
| Language | TypeScript 5 (strict) |
| Database | Supabase PostgreSQL (via `@supabase/supabase-js`) |
| Auth | Supabase Auth |
| Storage | Supabase Storage (bucket: `products`) |
| Logging | pino + pino-http |
| Validation | zod v4 (env only) |

---

## Project Structure

```
yuha_backend/
├── src/
│   ├── index.ts                     Entry point — app.listen, graceful shutdown
│   ├── app.ts                       Express setup — CORS, helmet, middleware, routes
│   ├── routes.ts                    Top-level API router — mounts all module routers
│   ├── config/
│   │   └── env.ts                   Zod-validated env schema — fails fast on bad config
│   ├── lib/
│   │   ├── logger.ts                Pino logger instance (redacts secrets)
│   │   ├── requestLogger.ts         Pino-http request/response logger
│   │   └── supabase/
│   │       ├── client.ts            supabase — PUBLISHABLE_KEY, Supabase Auth only
│   │       └── admin.ts             supabaseAdmin — SECRET_KEY, DB + Storage, bypasses RLS
│   ├── middleware/
│   │   ├── auth.middleware.ts       requireAuth — validates Bearer token via supabase.auth.getUser()
│   │   ├── role.middleware.ts       requireRole — checks profiles.role
│   │   └── error.middleware.ts      Global error handler + 404 handler
│   ├── modules/
│   │   ├── auth/                    (unmounted — ready for when auth is needed)
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.service.ts
│   │   ├── catalog/                 Lookup tables: categories, finish_types, occasion_types
│   │   │   ├── catalog.routes.ts
│   │   │   ├── catalog.controller.ts
│   │   │   ├── catalog.service.ts
│   │   │   └── catalog.repository.ts
│   │   └── products/                Product CRUD
│   │       ├── product.routes.ts
│   │       ├── product.controller.ts
│   │       ├── product.service.ts
│   │       └── product.repository.ts
│   ├── shared/
│   │   └── errors/
│   │       └── AppError.ts          Typed app error: statusCode, message, code
│   └── types/
│       └── express.d.ts             Augments req.user with Supabase User type
└── supabase/
    ├── schema.sql                   Full DB schema — run once to create all tables
    └── seed.sql                     Reference data — safe to re-run (ON CONFLICT DO NOTHING)
```

---

## Environment Variables

File: `yuha_backend/.env` (never commit — gitignored)

| Variable | Required | Notes |
|---|---|---|
| `PORT` | No | Default `3000` |
| `NODE_ENV` | No | `development` / `production`. Default `development` |
| `SUPABASE_URL` | **Yes** | `https://<ref>.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | **Yes** | Starts `sb_publishable_…` — Dashboard → API → Publishable key. Auth flows only. |
| `SUPABASE_SECRET_KEY` | **Yes** | Starts `sb_secret_…` or `eyJ…` — Dashboard → API → Secret key. **Server only.** |
| `CORS_ORIGINS` | No | Comma-separated. Default `http://localhost:5173` |
| `LOG_LEVEL` | No | `debug` / `info` / `warn` / `error`. Default `info` |

See `.env.example` for the template.

---

## Supabase Clients

| Export | File | Key | Purpose |
|---|---|---|---|
| `supabase` | `src/lib/supabase/client.ts` | `SUPABASE_PUBLISHABLE_KEY` | Auth only — `signInWithPassword`, `getUser` |
| `supabaseAdmin` | `src/lib/supabase/admin.ts` | `SUPABASE_SECRET_KEY` | All DB queries + Storage — bypasses RLS |

**Rule:** never use `supabaseAdmin` in frontend code. Never use `supabase` (publishable) for DB queries.

---

## API Routes

All routes are prefixed `/api`.

| Method | Path | Handler | Auth | Notes |
|---|---|---|---|---|
| `GET` | `/api/health` | inline in `app.ts` | None | Health check |
| `GET` | `/api/debug/supabase` | inline in `app.ts` | None | **Temporary** — remove after DB confirmed working |
| `GET` | `/api/catalog` | `getAllCatalogController` | None | Returns `{ categories, finish_types, occasion_types }` |
| `GET` | `/api/catalog/categories` | `getCategoriesController` | None | |
| `GET` | `/api/catalog/finish-types` | `getFinishTypesController` | None | |
| `GET` | `/api/catalog/occasion-types` | `getOccasionTypesController` | None | |
| `GET` | `/api/products` | `listProductsController` | None | Query: `category`, `finish_type`, `occasion_type`, `is_available`, `sort_by` |
| `GET` | `/api/products/:id` | `getProductController` | None | |
| `POST` | `/api/products` | `createProductController` | None (add later) | Body: `CreateProductInput` |
| `PUT` | `/api/products/:id` | `updateProductController` | None (add later) | Body: `UpdateProductInput` |
| `DELETE` | `/api/products/:id` | `deleteProductController` | None (add later) | |

### Query params for `GET /api/products`

| Param | Type | Example |
|---|---|---|
| `category` | string | `?category=Necklaces` |
| `finish_type` | string | `?finish_type=Gold` |
| `occasion_type` | string | `?occasion_type=Festive` |
| `is_available` | `true` / `false` | `?is_available=true` |
| `sort_by` | `price_asc` / `price_desc` / `newest` | `?sort_by=price_asc` |

---

## Module Pattern

Every module follows the same 4-file pattern:

```
module.routes.ts      → Express Router, maps HTTP verbs to controllers
module.controller.ts  → Reads req, calls service, writes res — no business logic
module.service.ts     → Business logic — orchestrates repository calls
module.repository.ts  → All supabaseAdmin DB calls — one function per query
```

**Error handling:** repository functions log `supabaseError` with `logger.error` then throw `AppError`. Controllers do not try/catch — Express 5 propagates async errors automatically to `errorHandler`.

---

## Database Schema

File: `supabase/schema.sql`

| Table | PK | Purpose |
|---|---|---|
| `profiles` | UUID → `auth.users.id` | Extends Supabase Auth users. Auto-created by trigger. |
| `categories` | UUID | Lookup — Necklaces, Chains, Chainsets, Pendants, Bracelets, Earrings, Bangles |
| `finish_types` | UUID | Lookup — Antique, Adstone, Gold, Rosegold |
| `occasion_types` | UUID | Lookup — Festive, Casual |
| `products` | UUID | Core product — FKs to all three lookup tables |
| `product_images` | UUID | Images per product. `image_url` = CDN URL. `image_path` = Storage object path for deletion. CASCADE delete. |
| `customers` | UUID | Customer records created at checkout |
| `customer_addresses` | UUID | Multiple addresses per customer |
| `delivery_pincodes` | TEXT (pincode) | Deliverable pincodes |
| `orders` | UUID | Order header — shipping address snapshotted, not FK-linked |
| `order_items` | UUID | Line items — `product_name` / `product_image_url` denormalised for history |
| `payments` | UUID | One row per payment attempt |
| `inventory_log` | UUID | Audit trail for stock changes |
| `coupons` | UUID | Discount codes |

**All PKs are UUID** (`gen_random_uuid()`). No SERIAL / bigint.

---

## Running Locally

```bash
cd yuha_backend
cp .env.example .env    # fill in SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY
npm install
npm run dev             # nodemon + ts-node, port 3000
```

### Verify

```bash
# Server health
curl -s http://localhost:3000/api/health | python3 -m json.tool

# DB connection
curl -s http://localhost:3000/api/debug/supabase | python3 -m json.tool

# Catalog (requires seed data)
curl -s http://localhost:3000/api/catalog | python3 -m json.tool

# Products
curl -s http://localhost:3000/api/products | python3 -m json.tool
```

### DB Setup (first time)

1. **Supabase Dashboard → SQL Editor** — run `supabase/schema.sql`
2. **Supabase Dashboard → SQL Editor** — run `supabase/seed.sql`
3. **Supabase Dashboard → Storage** — create bucket `products`, set Public
4. **Supabase Dashboard → Authentication → Users** — add admin user
5. In SQL Editor: `UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';`

---

## Known Gaps / Not Yet Done

| Item | Notes |
|---|---|
| **Auth module not mounted** | `src/modules/auth/` exists but is not in `routes.ts`. Mount when ready. |
| **Product write routes unprotected** | `POST/PUT/DELETE /api/products` have no auth. Add `requireAuth` + `requireRole('admin')` before production. |
| **Storage uploads not implemented** | `product_images` table has `image_path` column ready. Upload via `supabaseAdmin.storage.from('products')` — not yet wired. |
| **Checkout / orders** | No `POST /api/orders` endpoint yet. |
| **Customers / pincodes** | No modules yet for `customers`, `delivery_pincodes`, `orders`. |
| **`/api/debug/supabase`** | Temporary probe endpoint in `app.ts` — remove before production. |
| **RLS** | Schema has no RLS policies yet. `supabaseAdmin` bypasses RLS server-side so it works, but add policies before exposing any direct Supabase client access. |

---

## Gotchas

| Issue | Fix |
|---|---|
| `env` parse error at startup | Zod rejects missing/wrong-typed vars. Check all three Supabase vars are set in `.env`. |
| `JWT issued at future` | Mac system clock is ahead of Supabase servers. Run: `sudo sntp -sS time.apple.com` |
| `SUPABASE_PUBLISHABLE_KEY` | Dashboard → Project Settings → API → **Publishable key** (`sb_publishable_…`) |
| `SUPABASE_SECRET_KEY` | Dashboard → Project Settings → API → **Secret key** (`sb_secret_…` or `eyJ…`) |
| `EADDRINUSE` on port 3000 | Old process still running. Kill it: `lsof -ti :3000 \| xargs kill -9` |
| Auth 401 unexpected | `requireAuth` reads `Authorization: Bearer <token>`. Frontend must send header, not cookie. |
| Images show double URL | `VITE_IMAGE_URL` is not empty in frontend `.env.local`. Set `VITE_IMAGE_URL=` |
| `npx vite` downloads wrong version | Always use `npm run dev` in `yuhaexclusives/` — uses local Vite v6 |

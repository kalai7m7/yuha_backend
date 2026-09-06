# Yuha Backend — Supabase Starter

Greenfield Express 5 + TypeScript + Supabase backend starter.

## Architecture

```text
React + Vite
    ↓
Express 5
    ↓
Auth / Authorization / Validation
    ↓
Services
    ↓
Repositories
    ↓
Supabase JS
    ├── Auth
    ├── PostgreSQL
    └── Storage

Express logs
    ↓
stdout
    ↓
Railway
```

## 1. Prerequisites

- Node.js
- npm
- Supabase project
- Supabase CLI (for migrations)
- Railway account for deployment

## 2. Install

```bash
npm install
```

## 3. Environment

```bash
cp .env.example .env
```

Set:

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
```

`SUPABASE_SECRET_KEY` is backend-only.

Never use it in React/Vite.

## 4. Link Supabase

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

This starter does not require a local Supabase database.

Your local Express server can connect to the hosted Supabase project.

## 5. Apply migrations

```bash
supabase db push
```

Seed:

```bash
supabase db reset
```

Do NOT run `db reset` against a production project unless you explicitly understand the consequences.

For a hosted development/project database, prefer:

```bash
supabase db push
```

after reviewing migrations.

## 6. Create Storage Bucket

In Supabase:

Storage → New bucket

Name:

```text
products
```

For public catalogue images, make the bucket public.

Uploads should still be performed by Express using the server-only secret key.

## 7. Run

```bash
npm run dev
```

Test:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/products
```

## 8. Authentication

The starter uses Supabase Auth.

Login:

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "admin@example.com",
  "password": "<your-admin-password>"
}
```

The response contains the Supabase session.

For protected endpoints send:

```http
Authorization: Bearer <access_token>
```

Current protected example:

```http
GET /api/auth/me
```

## 9. Admin authorization

Set the user's profile role to:

```text
admin
```

or:

```text
super_admin
```

The `requireAdmin` middleware checks the profile before privileged operations.

## 10. Logging

Logs go to stdout/stderr through Pino.

Development:

```env
LOG_LEVEL=debug
```

Production:

```env
LOG_LEVEL=info
```

Do not create persistent log files on Railway.

Railway should collect the structured logs.

## 11. Important security rules

- Never expose `SUPABASE_SECRET_KEY`.
- Never put the secret key in a `VITE_*` variable.
- Never log tokens or passwords.
- Keep RLS enabled.
- Validate all external input.
- Use `requireAuth` and `requireAdmin` for admin APIs.
- Use the admin Supabase client only from trusted server code.

## 12. Next modules to implement

Recommended order:

1. Products CRUD
2. Product image upload/delete
3. Categories/catalog
4. Customers
5. Orders
6. Inventory
7. Coupons
8. Razorpay/payment webhook
9. Delivery pincodes
10. Admin dashboard APIs

For order creation involving multiple related records and stock updates, use a PostgreSQL function/RPC when atomicity is required.

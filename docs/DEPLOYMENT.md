# AVEX CRM — Deployment & Environment Configuration Guide

This guide provides comprehensive instructions for running PostgreSQL locally using Docker Compose, as well as configuring and deploying AVEX CRM to Vercel in production.

---

## 1. Local Development PostgreSQL (Docker Compose)

AVEX CRM includes a lightweight, isolated PostgreSQL 16 Alpine container configuration for local development.

> [!NOTE]
> Docker is used **exclusively for local database hosting**. The Next.js application runs directly on your host machine via `npm run dev`. Vercel does not use Dockerfiles.

### Local PostgreSQL Commands

```bash
# 1. Start PostgreSQL container in background (detached)
docker compose up -d

# 2. Verify container status and healthcheck
docker compose ps

# 3. Apply Prisma database migrations to local PostgreSQL instance
npx prisma migrate dev --schema=packages/database/prisma/schema.prisma

# 4. (Optional) Seed initial database demo records
npx prisma db seed --schema=packages/database/prisma/schema.prisma

# 5. Open Prisma Studio GUI
npx prisma studio --schema=packages/database/prisma/schema.prisma
```

### Stopping the Container

```bash
# Stop containers while PRESERVING database data (named volume is retained)
docker compose down

# Stop containers and DESTROY local database volume (DATA-DESTRUCTIVE)
docker compose down -v
```

> [!WARNING]
> Running `docker compose down -v` deletes the `postgres_data` volume and all local records. Use standard `docker compose down` unless you explicitly want to reset your local database.

---

## 2. Vercel Production Deployment Configuration

### Build Command & Script
AVEX CRM uses a Turborepo pipeline with a dedicated `vercel-build` script:
- **Build Command**: `npm run vercel-build` (or Vercel default executing root `package.json`)
- **What it executes**:
  1. `packages/database`: Generates the Prisma Client (`prisma generate`) and deploys pending migrations (`prisma migrate deploy`).
  2. `apps/web`: Generates web Prisma Client, applies migrations, and executes `next build`.

### Vercel Cron Jobs (`vercel.json`)
AVEX CRM automatically triggers recurring invoice generation through Vercel Crons:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/invoices/recurring/process-jobs",
      "schedule": "0 0 * * *"
    }
  ]
}
```
- **Schedule**: `0 0 * * *` (Runs once daily at midnight UTC).
- **Endpoint**: `POST /api/invoices/recurring/process-jobs`.

---

## 3. Environment Variables Reference Matrix

Configure these variables in your Vercel Project Settings under **Settings > Environment Variables**.

| Variable Name | Environments | Description | Example / Format |
|---|---|---|---|
| `DATABASE_URL` | Production, Preview, Development | **Runtime pooled** PostgreSQL connection string (via Supabase Connection Pooler / PgBouncer on port 6543 or 5432). | `postgres://[user]:[pwd]@[host]:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Production, Preview, Development | **Direct non-pooled** PostgreSQL connection string for Prisma migrations (`prisma migrate deploy` on port 5432). | `postgres://[user]:[pwd]@[host]:5432/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development | Supabase Project API URL. Publicly accessible in browser. | `https://[project-ref].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development | Supabase Anonymous Client Key. | `eyJhbGciOi...` |
| `JWT_SECRET` | Production, Preview, Development | Secret key used to sign and verify session tokens. **Must be >= 32 characters** in production. | High-entropy 32+ char string |
| `CRON_SECRET` | Production, Preview | Secret key provided in Authorization header by Vercel Cron job requests. | Secure random token |
| `RESEND_API_KEY` | Production, Preview, Development | API Key for transactional email delivery via Resend. | `re_xxxxxxxxxxxx` |
| `EMAIL_FROM` | Production, Preview, Development | Verified sender email address for outgoing system notifications. | `billing@yourdomain.com` |
| `GEMINI_API_KEY` | Production, Preview, Development | Google Gemini API Key for AI lead extraction & OCR parsing. | `AIzaSy...` |
| `OPENAI_API_KEY` | Optional | OpenAI API key (if `AI_PROVIDER=OPENAI`). | `sk-...` |
| `AI_PROVIDER` | Production, Preview, Development | Active AI engine provider (`GEMINI`, `OPENAI`, or `MOCK`). | `GEMINI` |
| `REDIS_URL` | Optional | Redis connection URL for asynchronous job queue & caching. | `redis://default:[pwd]@[host]:6379` |
| `WHATSAPP_ACCESS_TOKEN` | Optional | Meta Graph API WhatsApp Business bearer token. | `EAA...` |
| `WHATSAPP_PHONE_NUMBER_ID` | Optional | Meta WhatsApp Business phone number identifier. | `109238475...` |
| `NEXT_PUBLIC_APP_URL` | Production, Preview, Development | Base public URL of the application for email callback links. | `https://crm.yourcompany.com` |
| `NODE_ENV` | Production, Preview, Development | Node runtime environment mode (`production` on Vercel). | `production` |

---

## 4. Production Security & Pre-Launch Checklist

- [x] **No Secrets in Git**: `.env` and `.env.local` files are gitignored and never committed.
- [x] **JWT Secret Enforcement**: Application strictly validates that `JWT_SECRET` exists and is >= 32 characters when `NODE_ENV === 'production'`, failing loudly on startup if invalid.
- [x] **Database Health Monitoring**: `/api/health` reports status `unhealthy` if PostgreSQL is unreachable in production without mock fallback masking.
- [x] **Secure Cookie Flags**: Session cookies enforce `secure: true` and `httpOnly: true` under `NODE_ENV === 'production'`.
- [x] **Pooled vs Direct Connections**: Runtime database queries use connection pooling (`DATABASE_URL`), while schema migrations use direct connections (`DIRECT_URL`).

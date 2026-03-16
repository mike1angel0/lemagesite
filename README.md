# Selenarium

Personal creative portfolio and membership site for Mihai Gavrilescu — poetry, photography, music, research, and essays. Built with Next.js 16, PostgreSQL, and Stripe.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL (Supabase) + Prisma ORM
- **Auth:** Auth.js v5 (Google OAuth + credentials)
- **Payments:** Stripe (subscriptions) + Patreon (webhooks)
- **Media:** Cloudinary
- **Email:** Resend
- **i18n:** next-intl (Romanian default + English)

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- A Stripe account (for payments)
- A Cloudinary account (for media uploads)
- A Resend account (for transactional email)
- Google OAuth credentials (for social login)

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables and fill in your values
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed

# Generate Prisma client
npx prisma generate

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests (Vitest, watch mode) |
| `npm run test:run` | Run unit tests once |
| `npx playwright test` | Run E2E tests |

## Project Structure

```
src/
  app/
    [locale]/(public)/   # Public pages (poetry, photography, etc.)
    [locale]/(admin)/    # Admin dashboard
    api/                 # API routes (contact, newsletter, upload, webhooks)
  components/
    ui/                  # Reusable UI components
    content/             # Content display components
    layout/              # Nav, footer, sidebar
  lib/
    actions/             # Server actions (auth, content, orders, etc.)
    auth.ts              # NextAuth configuration
    prisma.ts            # Prisma client singleton
    access.ts            # Tier-based access control
    stripe.ts            # Stripe client
    seo/                 # Metadata and JSON-LD generators
  messages/              # i18n translation files (en.json, ro.json)
  types/                 # TypeScript declarations
prisma/
  schema.prisma          # Database schema
  migrations/            # Migration history
  seed.ts                # Database seeder
tests/                   # Playwright E2E tests
```

## Membership Tiers

| Tier | Access |
|------|--------|
| Free | Selected poems, research abstracts, newsletter |
| Supporter ($5/mo) | Full poems, essays, selected photography |
| Patron ($15/mo) | + Full research, deep dives, early access, 10% shop discount |
| Inner Circle ($25+/mo) | + Drafts, quarterly sessions, early book access |

## Environment Variables

See [`.env.example`](.env.example) for all required variables.

## Deployment

Deploy to [Vercel](https://vercel.com) with the Next.js preset. Set all environment variables in the Vercel dashboard. Configure webhook endpoints for Stripe (`/api/stripe/webhook`) and Patreon (`/api/patreon/webhook`).

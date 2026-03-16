# Selenarium - Project Guide

## Overview
Personal creative portfolio + membership site. Next.js 16 App Router, PostgreSQL/Prisma, Stripe payments, Patreon integration, i18n (Romanian default + English).

## Commands
- `npm run dev` — dev server
- `npm run build` — production build
- `npm run test:run` — unit tests (Vitest)
- `npx playwright test` — E2E tests
- `npx prisma migrate dev` — run migrations
- `npx prisma generate` — regenerate Prisma client after schema changes

## Architecture
- **App Router** with `[locale]` dynamic segment for i18n
- **Public pages** under `src/app/[locale]/(public)/`
- **Admin pages** under `src/app/[locale]/(admin)/`
- **API routes** under `src/app/api/`
- **Server actions** in `src/lib/actions/` — used for form submissions (auth, content CRUD, etc.)
- **Prisma client** singleton in `src/lib/prisma.ts` — bump `PRISMA_VERSION` constant after schema changes

## Key Patterns
- **Access control:** `hasAccess(userTier, contentTier)` in `src/lib/access.ts` — tier hierarchy: FREE < SUPPORTER < PATRON < INNER_CIRCLE
- **Auth:** NextAuth v5 with JWT strategy. Session augmented with `role`, `tier`, `membershipStatus` (see `src/types/next-auth.d.ts`)
- **Admin guard:** Check `session.user.role === "ADMIN"` in API routes and server actions
- **Resend:** Instantiate lazily inside handlers (`new Resend(process.env.RESEND_API_KEY)`), NOT at module level — module-level init breaks the build when env vars are missing
- **Translations:** `src/messages/en.json` and `src/messages/ro.json` — always update both when adding new keys
- **Components:** UI primitives in `src/components/ui/`, content displays in `src/components/content/`, layout in `src/components/layout/`

## Testing
- **Unit tests (Vitest):** `src/**/__tests__/*.test.ts` — mock external deps (Resend, Prisma, Cloudinary) with `vi.mock()`
- **E2E tests (Playwright):** `tests/*.spec.ts` — run against dev server on port 3001
- Vitest is configured to exclude `tests/` dir (Playwright files)

## Database
- Schema in `prisma/schema.prisma`
- After modifying schema: `npx prisma migrate dev --name <description>` then `npx prisma generate`
- Generated client goes to `src/generated/prisma/`

## Environment Variables
See `.env.example` for all required vars. Key ones:
- `DATABASE_URL` — PostgreSQL connection string
- `RESEND_API_KEY` — for contact form, newsletter, auth emails
- `STRIPE_*` — payments and subscriptions
- `PATREON_WEBHOOK_SECRET` — webhook signature verification

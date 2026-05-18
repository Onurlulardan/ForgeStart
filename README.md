<p align="center">
  <img src="public/brand/forgestart-logo.svg" alt="ForgeStart" width="360" />
</p>

# ForgeStart

ForgeStart is an open-source SaaS starter template built from the architectural patterns used while developing [ForgeCRUD](https://forgecrud.io/).

It is not a finished product. Treat it as a starting point for specialized operational software — stock tracking apps, B2B CRMs, internal admin consoles, or any custom SaaS that benefits from authentication, RBAC, organizations, audit trails, and an admin shell from day one.

This repository exists primarily to share and document those patterns in the open. If you need the full commercial product, see [ForgeCRUD](https://forgecrud.io/).

![ForgeStart product preview](public/readme/forgestart-home.png)

## Quick Start

```bash
git clone https://github.com/Onurlulardan/ForgeStart.git
cd ForgeStart
corepack enable
yarn install
yarn setup        # generates .env, AUTH_SECRET, and a random admin password
yarn dev:docker   # Postgres in Docker, Next.js + Realtime on host
```

Pick the run mode that fits you:

- `yarn dev:docker` — Postgres in Docker, app on host (recommended).
- `yarn dev` — full local, you bring your own Postgres and set `DATABASE_URL`.
- `yarn docker:up` — full Docker stack (Postgres + app + realtime in containers).

After the app is ready, optionally enrich the database with demo content:

```bash
yarn db:seed:demo
```

`yarn setup` prints a generated super admin password once. Save it. To regenerate, run `yarn setup --force`.

## Make It Yours

Once the app is running, log in as the super admin and adapt the starter to your project. The most common customization points:

**Branding** — App name and defaults live in [`lib/branding/constants.ts`](lib/branding/constants.ts); logo assets in [`public/brand/`](public/brand). After first boot you can also override branding at runtime from **System Settings → Branding** in the admin UI.

**Translations** — User-facing strings live in [`messages/en.json`](messages/en.json) and [`messages/tr.json`](messages/tr.json). Add a new locale by dropping `messages/<code>.json` and extending the `locales` array in [`i18n/routing.ts`](i18n/routing.ts). Avoid hardcoded JSX text — use `useTranslations` (client) or `getTranslations` (server).

**Database & domain model** — Each table lives in its own file under [`db/schema/`](db/schema). To add a new entity (say, `products`), drop in [`db/schema/products.ts`](db/schema), re-export it from [`db/schema/index.ts`](db/schema/index.ts), add any cross-table relations to [`db/schema/relations.ts`](db/schema/relations.ts), then run `yarn db:generate` to produce a Drizzle migration. Seed data (RBAC defaults, super admin, app settings) lives in [`db/seed.ts`](db/seed.ts) and is idempotent. To wipe everything locally and start fresh: `yarn db:reset`.

**RBAC (permissions)** — Declare new resources and actions in [`db/seed.ts`](db/seed.ts) (`DEFAULT_RESOURCES`, `DEFAULT_ACTIONS`). Protect server routes with `requireApiPermission('resource', 'action')` from [`lib/auth/server-permissions.ts`](lib/auth/server-permissions.ts). Protect UI with `usePermission` or the wrappers under [`components/permission/`](components/permission). The seed includes an `ALL` resource with `*` action for super admin access — keep it.

**Pages & API routes** — The protected app shell lives under [`app/(protected)/`](app/%28protected%29); add new admin pages there. New API endpoints go under [`app/api/`](app/api). Before creating new primitives, reuse what already exists: [`components/ui/`](components/ui), [`components/data-grid/`](components/data-grid), [`components/uploads/`](components/uploads), [`components/app/`](components/app).

**Theme** — Token defaults are in [`lib/theme/`](lib/theme); end users can tune runtime tokens from **System Settings → Theme** without redeploying.

**Email** — Default driver is `console` (logs each email to stdout — useful in dev). Switch to a real provider in `.env`: `EMAIL_PROVIDER=resend` + `RESEND_API_KEY`, or `EMAIL_PROVIDER=smtp` + `SMTP_HOST/USER/PASSWORD`. Templates live in [`lib/email/templates/`](lib/email/templates).

**Uploads / Storage** — Default driver is local disk (`./public/uploads`). For S3-compatible storage set `STORAGE_DRIVER=s3` and the `STORAGE_S3_*` vars. For local S3 testing without AWS, start MinIO: `docker compose --profile storage up`.

**Deploy** — `yarn docker:up:prod` runs the production profile against the multi-stage [`Dockerfile`](Dockerfile) (no host volumes, no dev server). The same image works on any container platform — set required env via your platform's secret manager and the `env.ts` zod schema will fail fast if anything required is missing.

**Verify** — `yarn doctor` checks required env and DB connectivity. `yarn verify` runs lint + typecheck + tests + build before you push.

For deeper architectural conventions (auth flow, audit logging, server vs client patterns), see [AGENTS.md](AGENTS.md).

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Auth.js v5
- PostgreSQL
- Drizzle ORM and Drizzle Kit
- shadcn/ui, Base UI primitives, Tailwind CSS 4
- next-intl with Turkish and English messages
- Docker Compose
- Yarn 4
- Vitest and Playwright

## What Is Included

- Admin dashboard and protected app shell
- User, role, permission and organization management
- RBAC with resource and action grants
- Invitations, email verification and password reset flows
- API keys for service integrations
- System settings stored in PostgreSQL
- Upload components with local and S3-ready storage support
- Application branding with default ForgeStart logo
- Theme customization and persisted theme tokens
- Security logs and audit logs
- Setup doctor, health and version endpoints

![ForgeStart admin console](public/readme/forgestart-showcase.png)

## Environment

Run `yarn setup` to create `.env` with a generated `AUTH_SECRET` and admin password. Otherwise copy `.env.example` to `.env` manually.

Required values (only these need to be set for local dev):

```env
AUTH_SECRET=<32+ char random string>
AUTH_URL=http://localhost:3000
DATABASE_URL=postgres://forgestart:forgestart@localhost:5432/forgestart
SUPER_ADMIN_EMAIL=superadmin@example.com
SUPER_ADMIN_PASSWORD=<choose-something>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

All other variables (S3 storage, Resend/SMTP email, Upstash rate-limit, realtime, observability) are optional and ship with safe defaults — see `.env.example` for the full list with descriptions.

Env vars are validated at boot through `env.ts` (zod). Missing or invalid required values fail fast with a clear message.

Inside Docker, the app container reaches the database at `postgres:5432` (hardcoded in `compose.yaml`); on the host the same database is reached via `localhost:5432`. You no longer need to set a separate `DOCKER_DATABASE_URL` — Compose builds the internal URL from `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB`.

## Commands

```bash
yarn setup            # Create .env, generate AUTH_SECRET and admin password
yarn dev              # Start Next.js + Realtime locally (BYO Postgres)
yarn dev:docker       # Postgres in Docker, Next.js + Realtime on host (recommended)
yarn build            # Production build
yarn start            # Start production build
yarn lint             # ESLint
yarn typecheck        # TypeScript check
yarn test             # Unit and component tests
yarn test:e2e         # Playwright tests
yarn verify           # lint + typecheck + test + build
yarn doctor           # Local setup checks
```

Database:

```bash
yarn db:generate      # Generate Drizzle migration
yarn db:migrate       # Apply migrations
yarn db:seed          # Seed base data
yarn db:seed:demo     # Add demo data
yarn db:reset         # Drop schemas, migrate and seed
yarn db:studio        # Open Drizzle Studio
```

Docker (full stack in containers):

```bash
yarn docker:up        # Run full dev profile in Docker
yarn docker:up:prod   # Run production-like profile
yarn docker:down      # Stop Compose services
yarn docker:down:volumes # Stop services and remove volumes
```

## Project Structure

```text
app/                  Next.js pages, layouts, route handlers and server actions
components/           App-level reusable components
db/                   Drizzle connection helpers, migration runner and seeds
db/schema/            One file per table; barrel re-export in index.ts
drizzle/              Generated SQL migrations
i18n/                 next-intl routing and request config
lib/                  Auth, API, branding, storage, theme, validation and system helpers
messages/             English and Turkish translation files
public/brand/         ForgeStart brand assets
scripts/              Local development, Docker and doctor scripts
server/               Realtime server
tests/                Playwright and test setup
```

## Notes

- Drizzle is the only database layer. Knex was removed in v2.
- Yarn 4 is the only supported package manager.
- The default app name is `ForgeStart`.
- User-facing text should live in `messages/en.json` and `messages/tr.json`.
- Branding defaults live in `lib/branding/constants.ts` and can be changed from System settings.
- Before opening a PR, run `yarn verify`. For database changes, also run `yarn db:reset`.

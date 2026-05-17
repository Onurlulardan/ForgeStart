# NextJS Starter

Modern full-stack starter template built with Next.js 16, React 19, Auth.js v5,
Drizzle ORM, PostgreSQL, Ant Design 6, Docker, Yarn 4, TypeScript, Vitest and
Playwright.

The intended developer experience is simple:

```bash
git clone <repo-url>
cd nextjstemplate
corepack enable
yarn install
cp .env.example .env
docker compose --profile dev up --build
```

The dev profile starts PostgreSQL, applies Drizzle migrations, seeds demo data,
and starts the Next.js app at `http://localhost:3000`.

## Stack

- Framework: Next.js 16 App Router
- Runtime: React 19
- UI: Ant Design 6
- Auth: Auth.js v5 with credentials provider
- Database: PostgreSQL
- ORM and migrations: Drizzle ORM / Drizzle Kit
- Package manager: Yarn 4 with `nodeLinker: node-modules`
- Tests: Vitest, React Testing Library, Playwright
- Tooling: ESLint flat config, Prettier, strict TypeScript

## Environment

Create `.env` from `.env.example` and change secrets before sharing or deploying.

Required values:

```env
AUTH_URL=http://localhost:3000
AUTH_SECRET=replace-with-a-random-secret-at-least-32-characters
DATABASE_URL=postgres://nextstarter:nextstarter@localhost:5432/nextstarter
SUPER_ADMIN_EMAIL=superadmin@example.com
SUPER_ADMIN_PASSWORD=change-this-password
```

Production deployments must set a strong `AUTH_SECRET` and a non-default
`SUPER_ADMIN_PASSWORD`.

## Commands

```bash
yarn dev              # Start Next.js locally
yarn build            # Production build
yarn start            # Start production build
yarn lint             # ESLint
yarn typecheck        # TypeScript
yarn format           # Prettier write
yarn format:check     # Prettier check
yarn test             # Unit/component tests
yarn test:e2e         # Playwright smoke tests
yarn verify           # lint + typecheck + test + build
```

Docker shortcuts:

```bash
yarn docker:up        # Start dev profile
yarn docker:up:build  # Build and start dev profile
yarn docker:up:prod   # Build and start production-like profile
yarn docker:down      # Stop compose project and remove orphan containers
yarn docker:down:volumes # Stop compose project and remove volumes
yarn docker:build     # Build dev images
yarn docker:build:prod # Build production image
yarn docker:migrate   # Run migration container once
yarn docker:seed      # Run seed container once
yarn docker:logs      # Follow dev profile logs
yarn docker:ps        # Show dev profile containers
```

## Database

Drizzle is the only database layer. Knex was removed in v2.

```bash
yarn db:generate      # Generate a migration from db/schema.ts
yarn db:migrate       # Apply migrations from ./drizzle
yarn db:seed          # Seed roles, resources, actions, super admin
yarn db:reset         # Drop public schema, migrate, seed
yarn db:studio        # Open Drizzle Studio
```

The source of truth is `db/schema.ts`. Generated SQL migrations live in
`drizzle/` and are committed.

## Docker

Development:

```bash
yarn docker:up:build
```

Production-like local run:

```bash
yarn docker:up:prod
```

Optional seed-only run:

```bash
yarn docker:seed
```

Services:

- `postgres`: PostgreSQL 17 with healthcheck
- `migrate`: applies Drizzle migrations
- `seed`: seeds dev/demo data
- `app`: hot-reload dev server
- `app-prod`: production image using `next start`

## Project Structure

```text
app/                  Next.js routes, pages and API handlers
auth.ts               Auth.js v5 configuration
db/                   Drizzle schema, connection, migrations runner, seed
drizzle/              Generated SQL migrations
lib/api/              Route helpers and admin query mappers
lib/auth/             Permission checks and session payload helpers
lib/validation/       Zod request validation
core/                 Shared UI components and layout
tests/e2e/            Playwright smoke tests
```

## Authentication and Authorization

Auth.js v5 runs with JWT sessions. The credentials provider reads users from
PostgreSQL through Drizzle and enriches the session with direct, role-based and
organization-based permissions.

API routes use `requireApiPermission`, which returns JSON `401` or `403`
responses instead of redirecting. Client components use `usePermission` against
the same permission model.

## v1 to v2 Notes

This is a breaking release.

- Knex, `knexfile.cjs`, destructive `setdb.ts`, and the custom Knex Auth adapter
  were removed.
- The database schema now uses snake_case PostgreSQL table and column names.
- Existing v1 databases are not automatically migrated. Start v2 with a fresh
  database, or write a one-off data migration for your production data.
- npm lockfiles are not supported. Use Yarn 4 only.
- `middleware.ts` moved to the Next.js 16 `proxy.ts` convention.
- Ant Design v6 no longer needs the React 19 v5 patch package.

## Quality Gate

Before opening a PR:

```bash
yarn verify
docker compose --profile dev up --build
```

For database changes, also run:

```bash
yarn db:reset
```

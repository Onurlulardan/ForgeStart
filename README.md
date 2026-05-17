<p align="center">
  <img src="public/brand/forgestart-logo.svg" alt="ForgeStart" width="360" />
</p>

# ForgeStart

Production-ready full-stack starter template built with Next.js 16, React 19, Auth.js v5,
Drizzle ORM, PostgreSQL, shadcn/ui, Tailwind CSS 4, Docker, Yarn 4, TypeScript,
Vitest and Playwright.

The intended developer experience is simple:

```bash
git clone <repo-url>
cd ForgeStart
corepack enable
yarn install
cp .env.example .env
yarn docker dev
```

The hybrid dev command starts PostgreSQL in Docker, applies Drizzle migrations,
seeds base data, and then starts the Next.js app on the host with `yarn dev` so
hot reload stays fast.

## Stack

- Framework: Next.js 16 App Router
- Runtime: React 19
- UI: shadcn/ui, Base UI primitives, Lucide icons, Tailwind CSS 4
- Auth: Auth.js v5 with credentials provider
- Database: PostgreSQL
- ORM and migrations: Drizzle ORM / Drizzle Kit
- Package manager: Yarn 4 with `nodeLinker: node-modules`
- Tests: Vitest, React Testing Library, Playwright
- Tooling: ESLint flat config, Prettier, strict TypeScript

## Product Modules

- Admin shell with shadcn/ui and responsive data tables
- User, role, permission and organization administration
- RBAC matrix for role/resource/action grants
- Invitations, invite acceptance and password reset flows
- API keys for service-account style integration credentials
- System center with setup doctor, health, version and migration status
- Application settings backed by PostgreSQL
- Security logs and operational audit logs
- Demo seed mode for realistic local data

## Environment

Create `.env` from `.env.example` and change secrets before sharing or deploying.

Required values:

```env
AUTH_URL=http://localhost:3000
AUTH_SECRET=replace-with-a-random-secret-at-least-32-characters
DATABASE_URL=postgres://forgestart:forgestart@localhost:5432/forgestart
DOCKER_DATABASE_URL=postgres://forgestart:forgestart@postgres:5432/forgestart
SUPER_ADMIN_EMAIL=superadmin@example.com
SUPER_ADMIN_PASSWORD=change-this-password
```

Production deployments must set a strong `AUTH_SECRET` and a non-default
`SUPER_ADMIN_PASSWORD`.

`DATABASE_URL` is for commands running on the host machine. Docker services use
`DOCKER_DATABASE_URL`, where the database host must be the Compose service name
`postgres`, not `localhost`.

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
yarn doctor           # Local setup doctor
yarn docker dev       # Docker PostgreSQL + migrate/seed + local yarn dev
```

Docker shortcuts:

```bash
yarn docker:dev       # Same as yarn docker dev
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
yarn db:seed:demo     # Add demo organizations, users and log data
yarn db:reset         # Drop public schema, migrate, seed
yarn db:studio        # Open Drizzle Studio
```

The source of truth is `db/schema.ts`. Generated SQL migrations live in
`drizzle/` and are committed.

## Docker

Development:

```bash
yarn docker dev
```

This is the preferred local development mode on Windows/macOS: PostgreSQL runs
in Compose, while Next.js runs on the host through `yarn dev` for native hot
reload. The full Docker dev profile remains available through
`yarn docker:up:build` when you explicitly want the app container too.

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
lib/system/           Health and migration status helpers
lib/validation/       Zod request validation
scripts/              Local setup helper scripts
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

Playwright uses `tests/e2e/auth.setup.ts` to create a reusable authenticated
browser state under `playwright/.auth/`, which is ignored by Git because it
contains session cookies.

## Operations

Health endpoints:

```text
GET /api/health
GET /api/version
GET /api/setup/doctor
```

Admin modules:

```text
/administrations/system
/administrations/rbac
/administrations/invitations
/administrations/api-keys
/administrations/audit-logs
```

`instrumentation.ts` registers a lightweight startup event and leaves the
project ready for OpenTelemetry wiring.

## v1 to v2 Notes

This is a breaking release.

- Knex, `knexfile.cjs`, destructive `setdb.ts`, and the custom Knex Auth adapter
  were removed.
- The database schema now uses snake_case PostgreSQL table and column names.
- Existing v1 databases are not automatically migrated. Start v2 with a fresh
  database, or write a one-off data migration for your production data.
- npm lockfiles are not supported. Use Yarn 4 only.
- `middleware.ts` moved to the Next.js 16 `proxy.ts` convention.
- Ant Design was removed in favor of source-owned shadcn/ui components.

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

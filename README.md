<p align="center">
  <img src="public/brand/forgestart-logo.svg" alt="ForgeStart" width="360" />
</p>

# ForgeStart

ForgeStart is a production-ready Next.js starter for admin-heavy SaaS products. It ships with authentication, RBAC, organizations, invitations, API keys, audit logs, uploads, theming, i18n, Docker, PostgreSQL, Drizzle ORM, and a ready admin shell.

## Quick Start

```bash
git clone <repo-url>
cd ForgeStart
corepack enable
yarn install
cp .env.example .env
yarn docker dev
```

`yarn docker dev` starts PostgreSQL in Docker, runs Drizzle migrations, seeds the database, and starts Next.js locally with hot reload.

Default local login:

```text
Email: superadmin@example.com
Password: change-this-password
```

Change these values in `.env` before sharing or deploying the app.

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

## Environment

Create `.env` from `.env.example`.

Important values:

```env
AUTH_URL=http://localhost:3000
AUTH_SECRET=replace-with-a-random-secret-at-least-32-characters
DATABASE_URL=postgres://forgestart:forgestart@localhost:5432/forgestart
DOCKER_DATABASE_URL=postgres://forgestart:forgestart@postgres:5432/forgestart
SUPER_ADMIN_EMAIL=superadmin@example.com
SUPER_ADMIN_PASSWORD=change-this-password
```

Use `DATABASE_URL` for commands running on the host machine. Docker services use `DOCKER_DATABASE_URL`, where the database host is `postgres`.

## Commands

```bash
yarn dev              # Start Next.js locally
yarn docker dev       # Preferred local setup: Docker DB plus local Next.js
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

Docker:

```bash
yarn docker:dev       # Same as yarn docker dev
yarn docker:up        # Run full dev profile in Docker
yarn docker:up:prod   # Run production-like profile
yarn docker:down      # Stop Compose services
yarn docker:down:volumes # Stop services and remove volumes
```

## Project Structure

```text
app/                  Next.js pages, layouts, route handlers and server actions
components/           App-level reusable components
core/                 Shared layout and legacy-compatible shell pieces
db/                   Drizzle schema, node connection, migrations runner and seeds
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

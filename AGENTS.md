# AGENTS.md

This file guides AI agents working on ForgeStart. Read it before making code changes.

## Project Identity

ForgeStart is an open source, production-ready Next.js starter for SaaS and internal admin products. It is not a landing-page template. Treat it as a clone-and-run application foundation with real authentication, RBAC, organizations, uploads, settings, audit trails, Docker workflows, and operational checks.

The public project name is `ForgeStart`. Avoid reintroducing older names such as `Next Starter`, `Next Starter V2`, `nextjsstarter`, or `nextjstemplate` in user-facing code, docs, package metadata, seed data, UI labels, or generated assets.

## Current Stack

- Next.js 16 App Router with React 19.
- TypeScript with strict project-wide checking.
- Auth.js v5 with JWT sessions.
- PostgreSQL as the only supported database.
- Drizzle ORM and Drizzle Kit as the only database layer.
- shadcn/ui, Base UI primitives, Lucide icons and Tailwind CSS 4 for UI.
- next-intl for localization with `tr` and `en`.
- Yarn 4 with `nodeLinker: node-modules`.
- Docker Compose for PostgreSQL, migration, seed, realtime, storage and production-like app runs.
- Vitest, React Testing Library and Playwright for verification.

## Architecture Map

Important folders:

```text
app/                  Next.js routes, pages, layouts, APIs and server actions
components/           App-level components owned by this starter
components/ui/        shadcn-style primitives
core/                 Shared layout shell and compatibility components
db/                   Drizzle schema, connection helpers, migration runner and seeds
drizzle/              Generated SQL migrations committed to source control
i18n/                 next-intl routing and request config
lib/api/              API helpers and route response utilities
lib/api/client/       Client-side API wrappers
lib/auth/             Permission checks, session enrichment and server auth helpers
lib/branding/         Default and database-backed branding helpers
lib/query/            TanStack Query keys and hooks
lib/storage/          Upload validation, storage providers and upload service
lib/system/           Health, setup doctor, version and migration helpers
lib/theme/            Theme presets, tokens and application
lib/validation/       Zod schemas
messages/             Locale JSON files
public/brand/         Default ForgeStart logo assets
scripts/              Local and Docker workflow scripts
server/               Realtime Socket.IO server
tests/e2e/            Playwright smoke and auth setup
```

Important entry points:

- `app/layout.tsx` loads locale messages and system theme.
- `app/(protected)/layout.tsx` defines the authenticated shell.
- `auth.ts` defines Auth.js behavior.
- `proxy.ts` is the Next.js 16 middleware replacement.
- `db/schema.ts` is the database source of truth.
- `db/seed.ts` owns base RBAC, settings and super admin data.
- `db/reset.ts` drops both `public` and `drizzle` schemas, migrates and seeds.
- `scripts/docker-dev.mjs` powers `yarn dev:docker`.
- `env.ts` is the single zod-validated source of truth for environment variables; modules import `env` from it instead of reading `process.env` directly.

## Development Workflow

Prefer this setup for local development:

```bash
corepack enable
yarn install
yarn setup
yarn dev:docker
```

`yarn setup` creates `.env` from `.env.example` and generates a 32+ char `AUTH_SECRET` and a random `SUPER_ADMIN_PASSWORD` (printed once). `yarn dev:docker` starts PostgreSQL through Docker Compose, waits for readiness, applies migrations, seeds the database, then runs `yarn dev` on the host machine (Next.js + Realtime via `concurrently`). Keep this behavior. It exists because running Next.js on the host gives better hot reload than the full app container on Windows and macOS.

Three named modes are supported. Do not introduce a fourth:

- `yarn dev` — saf local (developer brings own Postgres, sets `DATABASE_URL`).
- `yarn dev:docker` — hybrid (Postgres in Docker, app on host). Recommended.
- `yarn docker:up` — full Docker stack (everything in containers).

Use these verification commands:

```bash
yarn typecheck
yarn lint
yarn test
yarn build
```

For database changes, also run:

```bash
yarn db:reset
```

For broad changes, run:

```bash
yarn verify
```

Do not use npm or pnpm. Do not add `package-lock.json` or `pnpm-lock.yaml`.

## Database Rules

Drizzle is the only database abstraction. Do not add Knex, Prisma, raw migration frameworks, or a second ORM.

When changing database structure:

1. Update `db/schema.ts`.
2. Generate a migration with `yarn db:generate`.
3. Review the generated SQL in `drizzle/`.
4. Update seeds in `db/seed.ts` if the base system needs new data.
5. Run `yarn db:reset`.

`db:reset` must reset both the application schema and Drizzle's migration journal. If only `public` is dropped while `drizzle.__drizzle_migrations` remains, Drizzle can skip migration SQL and seed into missing tables.

Seed logic should be idempotent. Running `yarn db:seed` repeatedly must not duplicate users, resources, actions, settings or permissions.

## Auth And Authorization

Auth.js v5 uses JWT sessions. User permissions are enriched through `lib/auth/session-data.ts` and checked with the shared permission model.

Server API routes should use `requireApiPermission` from `lib/auth/server-permissions.ts`. Client UI should use `usePermission` or the permission wrapper components under `components/permission/`.

Permission semantics are resource and action based. The seed includes an `ALL` resource with `*` action for super admin access. Preserve that model unless the task explicitly changes RBAC.

## Branding Rules

The default brand is ForgeStart.

Branding defaults live in:

```text
lib/branding/constants.ts
public/brand/
```

Database-backed branding is loaded through the branding helpers and System settings. The logo setting should use the upload flow, not a plain URL-only field, because this starter already includes upload components.

If you touch brand text, search for stale strings:

```bash
rg -n "Next Starter|nextjsstarter|nextjstemplate|ForgeStarter"
```

Do not hardcode the app name in UI components when branding helpers are available.

## Localization Rules

User-facing strings should be localized through next-intl. The supported locale files are:

```text
messages/en.json
messages/tr.json
```

When adding a translation key, add it to both files. Avoid swallowing missing-message problems by adding broad fallback logic unless the value is truly dynamic data from the database.

Use `getTranslations` in server components and `useTranslations` in client components. Avoid static visible English or Turkish text inside JSX unless it is developer-only code.

## UI Rules

This project is an operational starter for admin products. Keep screens dense, practical and consistent. Avoid marketing-page patterns inside the app shell.

Use existing UI primitives from `components/ui/`, app components from `components/app/`, data grid components from `components/data-grid/`, and upload components from `components/uploads/` before creating new primitives.

Use Lucide icons for recognizable icon buttons. Keep controls accessible with labels, aria text, focus states and disabled states.

Do not add nested decorative cards or large hero sections to admin workflows. Keep admin screens optimized for scanning, filtering and repeated work.

## API And Data Fetching

Use existing API response helpers from `lib/api/` and validation schemas from `lib/validation/`.

Client API wrappers belong under `lib/api/client/`. Query keys and TanStack Query hooks belong under `lib/query/`.

For protected API routes:

1. Check permission with `requireApiPermission`.
2. Validate input with Zod.
3. Return structured JSON responses.
4. Log audit events for meaningful administrative changes.

## Upload And Storage Rules

The upload model is represented by `uploads` in `db/schema.ts`. Upload helpers live under `lib/storage/`, and UI components live under `components/uploads/`.

Prefer reusing `FileDropzone`, `AvatarUploader`, `UploadPreview` and `FileList` for file workflows. Do not create a second upload abstraction for settings or branding.

Local storage is the default. S3-compatible storage is supported by configuration and should remain optional.

## Realtime Server

The realtime server lives in `server/` and is separate from the Next.js runtime. Keep realtime-specific logic out of regular React components unless the component is explicitly consuming realtime state.

`yarn dev` (and therefore `yarn dev:docker`) already starts both Next.js and the realtime server via `concurrently`. There is no separate `yarn realtime:dev` script — if you need only the realtime process (e.g. inside a Docker container), use `yarn realtime:start`, which runs `tsx server/index.ts`.

## Documentation Rules

README is for humans evaluating or running the project. Keep it short, direct and current.

AGENTS.md is for AI agents and maintainers. Keep it detailed enough to prevent wrong architectural moves.

Do not document obsolete v1 behavior as an active path. If v1 is mentioned, describe it only as removed legacy context.

## Quality Bar

Before finishing a code change, run the narrowest meaningful checks. For most changes:

```bash
yarn typecheck
yarn lint
```

For logic changes:

```bash
yarn test
```

For database changes:

```bash
yarn db:reset
```

For frontend or route changes that affect runtime behavior:

```bash
yarn build
```

Report any command you could not run and why.

## Things To Avoid

- Do not reintroduce Knex.
- Do not add another package manager.
- Do not hardcode user-facing strings outside locale files.
- Do not bypass the existing permission helpers.
- Do not duplicate upload logic.
- Do not treat this as a landing-page template.
- Do not overwrite user changes or clean unrelated files.
- Do not commit generated noise unless it is required for the task.

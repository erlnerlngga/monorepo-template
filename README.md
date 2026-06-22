# Monorepo Template

pnpm workspace with:

- `apps/api`: Hono API on Node.js.
- `apps/platform`: React + Vite + TanStack Router file routes + TanStack Query.
- `apps/admin`: React + Vite + TanStack Router file routes + TanStack Query.
- `packages/api-client`: typed Hono RPC client shared by the frontend apps.
- `packages/config`: typed server-side environment config.
- `packages/i18n`: i18next setup shared by the frontend apps.
- `packages/logger`: Pino logger setup with OpenTelemetry-friendly trace fields.
- `packages/storage`: S3-compatible object storage primitives.
- `packages/telemetry`: OpenTelemetry Node SDK setup for API and worker services.
- `packages/ui`: shadcn UI components shared by the apps.
- `packages/worker`: Redis + BullMQ worker primitives.

Packages are source-only: they export their `.ts`/`.tsx` files directly and do not have a build step.

## Setup

```sh
pnpm install
cp .env.example .env
docker compose -f docker-compose.dev.yaml up -d
pnpm db:generate
pnpm db:migrate
```

## Development

```sh
pnpm --filter @repo/api dev
pnpm --filter @repo/platform dev
pnpm --filter @repo/admin dev
pnpm --filter @repo/worker dev
```

## Tests

```sh
pnpm test
```

This runs the base Vitest suites for API, Platform, Admin, and Worker.

## Auth and API Client

The API uses Better Auth for email/password auth, session cookies, and admin roles. Better Auth is mounted at `/api/auth/*`; custom API routes use Hono RPC types through `packages/api-client`.

Frontend apps should use:

- Better Auth client methods for sign-in, sign-up, and sign-out.
- `createApiClient()` from `@repo/api-client` for typed API routes such as `/session` and `/users`.

Configure auth with `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `CLIENT_ORIGINS` in `.env`.

Create or promote an admin user:

```sh
pnpm createsuperuser
```

## Storage

`packages/storage` exports S3-compatible helpers for AWS S3, MinIO, Cloudflare R2, DigitalOcean Spaces, and similar providers.

```ts
import { getStorageConfig } from "@repo/config";
import { createStorage } from "@repo/storage";

const storage = createStorage(getStorageConfig());

await storage.putObject({
  key: "uploads/example.txt",
  body: "hello",
  contentType: "text/plain",
});
```

Configure it with `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and optional endpoint/path-style/public URL variables in `.env`.

## Logging

`packages/logger` exports Pino helpers for structured JSON logs.

```ts
import { loggerConfig } from "@repo/config";
import { createLogger } from "@repo/logger";

const logger = createLogger({
  ...loggerConfig,
  service: "api",
});

logger.info({ userId: "user_123" }, "User signed in");
```

Trace-aware helpers use OpenTelemetry-compatible `trace_id`, `span_id`, and `trace_flags` fields. When telemetry is enabled, active span context is attached to Pino logs automatically.

## Telemetry

`packages/telemetry` starts the OpenTelemetry Node SDK before API and worker modules load, so auto-instrumentation can patch supported Node libraries.

Telemetry is disabled by default. For local span output:

```sh
ENABLE_TELEMETRY=true
TELEMETRY_EXPORTER=console
```

For an OTLP HTTP collector:

```sh
ENABLE_TELEMETRY=true
TELEMETRY_EXPORTER=otlp
TELEMETRY_EXPORTER_OTLP_ENDPOINT="https://collector.example.com/v1/traces"
TELEMETRY_API_KEY="..."
TELEMETRY_API_KEY_HEADER="authorization"
```

If `TELEMETRY_API_KEY_HEADER` is `authorization`, the exporter sends `Authorization: Bearer <key>`. Other header names send the raw key value, which fits providers that expect headers such as `x-honeycomb-team`.

## Docker

```sh
cp .env.example .env
docker compose up --build
```

This starts Postgres, Redis, API, Platform, Admin, and Worker. The Docker services still use the single root `.env`; `DOCKER_DATABASE_URL` and `DOCKER_REDIS_URL` point containers at the Compose service names. Postgres and Redis are internal-only in `docker-compose.yaml`; use `docker-compose.dev.yaml` when you want host access to those ports for local tooling.

The default local ports are:

- API: `http://localhost:8000`
- Platform: `http://localhost:3000`
- Admin: `http://localhost:4000`
- Postgres with `docker-compose.dev.yaml`: `localhost:15432`
- Redis with `docker-compose.dev.yaml`: `localhost:16379`

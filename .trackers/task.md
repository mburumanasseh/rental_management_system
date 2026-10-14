# Current Task

**Task name:** Foundation – Config, Database, Security & Health  
**Goal:** Establish production-grade foundational infrastructure so all subsequent feature modules can be built on a solid base.  
**Branch:** `feat/foundation-config-db-security` → PR into `dev`

## Approved Scope
- Global configuration with environment validation (Joi)
- PostgreSQL + TypeORM connection (async, env-driven)
- Global validation pipe (whitelist + transform)
- Helmet security headers
- Rate limiting (Throttler)
- Health check endpoints (`/health`, `/health/live`)
- `.env.example` with all required variables
- Clean module wiring in `AppModule`

## Completed Changes
- [x] `src/config/` – configuration factory + Joi validation schema + ConfigModule
- [x] `src/database/` – TypeOrmModule.forRootAsync
- [x] `src/health/` – Terminus health checks
- [x] Updated `main.ts` – Helmet, ValidationPipe, CORS, ConfigService
- [x] Updated `app.module.ts` – Config, Database, Health, ThrottlerGuard
- [x] `.env.example`
- [ ] Install required packages (in progress / to be verified)
- [ ] Open PR to `dev`

## Explicitly Out of Scope
- Auth implementation (JWT strategy, guards, etc.)
- Any domain entity or business logic
- M-Pesa integration
- Docker / CI

## Decisions Made
- TypeORM chosen over Prisma for native NestJS decorator support and mature ecosystem
- Joi for env validation (simple, battle-tested with NestJS Config)
- Global ThrottlerGuard applied by default
- `DB_SYNCHRONIZE` defaults to `false` (safe for production)
- Observe module left with placeholders (user can configure later)

## Risks
- Medium if database is not available at startup (TypeORM will fail to connect). Mitigated by health checks and clear env docs.
- JWT secrets are required by validation schema – app will refuse to start without them.

## Verification
- `npm install` of new packages succeeds
- Application boots with a valid `.env`
- `/health/live` returns 200
- `/health` reports database status
- Rate limiting active
- ValidationPipe rejects unknown properties

## Remaining Work (next tasks)
1. Auth module (JWT + Refresh + RBAC)
2. Core entities (User, Landlord, Tenant, Property, Unit, Lease …)
3. Subsequent domain modules

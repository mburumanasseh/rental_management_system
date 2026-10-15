# Production Readiness Checklist

## 1. Secrets & Environment

- [ ] Copy `.env.example` → `.env` (or use a secrets manager)
- [ ] Generate strong JWT secrets (≥ 32 chars): `openssl rand -base64 48`
- [ ] Set `ENCRYPTION_KEY` (exactly 32 bytes): `openssl rand -hex 16`
- [ ] Set `NODE_ENV=production`
- [ ] Set `DB_SYNCHRONIZE=false` (use migrations instead)
- [ ] Configure `CORS_ORIGIN` to your frontend domain(s)
- [ ] Configure M-Pesa production credentials and HTTPS callback URL
- [ ] Configure Africa's Talking / SMTP credentials

## 2. Database

- [ ] Use a managed PostgreSQL instance (or hardened self-hosted)
- [ ] Enable SSL for database connections in production
- [ ] Run migrations (do **not** rely on `synchronize`)
- [ ] Set up automated backups and point-in-time recovery
- [ ] Restrict DB network access (private subnet / firewall)

## 3. Application Security

- [x] Helmet security headers
- [x] Global ValidationPipe (whitelist + forbidNonWhitelisted)
- [x] Rate limiting (Throttler)
- [x] JWT + Refresh token rotation
- [x] Passwords hashed with bcrypt (cost 12)
- [x] Refresh tokens stored as hashes
- [ ] Attach `AuditInterceptor` on sensitive controllers
- [ ] Review role guards on every endpoint
- [ ] Enable HTTPS only (terminate TLS at load balancer / reverse proxy)
- [ ] Set `trust proxy` (already enabled in `main.ts`)

## 4. Deployment

- [ ] Build with the provided multi-stage `Dockerfile`
- [ ] Run as non-root user (Dockerfile already does this)
- [ ] Health checks: `/health/live` (liveness) and `/health` (readiness + DB)
- [ ] Use immutable image tags (Git SHA)
- [ ] Configure resource limits (CPU / memory)
- [ ] Set up log aggregation and alerting on 5xx / payment failures

## 5. M-Pesa / Payments

- [ ] Register production shortcode and callback URL with Safaricom
- [ ] Callback URL must be HTTPS and publicly reachable
- [ ] Consider IP allow-listing for Daraja callbacks
- [ ] Monitor reconciliation failures

## 6. Observability

- [ ] Replace Observe placeholder credentials or disable if unused
- [ ] Structured logging (JSON) in production
- [ ] Alert on payment webhook failures and high error rates

## 7. Go-live Smoke Test

1. Register / login
2. Create landlord → property → unit → lease → activate
3. Generate rent invoice
4. Initiate STK Push (sandbox first)
5. Verify payment reconciliation + receipt
6. Check `/reports/dashboard` and `/audit`
7. Confirm `/health` returns healthy

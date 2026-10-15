# Current Task

**Task name:** Security hardening & production readiness  
**Goal:** Make the system safer and deployable.  
**Branch:** `chore/production-readiness` → PR into `dev`

## Scope
- Hardened `main.ts` (trust proxy, production-safe Helmet, configurable CORS, optional API prefix)
- Expanded `.env.example` with production guidance
- Multi-stage production `Dockerfile` + `.dockerignore`
- `PRODUCTION.md` checklist
- Includes Audit + Reports + Notifications (from previous branch)

## Out of Scope
- Full TypeORM migrations setup (recommended next)
- Attaching AuditInterceptor globally (left opt-in)
- Real Nodemailer/SendGrid wiring

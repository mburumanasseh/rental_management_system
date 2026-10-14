# Current Task

**Task name:** Auth Module – JWT + Refresh Tokens + RBAC  
**Goal:** Implement secure authentication and authorization foundation for the Rental Management System.  
**Branch:** `feat/auth-module` → PR into `dev`

## Approved Scope
- User entity (UUID, email, phone, passwordHash, role, refreshTokenHash, timestamps)
- Role enum: admin, landlord, tenant, agent
- Register / Login / Refresh / Logout endpoints
- JWT access tokens + rotating refresh tokens
- JwtAuthGuard + RolesGuard
- @Roles() and @CurrentUser() decorators
- Password hashing with bcrypt (cost 12)
- Protected `/users/me` endpoint
- Proper NestJS module wiring

## Completed Changes
- [x] Role enum
- [x] User entity
- [x] RegisterDto, LoginDto, RefreshTokenDto, AuthResponseDto
- [x] JwtStrategy
- [x] JwtAuthGuard + RolesGuard
- [x] Roles + CurrentUser decorators
- [x] UsersService (create, find, refresh token handling)
- [x] AuthService (register, login, refresh, logout, token generation)
- [x] AuthController + UsersController
- [x] AuthModule + UsersModule updates
- [ ] Install @nestjs/jwt, passport, bcrypt packages
- [ ] Verify build
- [ ] Open PR to `dev`

## Explicitly Out of Scope
- Email verification / password reset flows
- 2FA
- Landlord / Tenant profile entities (next)
- Full RBAC resource-level ownership checks (will be added per domain)

## Decisions Made
- Access token short-lived (15m default), refresh token 7d
- Refresh tokens stored as bcrypt hashes in the database (not plaintext)
- Role is settable at registration (can be restricted later)
- Global ValidationPipe already enforces DTO rules

## Risks
- Database must be running and schema must exist (TypeORM synchronize is false by default – user may need to enable temporarily or run migrations)
- JWT secrets must be present in .env

## Verification
- `npm run build` succeeds
- Register → returns tokens
- Login → returns tokens
- Refresh works
- Logout invalidates refresh token
- `/users/me` requires valid access token

## Remaining Work
1. Landlord / Tenant profile entities & modules
2. Properties & Units
3. Leases, Invoices, Payments, etc.

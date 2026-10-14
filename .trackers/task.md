# Current Task

**Task name:** Landlords, Tenants, Properties & Units modules  
**Goal:** Implement the core domain profiles and property hierarchy.  
**Branch:** `feat/landlords-tenants-properties-units` → PR into `dev`  
**Depends on:** `feat/auth-module` (must be merged first or together)

## Scope
- Landlord entity + full CRUD (linked 1:1 to User)
- Tenant entity + full CRUD (linked 1:1 to User)
- Property entity + full CRUD (belongs to Landlord)
- Unit entity + full CRUD (belongs to Property, status: vacant/occupied/maintenance)
- Role-based access on all endpoints
- Proper TypeORM relations

## Completed
- [x] All entities, DTOs, services, controllers, modules
- [ ] Build verification
- [ ] Open PR

## Out of Scope
- Lease creation
- Invoice generation
- Ownership checks beyond role (fine-grained ownership will come later)

## Verification
- `npm run build` succeeds
- CRUD endpoints respond with proper auth/roles

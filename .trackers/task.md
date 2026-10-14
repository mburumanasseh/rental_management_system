# Current Task

**Task name:** Leases Module  
**Goal:** Implement full lease lifecycle management.  
**Branch:** `feat/leases-module` → PR into `dev`

## Scope
- Lease entity (unit, tenant, dates, rent, deposit, status, payment day)
- Statuses: draft → active → expired / terminated / renewed
- Create with overlap prevention
- Activate (marks unit occupied)
- Terminate (marks unit vacant + records reason)
- Full CRUD + filters by unit/tenant/status
- Role-based access

## Completed
- [x] Entity, DTOs, Service, Controller, Module
- [ ] Build verification
- [ ] Open PR

## Out of Scope
- Automatic invoice generation on activate (next module)
- Lease renewal flow (can be added later)

# Current Task

**Task name:** Audit Logging + Reports  
**Goal:** Immutable audit trail + key operational reports.  
**Branch:** `feat/audit-module` → PR into `dev`  
**Includes:** Notifications (dependency)

## Scope
### Audit
- AuditLog entity (user, action, resource, old/new values, IP, user-agent)
- AuditService + Admin-only endpoints
- AuditInterceptor for automatic logging of mutating requests

### Reports
- Occupancy summary
- Arrears summary
- Cash-flow summary
- Lease summary
- Combined dashboard endpoint

## Completed
- [x] Both modules implemented
- [ ] Build + PR

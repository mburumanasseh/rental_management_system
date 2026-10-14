# Current Task

**Task name:** Invoices Module  
**Goal:** Invoice generation and management linked to leases.  
**Branch:** `feat/invoices-module` → PR into `dev`

## Scope
- Invoice + InvoiceLineItem entities
- Types: rent, deposit, utility, penalty, other
- Statuses: pending, partially_paid, paid, overdue, cancelled
- Manual create + bulk generate rent invoices from active leases
- Mark overdue job endpoint
- Cancel + CRUD with guards against modifying paid invoices
- Auto invoice number generation (INV-YYYY-XXXXXX)

## Completed
- [x] Entities, DTOs, Service, Controller, Module
- [ ] Build + PR

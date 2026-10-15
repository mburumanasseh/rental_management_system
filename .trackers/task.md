# Current Task

**Task name:** Payments Module (M-Pesa + Reconciliation)  
**Goal:** Accept payments via M-Pesa STK Push / C2B and reconcile against invoices.  
**Branch:** `feat/payments-module` → PR into `dev`  
**Depends on:** Invoices module (PR #7)

## Scope
- Payment entity (invoice link, amount, method, status, M-Pesa fields)
- STK Push initiation
- STK + C2B callback handlers (public endpoints)
- Automatic reconciliation → updates invoice amountPaid + status
- Manual payment recording (cash/bank)
- Role-protected listing endpoints

## Completed
- [x] Entity, DTOs, MpesaService, PaymentsService, Controller, Module
- [ ] Build + PR

# Current Task

**Task name:** Notifications Module  
**Goal:** SMS + Email notification system with logging.  
**Branch:** `feat/notifications-module` → PR into `dev`

## Scope
- Notification entity (channel, type, status, recipient, body, metadata)
- SMS provider (Africa's Talking compatible, console fallback)
- Email provider (console / SMTP placeholder)
- Helper methods: sendPaymentReceived, sendPaymentReminder
- Admin endpoints to send and list notifications

## Completed
- [x] Entity, DTO, Providers, Service, Controller, Module
- [ ] Build + PR

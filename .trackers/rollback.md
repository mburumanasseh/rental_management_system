# Rollback Information

**Last updated:** 2026-10-14

## Previous Known-Good State
- **Branch:** `dev`
- **Commit:** `bab6762` – Merge of PR #1 (trackers + TestModule fix)

## How to Roll Back This Foundation Change
1. Revert the PR that introduces the foundation packages and modules, **or**
2. `git revert <merge-commit>` on `dev` after merge.

## Migration / Data Considerations
- No schema migrations yet (synchronize is off by default).
- Adding TypeORM does not touch existing data.

## Irreversible Operations
- None.

## Recovery Notes
- If the application fails to start because of missing JWT secrets, copy `.env.example` → `.env` and set proper secrets.
- Database connection failure is expected if PostgreSQL is not running; use `/health/live` for liveness without DB.

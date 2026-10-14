# Rollback Information

**Last updated:** 2026-10-14

## Previous Known-Good State
- **Branch:** `dev` (and `main`)
- **Commit:** `ed29d7e` – "chore: scaffold rental management system architecture"
- **Tag/Release:** none yet

## How to Roll Back This Change
1. Revert the PR that introduced `.trackers/` and the `app.module.ts` cleanup, **or**
2. `git checkout ed29d7e -- .` on a new branch and force the desired state (not recommended on shared branches)

## Migration / Data Considerations
- None. No database changes. Pure documentation + one import cleanup.

## Irreversible Operations
- None.

## Recovery Notes
- The `.trackers/` directory is part of the engineering process. If removed accidentally, re-create from the latest known good version on `dev` or from this file set.
- Application previously could not start cleanly because of the missing `TestModuleModule`. After this change it will start (with placeholder Observe credentials still present).

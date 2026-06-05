## Context

Documentation-only change. The root `README.md` is stock Astro-starter boilerplate; every other doc (`CLAUDE.md`, `openspec/config.yaml` context, `docs/design/README.md`) already describes the real project. No code, behavior, or specs change.

## Goals / Non-Goals

**Goals:**
- A `README.md` that accurately introduces openspec-ui, its purpose, setup (`PROJECTS_PATH`), commands, requirements, current feature status, and pointers to the deeper docs.
- The docs set is mutually consistent (README is the entry point; it links rather than duplicates).

**Non-Goals:**
- Application/behavior changes, new specs, screenshots, a published docs site, or rewriting `CLAUDE.md`'s substance.

## Decisions

### 1. README is the high-level entry point; deeper docs stay authoritative
The README gives the "what / why / how to run", then links to `CLAUDE.md` (architecture + contributor/agent guide) and `docs/design/` (design reference) instead of repeating them. **Why:** avoids the drift that produced this very change — one source per concern.

### 2. Describe the app by its current, true state
Document what ships today (project discovery, read-only change viewer) and what's planned (task write-back, comments) in a short status section, so the README doesn't over- or under-promise. **Why:** "for what it is" — honest to the current build.

### 3. Keep stack facts in one place
Requirements (Node ≥ 22.12, pnpm), commands, and `.env` (`PROJECTS_PATH`) live in the README's run section, matching `CLAUDE.md` and `openspec/config.yaml`; fix any drift found rather than restating.

## Risks / Trade-offs

- **Docs drifting again** → mitigate by linking, not duplicating; the README points to `CLAUDE.md`/`docs/design/` for depth.
- **Status section going stale** → keep it short and feature-level (shipped vs planned), easy to update per slice.

## Migration Plan

None — text files only. Rollback = revert the branch.

## Open Questions

- None. (Add a screenshot/GIF later if desired; out of scope here.)

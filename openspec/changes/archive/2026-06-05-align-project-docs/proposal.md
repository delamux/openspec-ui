## Why

The root `README.md` is still the stock **Astro "Minimal Starter Kit"** boilerplate — it describes a generic Astro template, not this project. Anyone landing on the repo has no idea what openspec-ui is, what it does, how to configure it (`PROJECTS_PATH`), or which features exist today. The other docs (`CLAUDE.md`, `openspec/config.yaml` context, `docs/design/`) already describe the real project, so the README is the one place that's out of sync. This change makes the README tell the truth and aligns the surrounding docs with it.

## What Changes

- **Rewrite `README.md`** to describe openspec-ui for what it is: a local-first Astro + React app that points at a folder of OpenSpec projects, discovers them, and renders a selected change's proposal / design / tasks in a shadcn-style three-tab UI.
  - One-paragraph "what it is", a short "how it works" flow (set `PROJECTS_PATH` → pick project → pick change → read), the real commands table, the `.env` (`PROJECTS_PATH`) setup, the requirements (Node ≥ 22.12, pnpm), and a brief architecture pointer (hexagonal + vertical slicing; details in `CLAUDE.md`).
  - A short **feature status** section: shipped (project discovery, read-only change viewer) vs planned (task write-back, comments).
  - Links to `CLAUDE.md` (contributor/agent guide) and `docs/design/` (design reference).
- **Align the surrounding docs** so they're mutually consistent and non-duplicative: confirm `CLAUDE.md`, `openspec/config.yaml` `context`, and `docs/design/README.md` agree with the README (fix any drift; the README stays the high-level entry point and points to the others rather than repeating them).

Non-goals: no application code or behavior changes; no new diagrams/screenshots; no rewrite of `CLAUDE.md`'s substance (only fix drift if found); not a published docs site.

## Capabilities

### New Capabilities
<!-- None — documentation-only change. No system behavior changes, so no spec capabilities. -->

### Modified Capabilities
<!-- None. -->

## Impact

- **Files:** `README.md` (full rewrite); minor consistency edits to `CLAUDE.md` / `openspec/config.yaml` / `docs/design/README.md` only if drift is found.
- **No code, tests, or runtime impact.** No specs change (no capabilities).

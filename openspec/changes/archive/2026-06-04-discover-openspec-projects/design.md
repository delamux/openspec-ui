## Context

openspec-ui is greenfield boilerplate (one `index.astro`). This change builds the first vertical slice — `project-discovery` — and, because it is the first slice, the runtime walking skeleton: Astro server mode, a Node adapter, and Vitest. The infrastructure in this project is the **filesystem** (reading directory entries, checking files), the **environment** (reading the configured root), and, in later slices, **markdown parsing**. There is no database and no HTTP backend — Astro Actions are the only driving adapter.

Two capabilities are in play: `projects-root-configuration` (read the single root path from the `PROJECTS_PATH` env var) and `project-discovery` (scan that root for OpenSpec-enabled projects). The root is read-only operator configuration; discovery reads the filesystem.

## Goals / Non-Goals

**Goals:**
- Read the single projects-root path from the `PROJECTS_PATH` environment variable (`.env`), distinguishing unset / configured / misconfigured.
- Discover OpenSpec-enabled direct child directories under that root.
- Render the project list (and not-configured / empty / error states) via an Astro Action → use case → adapters.
- Establish the slice skeleton (`src/modules/project-discovery/{domain,application,infrastructure}`) and shared scaffolding (`Maybe`, `DomainError`, `factory.ts`) that later slices reuse.

**Non-Goals:**
- Parsing or rendering proposals/designs/specs/tasks (later slice).
- Toggling checkboxes or adding comments (later slice).
- Setting or editing the projects root from the UI; persisting it to disk.
- Recursive/deep discovery, filesystem watching, multiple roots, symlink following.
- Reading the contents of `openspec/config.yaml` beyond confirming it exists.

## Decisions

### 1. OpenSpec marker = presence of `openspec/config.yaml`
A child directory is a project iff it contains `openspec/config.yaml`. **Why:** `config.yaml` is the canonical OpenSpec marker (the CLI requires it); checking for the `openspec/` folder alone would yield false positives. Alternative considered: parse the YAML and validate `schema:` — rejected for this slice (adds a YAML dependency and parsing concern we don't need yet; name defaults to the directory name).

### 2. Shallow discovery (direct children only)
Scan only the root's immediate subdirectories. **Why:** predictable, cheap, and matches how people lay out a "projects" folder. Deep scanning risks walking huge trees and surfacing nested `openspec/` dirs (e.g. inside `node_modules` or archived changes). Recursive discovery can be a later, opt-in decision.

### 3. Two ports — a filesystem repository and an env-backed root provider
- `ProjectRepository` (domain port) → `FileSystemProjectRepository` (`infrastructure/fs/`) using `node:fs/promises`.
- `ProjectsRootProvider` (domain port) → `EnvProjectsRootProvider` (`infrastructure/env/`) reading the configured path string.
Each port ships an InMemory implementation co-located for use-case tests. **Why:** keeps the domain/application layers free of `node:fs` and of `import.meta.env`, and lets use-case tests run without disk or env. Filesystem adapter tests use a real temp directory (no-mocks policy).

### 4. Root configuration = the `PROJECTS_PATH` environment variable (read-only)
The projects root is read from `PROJECTS_PATH` (a `.env` file), resolved by the Factory via `import.meta.env.PROJECTS_PATH` with a `process.env` fallback, and passed to `EnvProjectsRootProvider`. **Why:** the root is operator/machine configuration, not user data — `.env` is the idiomatic place for it, requires no in-app settings UI or persistence, and stays out of the canonical OpenSpec files. Alternative considered: an in-app input persisted to a JSON config file — rejected; the user wants the root fixed by deployment configuration, not edited at runtime. Trade-off: changing `PROJECTS_PATH` requires a dev-server restart.

### 5. Use cases (application)
- `DiscoverProjects()` — read the root via the provider (`Maybe`); if none → `not-configured`; if the provider rejects a misconfigured value or the root is missing on disk → `discovery-error`; else scan and return `Project[]`.
  This is the single write-free use case for the slice; there is no set/get use case because the root is read-only environment configuration.

### 6. Driving adapter = one Astro Action
A single `listProjects` Action in `src/actions/` calls `DiscoverProjects` via the Factory and serializes the tagged-result DTO (no input). `src/pages/index.astro` mounts the React island that calls it. **Why:** matches the astro-vertical-slicing guideline (pages thin, Actions = controllers, islands never touch fs/env).

### 7. Result shape models the three discovery states explicitly
`DiscoverProjects` returns a tagged result: `not-configured | ok(projects) | error(message)`. **Why:** the spec calls out three distinct states; modeling them as a union (rather than empty-array-or-throw) lets the UI render each deliberately and keeps "no projects" (success) separate from "root missing" (error).

## Risks / Trade-offs

- **Filesystem permission / IO errors mid-scan** → wrap in the discovery-error result with a clear message; never leak stack traces (design-principles error handling).
- **Symlinked child directories** → out of scope; treat only real directories. Documented as a known limitation, not silently mishandled.
- **Shallow scan misses nested projects** → accepted trade-off (Decision 2); revisit if users actually nest.
- **`import.meta.env` vs `process.env` at runtime** → read `import.meta.env.PROJECTS_PATH` (populated from `.env` in dev/build) with a `process.env` fallback so the value can also be supplied at launch.
- **Changing `PROJECTS_PATH` needs a restart** → acceptable for operator config; documented in `.env.example`.
- **First-slice scope creep** (server mode + Vitest + scaffolding bundled) → keep each to the minimum needed to make the list render and tests run.

## Migration Plan

Greenfield — no migration. Deploy = set `PROJECTS_PATH` in `.env` and run locally (`pnpm dev`). Rollback = revert the branch; there is no persisted app state to clean up.

## Open Questions

- None outstanding. Resolved: the root is configured via `PROJECTS_PATH` in `.env` (read-only, no in-app editing); a future slice can add UI editing if needed.

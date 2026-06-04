## Why

openspec-ui has no functionality yet — only boilerplate. Before we can render or edit any OpenSpec artifact, the app must know *which* projects exist: the user points at a folder on disk, and the app finds the projects under it that are OpenSpec-enabled. This is the entry point of the whole product and the thinnest vertical slice that produces visible value (set a path → see the list of OpenSpec projects).

## What Changes

- **Configure a projects root via `.env`.** The single projects-root folder is read from the `PROJECTS_PATH` environment variable (a `.env` file in the project root). There is no in-app input; the root is operator configuration, read-only at runtime.
- **Discover OpenSpec projects.** Given the configured root, the app scans its direct child directories and identifies those that are OpenSpec-enabled (contain `openspec/config.yaml`). Each becomes a listed project with its name and absolute path.
- **List projects in the UI.** A React island renders the discovered projects (and the not-configured / empty / error states) by calling an Astro Action that delegates to the use case.
- **Runtime bootstrap (walking skeleton).** Switch Astro to `output: 'server'` with `@astrojs/node` (required for filesystem access) and add **Vitest** as the test runner for the TDD workflow. This is a one-time cost carried by the first slice.

Non-goals (later slices): parsing/rendering proposals, designs, specs, or tasks; toggling checkboxes; adding comments; recursive/deep discovery; watching the filesystem for changes; multiple roots; editing the root from the UI.

## Capabilities

### New Capabilities
- `projects-root-configuration`: read the single projects-root folder path from the `PROJECTS_PATH` environment variable (`.env`), distinguishing unset from configured.
- `project-discovery`: scan the configured root's direct children and identify OpenSpec-enabled projects (those containing `openspec/config.yaml`), exposing each as a project with name and path.

### Modified Capabilities
<!-- None — no existing specs. -->

## Impact

- **New module:** `src/modules/project-discovery/` (domain, application, infrastructure/{env,fs,ui}).
- **Shared scaffolding (first use):** `src/shared/domain/` (`Maybe`, `DomainError`) and `src/shared/infrastructure/factory.ts` (composition root).
- **Astro config:** `astro.config.mjs` → `output: 'server'` + `@astrojs/node` adapter. New dependency `@astrojs/node`.
- **Driving adapter:** an Astro Action (`src/actions/`) that lists projects; a page in `src/pages/` mounts the island.
- **Configuration:** `PROJECTS_PATH` in `.env` (with a committed `.env.example`); read via an env-backed `ProjectsRootProvider`. No on-disk app-config store, no DB.
- **Tooling:** add `vitest` and a `pnpm test` script; this becomes the test runner referenced by the TDD guidelines.
- **No breaking changes** (greenfield).

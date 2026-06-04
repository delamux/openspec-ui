## 1. Runtime bootstrap & tooling

- [x] 1.1 Add `vitest` (+ `@vitest/coverage` if desired) as a dev dependency and a `test` / `test:watch` script in `package.json`
- [x] 1.2 Add a minimal `vitest.config.ts` (node environment) and confirm a trivial sample test runs green
- [x] 1.3 Install `@astrojs/node` and set `output: 'server'` + the node adapter in `astro.config.mjs`; confirm `pnpm dev` boots
- [x] 1.4 Create shared scaffolding: `src/shared/domain/Maybe.ts` and `src/shared/domain/DomainError.ts` (factory methods `createNotFound`, `createValidation`, `create`) with unit tests
- [x] 1.5 Create the empty slice skeleton folders `src/modules/project-discovery/{domain,application,infrastructure/fs,infrastructure/ui}`

## 2. Domain (project-discovery)

- [x] 2.1 RED→GREEN `ProjectsRoot` value object: factory validates absolute, non-empty path; immutable; exposes the path
- [x] 2.2 RED→GREEN `Project` entity/value object: holds `name` and absolute `path`; name defaults to the directory name
- [x] 2.3 Define `ProjectsRootProvider` port (domain/repositories) with `find(): Promise<Maybe<ProjectsRoot>>` (read-only) + co-located `InMemoryProjectsRootProvider`, with tests
- [x] 2.4 Define `ProjectRepository` port with `discoverUnder(root): Promise<Project[]>` + co-located `InMemoryProjectRepository`, with tests
- [x] 2.5 Model the discovery result as a tagged union `not-configured | ok(projects) | discovery-error(message)` (domain type), with tests

## 3. Application use cases

- [x] 3.1 RED→GREEN `DiscoverProjects` use case: no root → `not-configured`; misconfigured (non-absolute) or missing root → `discovery-error`; otherwise → `ok(projects)` including the empty-but-successful case (uses InMemory doubles, no mocks)
- [x] 3.2 Define response DTOs for the Action (plain, serializable) and map domain results → DTOs

## 4. Configuration & filesystem adapters

- [x] 4.1 RED→GREEN `EnvProjectsRootProvider` (`infrastructure/env/`) reading the `PROJECTS_PATH` value: absolute → `ProjectsRoot`; unset/empty → `none`; relative → validation error; with unit tests
- [x] 4.2 Add `.env` / `.env.example` documenting `PROJECTS_PATH`; the Factory reads it via `import.meta.env` with a `process.env` fallback
- [x] 4.3 RED→GREEN `FileSystemProjectRepository.discoverUnder(root)`: list direct child directories, keep those containing `openspec/config.yaml`; ignore files, non-OpenSpec dirs, and deeper nesting; integration tests use a real temp dir fixture
- [x] 4.4 Handle IO/permission errors and missing-root by surfacing a discovery error (no stack traces leaked)

## 5. Composition root (factory)

- [x] 5.1 Create `src/shared/infrastructure/factory.ts` (`fromEnv()`) that wires `EnvProjectsRootProvider` + `FileSystemProjectRepository` into `DiscoverProjects`
- [x] 5.2 Add a way to swap InMemory vs real implementations for tests (factory `withDependencies(...)` variant)

## 6. Driving adapter (Astro Actions)

- [x] 6.1 Create `src/actions/` with a `listProjects` action that calls `DiscoverProjects` via the Factory and returns the tagged-result DTO (no input)
- [x] 6.2 Keep actions logic-free (delegate → one use case → serialize); add a thin test that the handler delegates correctly

## 7. UI island & page

- [x] 7.1 Build a `ProjectList` React island (`infrastructure/ui/`) that renders the four states: not-configured (prompt to set `PROJECTS_PATH` in `.env`), empty, error, and a list of project cards (name + path); CSS Modules, no destructuring of props/hooks
- [x] 7.2 Auto-load the list on mount (no projects-root input — the root is env configuration)
- [x] 7.3 Mount the island from `src/pages/index.astro` (page stays thin: routing + island only)

## 8. Verify

- [x] 8.1 Run `pnpm test` — all unit + integration tests green
- [x] 8.2 Manual check via `pnpm dev`: set `PROJECTS_PATH` to a folder containing OpenSpec projects, confirm they appear; unset it, confirm not-configured; point at a folder with none, confirm empty state; relative/missing path, confirm error state
- [x] 8.3 `pnpm astro check` passes (types clean)

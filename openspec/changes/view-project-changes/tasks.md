## 1. Domain (change-viewer)

- [x] 1.1 RED→GREEN `Change` value object: `name` + `status` (`active | archived`); factory validates non-empty name
- [x] 1.2 Define task model types: `Task` (`id`, `text`, `done`, `comments`), `TaskComment` (`author`, `when`, `text`), `TaskGroup` (`title`, `items`), `TaskList` (groups) — with a `progress(list)` helper, tested
- [x] 1.3 Define `ChangeDetail` (`proposal: Maybe<string>`, `design: Maybe<string>`, `tasks: Maybe<TaskList>`)
- [x] 1.4 Define `ChangeRepository` port with `listChanges(projectPath)` / `loadChange(projectPath, changeName)` + co-located `InMemoryChangeRepository`, with tests

## 2. Parsing

- [x] 2.1 RED→GREEN `parseTasks(markdown)`: parse `## N. Title` groups and `- [ ]/[x] N.N text` items (id = leading token, done from checkbox), preserving order
- [x] 2.2 RED→GREEN parse inline `<!-- ui:comment author=… at=… -->…<!-- /ui:comment -->` blocks beneath a task into that task's comments (author, relative `when` from `at`, text)
- [x] 2.3 Tolerant parsing: unrecognized lines ignored; empty/whitespace input → empty group list; never throws
- [x] 2.4 Reuse the existing tested `renderMarkdown` for proposal/design (move to a shared location if needed)

## 3. Application use cases

- [x] 3.1 RED→GREEN `ListChanges(projectPath)` use case: returns the project's changes (active + archived) or an empty list; never throws on a project with none
- [x] 3.2 RED→GREEN `LoadChange(projectPath, changeName)` use case: returns a `ChangeDetail` (proposal/design as `Maybe`, parsed `TaskList` as `Maybe`)
- [x] 3.3 Define plain serializable DTOs for the Actions (change list item; change view with proposal/design strings + task groups + comments) and map domain → DTOs

## 4. Filesystem adapter (infrastructure/fs)

- [x] 4.1 RED→GREEN `FileSystemChangeRepository.listChanges`: scan `openspec/changes/*` (active) and `openspec/changes/archive/*` (archived); include a dir only if it has `proposal.md`; flag archived; integration tests use a real temp dir
- [x] 4.2 RED→GREEN `FileSystemChangeRepository.loadChange`: read `proposal.md`/`design.md` (absent → `none`) and `tasks.md` → `parseTasks`; integration tests with a temp-dir fixture
- [x] 4.3 Use this repo's own archived change (`openspec/changes/archive/2026-06-04-discover-openspec-projects`) as a real fixture in a test
- [x] 4.4 Surface IO errors / missing change as a domain error (no stack traces leaked)

## 5. Composition root & Actions

- [x] 5.1 Extend `Factory.fromEnv()` to build `FileSystemChangeRepository` and expose `ListChanges` + `LoadChange`; keep the `withDependencies` test variant
- [x] 5.2 Add Astro Actions `listChanges` (input: projectPath) and `loadChange` (input: projectPath, changeName) delegating to the use cases; thin handler tests with injected in-memory deps

## 6. Shared UI primitives (shadcn-style, CSS Modules)

- [x] 6.1 Create `src/shared/infrastructure/ui/components/Select/` (token-styled native `<select>` wrapper; props via `props.x`)
- [x] 6.2 Create `Tabs/` (underline variant A), `Checkbox/` (read-only display state), `Badge/` (status + count)
- [x] 6.3 Create `Button/`, `IconButton/`, `Input/`, `Avatar/`
- [x] 6.4 Refactor the `/spec` viewer's inline chrome to consume these primitives (single source of truth)

## 7. UI: change browser & viewer (read-only)

- [x] 7.1 Generalize `SpecViewer` to accept a loaded `ChangeView` (proposal/design strings + task groups + read-only comments) instead of `sampleSpec`; keep `sampleSpec` as a test/story fixture
- [x] 7.2 Render the Tasks tab read-only: groups, progress bar, checkboxes reflecting done state (non-interactive), existing comment threads displayed (no composer)
- [x] 7.3 Build the `ChangeBrowser` island: project `<Select>` (from `listProjects`) → change `<Select>` (from `listChanges`) → `SpecViewer` (from `loadChange`); empty/not-configured/error states
- [x] 7.4 Reflect selection in the URL (`?project=&change=`) and restore from it on load
- [x] 7.5 Mount `ChangeBrowser` at `/` (retire the `ProjectList` card island and the `/spec` demo route); wire `favicon.svg` into the page head
- [x] 7.6 Keep the system-following light/dark theme toggle working in the new layout

## 8. Design reference docs

- [x] 8.1 Save the design handoff bundle (`app.html`, `app.jsx`, `content.js`, `favicon.svg`, chat) under `docs/design/openspec-ui/` as the UI reference
- [x] 8.2 Add `public/favicon.svg` (OpenSpec IO diamond) and a short `docs/design/README.md` pointing to it and noting the `ui:comment` format (forward reference to the write-back slice)

## 9. Verify

- [x] 9.1 `pnpm test` — all unit + integration tests green
- [x] 9.2 `pnpm astro check` passes (types clean)
- [x] 9.3 Manual via `pnpm dev`: at `/`, select a project, select a change (e.g. this repo's archived `discover-openspec-projects`), confirm Proposal/Design render and Tasks show grouped items with done state; confirm empty/no-changes states

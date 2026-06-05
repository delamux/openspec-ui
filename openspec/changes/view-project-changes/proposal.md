## Why

We can discover OpenSpec projects, but there's nothing to *do* with one yet — clicking through to a change and reading its proposal, design, and tasks is the whole point of the tool. This slice delivers the first real viewing experience, built from the handoff design (the three-tab spec interface): pick a project, pick a change, and read it in a clean shadcn-style UI. It also lays the reusable UI-primitive foundation (built in CSS Modules, no Tailwind) that every later slice reuses.

Scope is deliberately **read-only**. Making tasks toggleable and comments postable (writing back into `tasks.md`) is the next change — keeping this one reviewable and shipping value sooner.

## What Changes

- **Reusable UI primitives.** Add shadcn-style components in `src/shared/infrastructure/ui/components/` (Select, Tabs, Checkbox, Badge, Avatar, Button, IconButton, Input), built with the existing oklch token system and CSS Modules. No Tailwind, no Radix.
- **Project picker as a `<Select>`.** Replace the project *card list* at `/` with a project `<Select>` populated from `DiscoverProjects` (the discovery slice already provides the data).
- **Change picker.** After a project is chosen, a second `<Select>` lists that project's changes — both active (`openspec/changes/*`) and archived (`openspec/changes/archive/*`) — each with its name and status.
- **Read-only spec viewer.** Selecting a change loads and renders its artifacts in the three-tab interface:
  - **Proposal** and **Design** tabs render the real `proposal.md` / `design.md` as markdown.
  - **Tasks** tab renders the parsed `tasks.md` — task groups, each task's id/text and done state (checkboxes shown but **not** interactive yet), a completion progress bar, and any existing inline `<!-- ui:comment … -->` threads displayed read-only.
- **Theme + brand.** Keep the system-following light/dark toggle; wire the OpenSpec IO `favicon.svg` into the app.
- **Design reference docs.** Save the design handoff bundle into `docs/design/` as the reference for this UI.

Non-goals (next slice — write-back): toggling a task's done state into `tasks.md`; posting/editing comments; comment author/timestamp identity; editing proposal/design; creating or archiving changes from the UI.

## Capabilities

### New Capabilities
- `change-listing`: list the changes inside a selected project (active + archived), each exposing a name and status, distinguishing the no-changes state.
- `change-viewing`: load a selected change and expose its proposal, design, and parsed task list (groups, tasks with done state, and existing read-only comments) for rendering.

### Modified Capabilities
<!-- None. project-discovery is unchanged at the spec level — replacing the card list with a <Select> is a UI rendering detail, not a requirement change. -->

## Impact

- **New module:** `src/modules/change-viewer/` (domain, application, infrastructure/{fs,ui}). The read-only `SpecViewer` already prototyped at `/spec` moves/extends here and is fed real data.
- **New shared infra:** `src/shared/infrastructure/ui/components/` primitive library (CSS Modules + oklch tokens).
- **New ports/adapters:** `ChangeRepository` (domain port) → `FileSystemChangeRepository` (`infrastructure/fs/`) using `node:fs`, plus a `tasks.md` parser (groups, `- [ ]/[x]` lines, `ui:comment` blocks) and a markdown reader.
- **New use cases:** `ListChanges(project)`, `LoadChange(project, change)`; new Astro Actions to back them.
- **Routing:** `/` becomes the picker (project `<Select>` → change `<Select>` → viewer); the discovery card list (`ProjectList` island) is retired into the project `<Select>`.
- **Assets/docs:** `public/favicon.svg`; `docs/design/` reference bundle.
- **No breaking changes** (greenfield app; the discovery domain/use cases are reused unchanged).

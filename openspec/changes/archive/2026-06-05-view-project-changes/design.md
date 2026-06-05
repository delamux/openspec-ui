## Context

The discovery slice lists projects; the `/spec` route renders the three-tab viewer against *sample* data. This change connects the two: pick a project, pick one of its changes, and read the real `proposal.md` / `design.md` / `tasks.md`. It also introduces the reusable, shadcn-style UI primitive library that this and every later slice draws from.

Scope is read-only by design (see proposal Non-goals). Writing toggles and comments back into `tasks.md` is the next change; this one keeps the parser/render path honest first.

## Goals / Non-Goals

**Goals:**
- A CSS-Modules primitive library (`Select`, `Tabs`, `Checkbox`, `Badge`, `Avatar`, `Button`, `IconButton`, `Input`) in `src/shared/infrastructure/ui/components/`, shadcn-style via the oklch tokens, no Tailwind/Radix.
- `/` becomes the picker: project `<Select>` → change `<Select>` → the read-only viewer.
- Parse and render real change artifacts, including existing read-only `ui:comment` threads.
- Reuse the existing `renderMarkdown` and `SpecViewer` work, generalized to real data.

**Non-Goals:**
- Any write-back: toggling tasks, posting/editing comments, comment identity/timestamps, editing markdown, creating/archiving changes.
- A full markdown engine (keep the small ported renderer).
- Multi-project / multi-change open at once (one selection at a time).

## Decisions

### 1. shadcn look in CSS Modules — no Tailwind
Each primitive is its own folder under `src/shared/infrastructure/ui/components/<Name>/` with `<Name>.tsx` + `<Name>.module.css`, consuming the global oklch tokens (`src/styles/openspec-ui.css`). **Why:** the project's non-negotiables forbid Tailwind/utility frameworks and mandate CSS Modules; the design is already plain-CSS shadcn. Components follow the frontend guideline (props via `props.x`, explicit interfaces, no destructuring). Alternative considered: real shadcn/ui (Tailwind + Radix) — rejected to preserve the existing conventions.

### 2. New domain: Change + ChangeDetail, behind a `ChangeRepository` port
- `Change` value object: `name`, `status` (`active | archived`).
- `ChangeDetail`: `proposal: Maybe<string>`, `design: Maybe<string>`, `tasks: Maybe<TaskList>`.
- `TaskList` = ordered `TaskGroup[]`; `TaskGroup` = `{ title, items: Task[] }`; `Task` = `{ id, text, done, comments: Comment[] }`; `Comment` = `{ author, when, text }`.
- Port `ChangeRepository` (domain) with `listChanges(projectPath): Change[]` and `loadChange(projectPath, changeName): ChangeDetail`. InMemory impl co-located for use-case tests; `FileSystemChangeRepository` (`infrastructure/fs/`) for real reads. **Why:** mirrors the discovery slice's filesystem-as-repository pattern; keeps domain/application free of `node:fs`.

### 3. `tasks.md` parser (read-focused)
Parse `## N. Title` headings into groups; parse `- [ ] N.N text` / `- [x] N.N text` into tasks (leading `N.N` token → `id`, remainder → `text`, `[x]` → done). Parse inline comment blocks beneath a task line:

```
- [ ] 1.3 Implement redeem()
  <!-- ui:comment author="Priya N." at="2026-06-03T10:00:00Z" -->
  Burn the jti in Redis with a matching TTL.
  <!-- /ui:comment -->
```

`when` is rendered relative from `at`. **Why this format:** it's plain markdown the AI reads natively, and the marker pair delimits machine-parseable blocks. The parser is tolerant — unrecognized lines are ignored, a change with no `tasks.md` yields `none`. **Note:** this slice only *reads*; the round-trip-safe *serializer* (for write-back) is the next change's responsibility.

### 4. Change listing = scan two directories
`listChanges` scans `openspec/changes/*` (active) and `openspec/changes/archive/*` (archived); a directory counts as a change if it has `proposal.md`. Archived names keep their `YYYY-MM-DD-` prefix but are flagged `archived` (the UI may show the prefix as a subtle date). **Why:** matches how `openspec archive` lays out the filesystem.

### 5. Navigation = client island over Actions; selection in the URL
A single `ChangeBrowser` island owns the selection. New Astro Actions: `listChanges(projectPath)` and `loadChange(projectPath, changeName)`; `listProjects` already exists. Selection is reflected in the URL as `?project=…&change=…` so a view is shareable and survives reload. **Why:** Actions keep fs/parsing server-side; URL params give cheap deep-linking without extra state libs.

### 6. Generalize `SpecViewer`, retire the sample route
`SpecViewer` is refactored to accept a loaded `ChangeView` (proposal/design strings + parsed task groups + read-only comments) instead of the hardcoded `sampleSpec`. The `/spec` demo route is removed; `sampleSpec` survives as a **test/story fixture**. The status badge shows `Active`/`Archived`. **Why:** avoids two divergent viewers; the real one is the only one.

### 7. Status = active/archived (not workflow status)
A change's badge reflects its location (active vs archived), not OpenSpec's internal artifact status. **Why:** location is unambiguous and free; richer status (Draft/Complete) can come later from `openspec status` if wanted.

## Risks / Trade-offs

- **`tasks.md` format variance** across real projects → keep the parser tolerant; a group/task it can't parse is skipped, never throws. Our own archived change is the first real fixture.
- **No existing `ui:comment` blocks yet** → the comment parser is exercised by fixtures now; it goes live with the write-back slice. Acceptable.
- **Reading proposal/design as raw markdown** trusts the mini-renderer → it's already tested; unsupported markdown degrades to plain paragraphs, not errors.
- **Archived date-prefixed names** are long → display-trim the leading date in the `<Select>` label, keep the full name as the value.
- **Retiring `/spec`** removes a working demo → mitigated by keeping `sampleSpec` as a fixture and shipping the real viewer at `/`.

## Migration Plan

Greenfield. Deploy = `pnpm dev`, set `PROJECTS_PATH`, open `/`. Rollback = revert the branch; no persisted state. The discovery domain/use cases are reused unchanged.

## Open Questions

- Deep-link URL params (`?project=&change=`) in this slice or defer to the write-back slice? Leaning include now (cheap, useful).
- Keep a read-only comment thread visible even when empty, or only when comments exist? Leaning: show the affordance area only on tasks that have comments in this read-only slice; the always-available composer arrives with write-back.

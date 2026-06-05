# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`openspec-ui` is a local-first **Astro 6 + React 19** app (pnpm, Node >= 22.12.0) that gives a nice UI on top of [OpenSpec](https://github.com/Fission-AI/OpenSpec) projects.

**What it does:**
1. You configure a **projects root** via the `PROJECTS_PATH` environment variable (a `.env` file) — an absolute folder path on disk.
2. The app walks that path and **discovers projects** that contain an `openspec/` folder with a `config.yaml`.
3. You enter a project and the app **parses and renders** its OpenSpec artifacts (proposals, designs, specs, tasks) in a readable UI.
4. From the UI you can **toggle the task checkboxes** (the `- [ ]` / `- [x]` lines in `tasks.md`) and **add comments** under any check.
5. Toggles and comments are **written back into the OpenSpec files themselves**, so the AI (via the `openspec-*` skills) can re-read them and apply the feedback.

Because it reads and writes the local filesystem, this app **runs server-side** (Astro in `server` output with a Node adapter), with React islands for the interactive parts.

> Setup status: `astro.config.mjs` runs `output: 'server'` with `@astrojs/node` (filesystem access), and **Vitest** is wired as the test runner (`pnpm test`). No lint/format script is configured yet — add one before relying on `pnpm lint`.

## Commands

| Command | Action |
| :-- | :-- |
| `pnpm install` | Install dependencies |
| `pnpm dev` | Dev server at `localhost:4321` |
| `pnpm build` | Build to `./dist/` |
| `pnpm preview` | Preview the production build |
| `pnpm astro check` | Type-check `.astro` + TS |
| `pnpm astro add <integration>` | Add an Astro integration (e.g. `node`) |

CLI alias: `pnpm` (no monorepo — single package).

## Architecture

**Hexagonal architecture + DDD + vertical slicing, adapted for Astro.** Code is organized by business module ("screaming architecture"), not by technical layer. Dependencies always point inward: `Infrastructure → Application → Domain`.

The twist with Astro: routing is file-based and lives in `src/pages/`, which fights screaming architecture. Resolution — **`src/pages/` is a thin routing/wiring shell; the real architecture lives in `src/modules/`.**

```
src/
  pages/                      # THIN. Astro routing + driving adapters only.
    index.astro               #   mounts a slice's React island (WiredPage)
    actions/ (or api/)        #   Astro Actions/endpoints = the HTTP driving adapter,
                              #   they only deserialize input and delegate to a use case
  modules/                    # Vertical slices — the business domain (screaming).
    project-discovery/        #   find projects under the configured root
      domain/ application/ infrastructure/{fs,ui}/
    change-viewer/            #   parse + render proposal/design/specs/tasks
      domain/ application/ infrastructure/{parser,ui}/
    review-feedback/          #   toggle checkboxes + comments + AI hand-off
      domain/ application/ infrastructure/{fs,ui}/
  shared/
    domain/                   #   Maybe, DomainError, shared value objects
    infrastructure/
      factory.ts              #   composition root (wires adapters → use cases)
      ui/components/          #   reusable React primitives
```

Each slice keeps the standard layers:

- **Domain** — Entities, Value Objects, Domain Services, Repository **ports** (+ InMemory impls). Zero framework/library imports.
- **Application** — Use Cases (one class each), DTOs, external-service ports. Depends only on Domain.
- **Infrastructure** — Adapters that implement the ports: the **filesystem adapter** (this project has no database — *the filesystem is the repository*), the **markdown parser**, Astro Actions/endpoints (driving adapter), and React UI. Frameworks live here.

See [architecture-hexagonal](./.claude/skills/guidelines/architecture-hexagonal/SKILL.md) for layer rules and [astro-vertical-slicing](./.claude/skills/guidelines/astro-vertical-slicing/SKILL.md) for how the hexagon maps onto Astro (pages, actions, islands, server vs client boundary).

### What does NOT apply here

The hexagonal guideline carries backend patterns from other projects. **Ignore these in openspec-ui:** Drizzle/Postgres repositories, the `UnitOfWork` / `TransactionScope` / `DrizzleTransactionManager` machinery, domain-events/outbox, permission actions, Express controllers. There is no DB and no transaction boundary — persistence is reading/writing markdown files through a `FileSystem` port.

## Domain model (the OpenSpec document model)

OpenSpec supplies the ubiquitous language:

```
ProjectsRoot (configured path)
  └─ Project (aggregate root) ............ a folder containing openspec/ + config.yaml
       └─ Change (aggregate) ............. openspec/changes/<name>/
            ├─ Proposal ................... proposal.md
            ├─ Design ..................... design.md
            ├─ Spec[] ..................... specs/<capability>/spec.md
            └─ TaskList ................... tasks.md
                 └─ Task (value object) ... a "- [ ]" / "- [x]" line
                      └─ Comment[] ........ UI feedback, embedded inline
```

The checkbox line is a **value object** (parse ↔ serialize). The only two write use cases are **ToggleTask** and **AddComment**.

## The review-feedback loop (write-into-openspec model)

Toggles and comments are persisted **into the canonical OpenSpec files** (decision: keep one source of truth so the AI sees feedback natively).

- **Toggle** = flip `- [ ]` ↔ `- [x]` in `tasks.md` and save.
- **Comment** = an inline block under the check, delimited by markers so the parser and the AI can both find it:

  ```
  - [x] Implement the markdown parser
    <!-- ui:comment author=luis -->
    The parser must handle tasks nested under headings.
    <!-- /ui:comment -->
  ```

  The marker pair (`ui:comment` … `/ui:comment`) is the parsed unit; the text between stays human- and AI-readable. The AI "apply comments" pass scans for these blocks, acts on them, and clears them.

When designing parser/serializer changes, treat **round-trip fidelity** as a hard requirement: parse → serialize must not reorder, reindent, or drop content the UI didn't touch.

## Engineering workflow

This repo uses the **OpenSpec spec-driven workflow** (`openspec/config.yaml`, `schema: spec-driven`). Plan, build, and finalize features through the `openspec-*` skills rather than ad-hoc edits:

- `openspec-explore` — think through a problem before committing.
- `openspec-propose` — generate a full change proposal (design, specs, tasks).
- `openspec-apply-change` — implement the tasks of an active change.
- `openspec-archive-change` — finalize and archive a completed change.

Inside a change, follow **TDD (inside-out)** and the XP pair-programming stance: develop from the domain outward (Value Objects → Entities → Repository ports → Use Cases → Adapters → Astro Actions → React UI), each layer red-green-refactor. The user is the Tech Lead — consult during planning.

## Available skills

### Guidelines (auto-loaded knowledge)
- `architecture-hexagonal` — Hexagonal layers, vertical slicing, dependency rule (ignore the DB/transaction sections — see above).
- `astro-vertical-slicing` — How the hexagon maps onto Astro: pages vs modules, Actions as driving adapters, islands, server/client boundary, filesystem-as-repository.
- `design-principles` — Naming, functions, classes/modules, error handling (stack-agnostic).
- `testing-standards` — Test naming, structure, FIRST, no-mocks policy.
- `frontend-patterns` — React components, hooks, CSS Modules, store layer.
- `xp-tdd-practices` — TDD 5-step cycle, TPP, inside-out, pairing.
- `git-strategy` — Feature branching, conventional commits, TDD commit discipline.

### Actions
- `/action-plan`, `/action-tdd`, `/action-refactor`

### Tasks (subagent reviews)
- `/task-validate`, `/task-code-review`, `/task-testing-review`, `/task-architecture-review`, `/task-frontend-review`, `/task-ux-review`, `/task-qa`
  (`pnpm test` and `pnpm astro check` are configured; lint/format are not yet — wire those up before relying on them.)

## Design standards (summary)

### Naming
- Pronounceable, no abbreviations, no redundant prefixes (`I`, `Impl`).
- One concept = one name; prefer enums over literals.

### Functions
- Single responsibility, 0–3 parameters, no boolean flags.
- Guard clauses, early exit, no `else`; prefer map/filter/reduce over `for`.
- CQS: commands don't return, queries don't mutate.
- Comment only WHY, never WHAT; no commented-out code; no blank lines inside functions.

### Classes
- Private constructor + factory methods for validation; complete objects at construction, no setters, no anemic models.
- Tell Don't Ask, Law of Demeter, composition over inheritance.

### Errors
- Single `DomainError` class with factory methods: `createNotFound()`, `createValidation()`, `create()`.
- Domain vs technical errors; include context; never expose internals.
- Use `Maybe<T>` instead of `null`/`undefined`.

## TDD cycle (always follow)
0. **REASON** — understand the problem, list cases simple→complex, validate with Tech Lead.
1. **RED** — write the failing test.
2. **GREEN** — minimum code to pass (follow TPP).
3. **REFACTOR** — remove duplication (Rule of Three), clear names.
4. **RE-EVALUATE** — review pending cases, return to RED.

### No-mocks policy
- Never mock repositories — use InMemory implementations.
- Stubs/spies only for external-service ports in use-case tests.
- Integration tests use the real filesystem (temp dirs).

## Non-negotiable rules
- Never skip TDD. No production code without a failing test first.
- Never commit directly to `main`.
- Code, comments, and docs in English.
- Domain has zero framework/library imports; validate the dependency rule on every import.
- Keep `src/pages/` thin — no business logic in pages or Actions; delegate to use cases.
- Group code by business module, not by technical layer.
- Parser/serializer round-trips must preserve untouched content exactly.

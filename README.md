# OpenSpec UI

A local-first [Astro](https://astro.build) + React app for reading the [OpenSpec](https://github.com/Fission-AI/OpenSpec) changes in your projects. Point it at a folder of projects, pick one, pick a change, and read its **Proposal**, **Design**, and **Tasks** in a clean three-tab interface — without leaving the browser or digging through markdown files by hand.

## How it works

```
set PROJECTS_PATH   →   pick a project   →   pick a change        →   read it
(.env, a folder      (every direct child   (active + archived       (Proposal · Design ·
 of projects)         with openspec/)        changes in that proj)    Tasks, rendered)
```

The app runs server-side (so it can read your disk), discovers every direct child directory under `PROJECTS_PATH` that contains an `openspec/config.yaml`, and renders a selected change's `proposal.md` / `design.md` / `tasks.md`.

## Requirements

- **Node** ≥ 22.12.0
- **pnpm**

## Setup

```sh
pnpm install
cp .env.example .env        # then edit PROJECTS_PATH
pnpm dev                    # http://localhost:4321
```

Set `PROJECTS_PATH` in `.env` to the **absolute** path of the folder that holds your OpenSpec projects (no `~` expansion; restart the dev server after changing it):

```sh
PROJECTS_PATH='/Users/you/code'
```

## Commands

All commands run from the repo root:

| Command | Action |
| :-- | :-- |
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start the dev server at `localhost:4321` |
| `pnpm build` | Build the production site to `./dist/` |
| `pnpm preview` | Preview the production build |
| `pnpm test` | Run the unit + integration tests (Vitest) |
| `pnpm astro check` | Type-check `.astro` and TypeScript files |

## Feature status

**Shipped**
- **Project discovery** — find OpenSpec projects under `PROJECTS_PATH`.
- **Read-only change viewer** — project → change picker, with the Proposal / Design / Tasks tabs rendering real files (active and archived changes); light/dark theme.

**Planned**
- **Task write-back** — check/uncheck, edit, delete, and add tasks, written back to `tasks.md`.
- **Comments** — post comments on tasks (the AI-fetchable feedback loop).

## Architecture

Hexagonal architecture with DDD and vertical slicing, adapted for Astro: thin `src/pages/` routing, business modules in `src/modules/<slice>/` (domain / application / infrastructure), shared primitives in `src/shared/`. The UI is built from shadcn-style components in `src/shared/infrastructure/ui/components/` using CSS Modules and an oklch token system — **no Tailwind**. There is no database; the filesystem is the repository.

Full details and conventions: **[CLAUDE.md](./CLAUDE.md)**. UI design reference: **[docs/design/](./docs/design/)**.

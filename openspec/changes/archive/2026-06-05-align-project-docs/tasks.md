## 1. Rewrite the README

- [x] 1.1 Replace the Astro-starter `README.md` with a project intro: one-paragraph "what openspec-ui is" + a short "how it works" flow (set `PROJECTS_PATH` → pick project → pick change → read Proposal/Design/Tasks)
- [x] 1.2 Add the run section: requirements (Node ≥ 22.12, pnpm), the real commands table (`pnpm install/dev/build/preview/astro check/test`), and `.env` setup (`PROJECTS_PATH`, absolute path, restart to apply)
- [x] 1.3 Add a brief architecture pointer (hexagonal + DDD + vertical slicing; shadcn-style CSS-Module UI, no Tailwind) that links to `CLAUDE.md` for depth rather than duplicating it
- [x] 1.4 Add a short feature-status section: shipped (project discovery, read-only change viewer) vs planned (task write-back, comments)
- [x] 1.5 Add links to `CLAUDE.md` (contributor/agent guide) and `docs/design/` (design reference)

## 2. Align surrounding docs

- [x] 2.1 Skim `CLAUDE.md`, `openspec/config.yaml` (context), and `docs/design/README.md` for drift vs the new README; fix only inconsistencies (keep README as the entry point that links out, not a duplicate)
- [x] 2.2 Verify every command, path, and env var named in the README matches reality (`package.json` scripts, `.env.example`, `astro.config.mjs`)

## 3. Verify

- [x] 3.1 Re-read the README end-to-end for accuracy against the current build; confirm all internal links resolve

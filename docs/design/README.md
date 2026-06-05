# Design reference

This folder holds the original design handoff bundle that the OpenSpec UI is built from, exported from [Claude Design](https://claude.ai/design).

## Contents

- `openspec-ui/app.html`, `app.jsx`, `content.js` — the interactive three-tab spec prototype (Proposal · Design · Tasks) with the shadcn token system, the markdown renderer, and the hover-activated task **comment threads**.
- `openspec-ui/OpenSpec UI.html`, `design-canvas.jsx` — the canvas wrapper that embeds the prototype at desktop/mobile across the three layout variations.
- `openspec-ui/favicon.svg` — the "OpenSpec IO" brand mark (a hollow diamond ring on orange). The live copy lives at `public/favicon.svg`.
- `openspec-ui/chats/chat1.md` — the design conversation (intent + decisions).
- `openspec-ui/HANDOFF-README.md` — the bundle's original instructions.

## How it maps to the app

The prototype is the source of truth for the look. It is **re-implemented in this codebase** (not embedded) as:

- shadcn-style primitives in `src/shared/infrastructure/ui/components/` (CSS Modules + the oklch tokens in `src/styles/openspec-ui.css`) — **no Tailwind**.
- the read-only viewer in `src/modules/change-viewer/` (`ChangeBrowser` + `SpecViewer`), wired to real `proposal.md` / `design.md` / `tasks.md`.

Variant **A (underline tabs)** was the chosen layout.

## Task comments — the `ui:comment` format

The design's task-comment threads persist in `tasks.md` as inline marker blocks beneath the task line, so a coding agent can read and act on them:

```markdown
- [ ] 1.3 Implement redeem()
  <!-- ui:comment author="Priya N." at="2026-06-03T10:00:00Z" -->
  Burn the jti in Redis with a matching TTL.
  <!-- /ui:comment -->
```

The `view-project-changes` slice renders these blocks **read-only**. Posting and toggling them back into `tasks.md` (with round-trip fidelity) is the **next** change — the write-back slice.

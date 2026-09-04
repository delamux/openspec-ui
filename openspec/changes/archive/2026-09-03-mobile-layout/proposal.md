## Why

openspec-ui is now reached from a phone (the dev server accepts Tailscale/LAN hostnames via `DEV_ALLOWED_HOSTS`), but the UI was laid out for a desktop browser. The single 768px breakpoint only wraps the app bar: the project picker, change picker, "Show archived" toggle and Changes/Worktrees tabs still share one row and squeeze to unusable widths on a 390px screen. The Tasks view is worse — its drag handle and delete button only appear on hover, which a touch screen never triggers, so on a phone those controls are invisible.

## What Changes

- **Phone app bar (≤640px), "layout B".** The Project and Change selects stack one below the other at full width. The Changes/Worktrees workspace tabs move up onto the brand row, beside the theme toggle. The "Show archived" checkbox and the Active/Archived badge share one row. The brand subtitle is hidden to make room. The app bar's DOM order does not change; the reflow is CSS-only.
- **Tablet (641–768px) keeps today's layout** (app bar wraps, pickers side by side under the brand).
- **Tasks view on touch devices.** The drag handle and delete button are always visible on devices that cannot hover; hover devices keep the reveal-on-hover behavior. Task-row controls get a hit area of at least 40px on coarse pointers without growing their visual size. On phones the add-task input takes its own row with the Add/Cancel buttons beneath it, and comment threads indent less.
- **Prose tables scroll horizontally** inside the content instead of widening the page. The markdown renderer wraps each table in a scroll container.
- **Worktree cards on phones.** The card head wraps so long branch names no longer overflow; the action buttons wrap; the review mode no longer pads the nested SpecViewer twice.
- **No horizontal page scroll** at any of the checked widths (360, 390, 768).

Non-goals:
- A DOM test environment (jsdom + Testing Library) or a Playwright suite for layout assertions — CSS is verified manually at fixed viewports; only the renderer change is unit-tested.
- Collapsing the pickers behind a disclosure once a change is selected.
- Any change to Actions, use cases, or the domain.

## Capabilities

### New Capabilities
- `responsive-layout`: how the app bar, the change viewer, the tasks view and the worktree panel present themselves at phone widths and on touch/coarse-pointer devices — stacking, control placement, visibility of hover-revealed controls, hit areas, and horizontal overflow rules.

### Modified Capabilities
<!-- None. `change-viewing` (three-tab viewer) and `task-editing` (drag handle, delete) keep their behavior; only their presentation at phone widths and on touch devices is specified, and that lives in the new capability. -->

## Impact

- **UI only** — every touched file is in `infrastructure/ui` or `shared/infrastructure/ui`; no ports, use cases, Actions or domain code change.
- `src/modules/change-viewer/infrastructure/ui/ChangeBrowser.tsx` + `.module.css`: wrapper classes on the app-bar leaves, phone breakpoint reflow.
- `src/modules/change-viewer/infrastructure/ui/SpecViewer/markdown.ts` (+ `markdown.test.ts`): tables emitted inside a scroll wrapper. `src/styles/openspec-ui.css`: wrapper style.
- `src/modules/change-viewer/infrastructure/ui/SpecViewer/TasksView.module.css` and `src/shared/infrastructure/ui/components/Checkbox/Checkbox.module.css`: hover/pointer media queries, hit areas, add-row and thread phone rules.
- `src/modules/worktree-management/infrastructure/ui/WorktreePanel.module.css`: card head/actions wrap, review padding.
- **No new dependencies. No breaking changes.**

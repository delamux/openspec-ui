## Context

The app is a single React island (`ChangeBrowser`) with an app bar and a body that renders one of: the change viewer (`SpecViewer` → Proposal/Design markdown or `TasksView`), or the `WorktreePanel` (cards, or a nested `SpecViewer` in review mode). Styling is CSS Modules per component plus a global `openspec-ui.css` for tokens and `.prose`.

Today there is one breakpoint, `max-width: 768px`, and it does three things: wraps the app bar so `.pickers` drops under the brand as a full-width row, tightens tab/content padding, and stacks the worktree create row. Inside `.pickers` the four controls (project select, change select, "Show archived", workspace tabs) stay on one flex row with `min-width: 0`, so at 390px they shrink into each other and the tabs run past the edge.

The Tasks view reveals its drag handle and delete button with `opacity: 0` → `.task:hover` rules. Touch screens do not hover, so the controls never appear. The checkbox mark is 19px and the drag handle 20×24px, well under the usual 44px/48px touch guidance.

Constraints:
- Vitest runs in `environment: 'node'` with no DOM. CSS and JSX structure have no automated tests today; the markdown renderer does.
- The island is `client:load` and server-rendered first, so any layout decision made in JS (a media-query hook) would render the desktop tree on the server and re-layout on hydration.
- Shared primitives (`Tabs`, `Checkbox`, `Badge`, `IconButton`) take no `className`; placement is done through wrapper elements in the caller.

## Goals / Non-Goals

**Goals:**
- A phone layout (≤640px) for the app bar: pickers stacked full width, workspace tabs on the brand row beside the theme toggle, archived toggle and status badge on one row.
- Touch-usable Tasks view: hover-revealed controls visible on devices that cannot hover, sensible hit areas on coarse pointers, add row and threads that fit a phone.
- Prose tables and worktree card heads never widen the page.
- Keep the tablet layout (641–768px) and the desktop layout as they are.

**Non-Goals:**
- Adding jsdom/Testing Library or Playwright for layout assertions.
- Collapsing or hiding the pickers after a change is selected.
- Changing the shared primitives' APIs (no `className` prop), or any non-UI layer.

## Decisions

### 1. Two breakpoints: 640px "phone" and the existing 768px "tablet"
Stacking kicks in at `max-width: 640px`; the existing 768px rules (wrapped app bar, side-by-side pickers, tighter padding, 44px icon buttons) stay for the range in between. **Why:** an iPad in portrait is 768px and fits the pickers side by side; stacking there would waste vertical space. One breakpoint was considered and rejected for that reason. CSS media queries cannot read custom properties, so the two values are literals; both are named in a comment at the top of `openspec-ui.css` so they stay in sync across modules.

### 2. CSS-only reflow of the app bar with `display: contents` and `order`
The app bar keeps its DOM: `brand`, `pickers` (project select, change select, archived checkbox, workspace tabs), `appbarRight` (badge, theme toggle). At the phone breakpoint `.pickers` and `.appbarRight` become `display: contents`, so their leaves become direct flex items of the wrapping `.appbar`, and each leaf gets an `order` plus a `flex-basis`:

```
order 1 brand            order 2 tabs (margin-left auto)   order 3 theme toggle
order 4 project select   (flex-basis 100%)
order 5 change select    (flex-basis 100%)
order 6 archived checkbox                                  order 7 badge (margin-left auto)
```

Each leaf gets a wrapper `div` with a module class in `ChangeBrowser.tsx` (the picker wrappers already exist; the checkbox, tabs and badge get one). **Why this over the alternatives:**
- *Grid template areas* would express the rows more explicitly, but an absent control (no archived changes, worktrees tab hides the change picker) leaves an empty named row plus its gap. Flex wrap simply has no row when the items are absent.
- *A `useMediaQuery` hook rendering the tabs in a different slot* means JS-driven layout, a server-rendered desktop tree, and a re-layout on hydration.
- *Rendering the tabs twice with CSS show/hide* duplicates a `role="tablist"` in the DOM.
`display: contents` is safe here because the wrappers are plain `div`s with no semantics of their own.

### 3. Brand subtitle hidden on phones
At 390px the brand row must hold the logo, the name, two tabs and a 44px toggle. "Browse changes" is the widest text in the brand and carries no information, so it is hidden at the phone breakpoint; the name stays. Below ~360px the tab strip may still be tight, so `.tabnav` gets `overflow-x: auto` as a safety net rather than shrinking the tabs further.

### 4. Touch behavior keyed on pointer capabilities, not width
- The reveal-on-hover rules for the drag handle and delete slot move inside `@media (hover: hover)`. Outside it (phones, tablets) the controls are always visible at their resting opacity. **Why:** a desktop window narrowed to 500px still has a mouse and should keep the tidy hover reveal; a 1024px tablet has no hover and needs the controls visible. Width is the wrong signal for this.
- Hit areas grow inside `@media (pointer: coarse)`: the drag handle and the task checkbox get a hit area of at least 40×40px via padding compensated by negative margin, so the row's visual density is unchanged. **Why 40 and not 44:** the row packs handle, checkbox, id and text with 9px gaps; 44px hit areas would overlap their neighbors more than they help. `IconButton` already goes to 44px at ≤768 and keeps that.
- dnd-kit's `PointerSensor` with `distance: 5` already handles touch, and the handle already sets `touch-action: none`, so dragging from the handle does not scroll the page. Nothing changes in the sensor setup.

### 5. Add row and threads on phones
At the phone breakpoint `.addRow` wraps: the input takes the full row (`flex-basis: 100%`), Add and Cancel sit on the next. `.thread` drops its 47px left margin to the checkbox column so comments keep most of the width. These are width rules, not pointer rules: they are about space, and apply to a narrow desktop window too.

### 6. Tables wrapped by the renderer, not by CSS alone
A `<table>` cannot scroll itself; it needs a block wrapper with `overflow-x: auto`. `renderMarkdown` emits `<div class="tableWrap"><table>…</table></div>` and `openspec-ui.css` styles `.prose .tableWrap`. **Why in the renderer:** the renderer is the one place that knows a table is being produced, and it is unit-tested, so this is the one part of the change done red→green. Wrapping with a DOM pass after render was rejected as a second traversal for no benefit.

### 7. Worktree cards
`.cardHead` and `.cardActions` get `flex-wrap: wrap`; `.branch` gets `min-width: 0` and `overflow-wrap: anywhere` so a long branch name breaks instead of pushing the tokens counter off-card. In review mode `.review` drops its horizontal padding at the phone breakpoint so the nested `SpecViewer` content keeps only its own; the back-button row keeps its padding via its own rule.

### 8. Verification without a DOM test runner
CSS is checked manually at three widths in the browser devtools device toolbar — 360 (small Android), 390 (iPhone), 768 (iPad portrait) — plus on a real phone over Tailscale, using a checklist that mirrors the spec scenarios. `pnpm astro check` and `pnpm test` guard the TSX and the renderer. Adding a DOM environment only to assert class names was judged not worth it for this change.

## Risks / Trade-offs

- **`display: contents` support/quirks** → all evergreen browsers support it on `div`; the known accessibility bugs concern buttons and tables, which are not the wrappers here. Fallback if a problem appears: flatten the JSX so the leaves are direct children on every width.
- **`hover: hover` on hybrid laptops with touchscreens** → they report hover, so the controls stay hover-revealed while a finger can't hover them. Accepted: those users have a trackpad; the mouse behavior is the expected one.
- **Overlapping hit areas in the task row** → the padding/negative-margin technique lets the handle's and the checkbox's hit areas overlap by a few px; the later element in DOM order wins on the overlap. At 40px the overlap is small; verified by tapping on a real phone.
- **Brand row too tight under 360px** → the tab strip scrolls horizontally (Decision 3). If that proves ugly the next step is hiding the brand name too.
- **No automated regression for the layout** → mitigated by the manual checklist in the tasks; a Playwright viewport suite remains an option for a later change.

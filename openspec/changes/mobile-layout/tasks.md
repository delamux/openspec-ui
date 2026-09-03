## 1. Breakpoints and prose tables (change-viewer, shared styles)

- [x] 1.1 Name the two breakpoints (640px phone, 768px tablet) in a comment at the top of `src/styles/openspec-ui.css` so every module's media query refers to the same values
- [x] 1.2 RED→GREEN `renderMarkdown` wraps a pipe table in `<div class="tableWrap">…</div>`: add the failing case to `markdown.test.ts` (table wrapped once; a document with no table is unchanged), then make it pass in `markdown.ts`
- [x] 1.3 Style `.prose .tableWrap` in `openspec-ui.css` with `overflow-x: auto` and the table's bottom margin moved onto the wrapper, so the table keeps its look and scrolls inside it

## 2. App bar phone layout (ChangeBrowser)

- [x] 2.1 Give each app-bar leaf a wrapper with a module class in `ChangeBrowser.tsx`: `archivedToggle` around the Checkbox, `workspaceTabs` around the Tabs, `statusBadge` around the Badge (the two picker wrappers already exist); no change to DOM order or to the shared primitives
- [x] 2.2 Add the `max-width: 640px` block to `ChangeBrowser.module.css`: `.pickers` and `.appbarRight` become `display: contents`; assign `order` and `flex-basis` per design Decision 2 (brand 1, tabs 2 with `margin-left: auto`, toggle 3, project select 4 at 100%, change select 5 at 100%, archived toggle 6, badge 7 with `margin-left: auto`)
- [x] 2.3 Hide `.brandSub` at the phone breakpoint and give the app bar's `.workspaceTabs` wrapper `overflow-x: auto` (plus 1px bottom padding for the tab underline) as the under-360px safety net — on `.tabnav` itself the overflow would clip the underline in every tab strip
- [x] 2.4 Check the 641–768px range still renders the previous wrapped layout (pickers side by side under the brand) and desktop is untouched

## 3. Tasks view on touch (TasksView, Checkbox)

- [x] 3.1 Move the `.dragHandle` / `.deleteSlot` `opacity: 0` rules and their `.task:hover` reveals into `@media (hover: hover)` in `TasksView.module.css`; outside it the handle rests at its 0.6 opacity and the delete slot at 1
- [x] 3.2 Under `@media (pointer: coarse)`, give `.dragHandle` a 40×40px hit area via padding compensated by negative margin, keeping the row height unchanged
- [x] 3.3 Under `@media (pointer: coarse)`, give the Checkbox button (`.check` in `Checkbox.module.css`) a 40×40px hit area the same way; confirm the "Show archived" checkbox in the app bar still aligns
- [x] 3.4 At the phone breakpoint make `.addRow` wrap with the Input at `flex-basis: 100%` and Add/Cancel on the next row
- [x] 3.5 At the phone breakpoint reduce `.thread`'s left margin to the checkbox column

## 4. Worktree panel on phones (WorktreePanel)

- [x] 4.1 `.cardHead` and `.cardActions` get `flex-wrap: wrap`; `.branch` gets `min-width: 0` and `overflow-wrap: anywhere` so long branch names break instead of overflowing the card
- [x] 4.2 At the phone breakpoint drop `.review`'s horizontal padding and give `.reviewHead` its own, so the nested SpecViewer content keeps a single padding

## 5. Verification

- [x] 5.1 `pnpm test` and `pnpm astro check` pass
- [x] 5.2 Walked the `responsive-layout` scenarios at 360, 390, 768 and 1280px with a scripted Chromium (touch emulation on the phone/tablet widths): app bar rows, Worktrees tab without empty rows, tablet and desktop unchanged, 40px hit areas on coarse pointers, add-task row stacked, thread at the checkbox column, wide table scrolling inside its wrapper, a 59-character branch wrapping inside the card, review padding equal to the Changes tab; no horizontal page scroll at any width
- [x] 5.3 Pointer-capability behaviour verified in a browser: under touch emulation the drag handle and delete button are visible with no interaction and both carry 40x40 hit areas; in a headful window with a real pointer they are hidden until the row is hovered and revealed on hover
- [ ] 5.4 Confirm on a real phone over Tailscale (`pnpm dev` with `DEV_ALLOWED_HOSTS`): tap a task near its checkbox to toggle it, and drag a task by its handle without the page scrolling — the only checks a synthetic pointer cannot stand in for

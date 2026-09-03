## 1. Breakpoints and prose tables (change-viewer, shared styles)

- [ ] 1.1 Name the two breakpoints (640px phone, 768px tablet) in a comment at the top of `src/styles/openspec-ui.css` so every module's media query refers to the same values
- [ ] 1.2 RED→GREEN `renderMarkdown` wraps a pipe table in `<div class="tableWrap">…</div>`: add the failing case to `markdown.test.ts` (table wrapped once; a document with no table is unchanged), then make it pass in `markdown.ts`
- [ ] 1.3 Style `.prose .tableWrap` in `openspec-ui.css` with `overflow-x: auto` and the table's bottom margin moved onto the wrapper, so the table keeps its look and scrolls inside it

## 2. App bar phone layout (ChangeBrowser)

- [ ] 2.1 Give each app-bar leaf a wrapper with a module class in `ChangeBrowser.tsx`: `archivedToggle` around the Checkbox, `workspaceTabs` around the Tabs, `statusBadge` around the Badge (the two picker wrappers already exist); no change to DOM order or to the shared primitives
- [ ] 2.2 Add the `max-width: 640px` block to `ChangeBrowser.module.css`: `.pickers` and `.appbarRight` become `display: contents`; assign `order` and `flex-basis` per design Decision 2 (brand 1, tabs 2 with `margin-left: auto`, toggle 3, project select 4 at 100%, change select 5 at 100%, archived toggle 6, badge 7 with `margin-left: auto`)
- [ ] 2.3 Hide `.brandSub` at the phone breakpoint and give `.tabnav` in `Tabs.module.css` `overflow-x: auto` as the under-360px safety net
- [ ] 2.4 Check the 641–768px range still renders the previous wrapped layout (pickers side by side under the brand) and desktop is untouched

## 3. Tasks view on touch (TasksView, Checkbox)

- [ ] 3.1 Move the `.dragHandle` / `.deleteSlot` `opacity: 0` rules and their `.task:hover` reveals into `@media (hover: hover)` in `TasksView.module.css`; outside it the handle rests at its 0.6 opacity and the delete slot at 1
- [ ] 3.2 Under `@media (pointer: coarse)`, give `.dragHandle` a 40×40px hit area via padding compensated by negative margin, keeping the row height unchanged
- [ ] 3.3 Under `@media (pointer: coarse)`, give the Checkbox button (`.check` in `Checkbox.module.css`) a 40×40px hit area the same way; confirm the "Show archived" checkbox in the app bar still aligns
- [ ] 3.4 At the phone breakpoint make `.addRow` wrap with the Input at `flex-basis: 100%` and Add/Cancel on the next row
- [ ] 3.5 At the phone breakpoint reduce `.thread`'s left margin to the checkbox column

## 4. Worktree panel on phones (WorktreePanel)

- [ ] 4.1 `.cardHead` and `.cardActions` get `flex-wrap: wrap`; `.branch` gets `min-width: 0` and `overflow-wrap: anywhere` so long branch names break instead of overflowing the card
- [ ] 4.2 At the phone breakpoint drop `.review`'s horizontal padding and give `.reviewHead` its own, so the nested SpecViewer content keeps a single padding

## 5. Verification

- [ ] 5.1 `pnpm test` and `pnpm astro check` pass
- [ ] 5.2 Devtools device toolbar at 360, 390 and 768px: walk the `responsive-layout` spec scenarios (app bar rows, Worktrees tab without empty rows, tablet unchanged, add-task row, thread indent, wide table scrolls, long branch name, review padding); confirm no horizontal page scroll at any width
- [ ] 5.3 Real phone over Tailscale (`pnpm dev` with `DEV_ALLOWED_HOSTS`): drag handle and delete visible without hovering, toggle a task by tapping near the checkbox, start a drag from the handle without the page scrolling, and confirm a mouse on desktop still reveals the controls on hover only

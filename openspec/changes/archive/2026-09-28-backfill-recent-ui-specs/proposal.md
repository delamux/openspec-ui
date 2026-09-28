## Why

Several commits after the `mobile-layout` archive changed behaviour without an OpenSpec change, so the main specs no longer describe what the app does. Archiving `add-project-docs-explorer` also replaced the whole "Render the change" requirement and dropped the "active tab survives a refresh" scenario that commit `94d6e12` had written straight into the main spec. This change records that shipped behaviour retroactively; no code changes.

## What Changes

Backfills specs for these already-merged commits:

- `1ef6fd0` **Highlight fenced code.** Fenced code blocks in rendered markdown are syntax-highlighted when their language is known and HTML-escaped otherwise.
- `e7f8947` **Keep the selection in the URL.** Project, change and worktree are written to the query string (`project`, `change`, `worktree`) and restored on load.
- `8c7ca6a` **Worktree groups hold only their own changes.** A worktree is a full checkout, so the change picker now lists under a worktree only the change it was created for plus changes that exist only there. Groups and options are ordered predictably.
- `2452f32` + `e984dda` **Rendered document width.** The change viewer caps documents at 1024px. Project information documents take 90% of the column. Both go full width at 768px or less.
- Restores the `tab=` scenario (`94d6e12`) under the four-tab viewer requirement.

Non-goals: any code change; specs for `32439db` (task details), which are already in the main `change-viewing` spec.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `change-viewing`: fenced-code highlighting; selection kept in the URL; four-tab viewer requirement restores the refresh scenario.
- `change-listing`: the change picker's grouping and order across project, worktrees and archive.
- `responsive-layout`: width of rendered documents.

## Impact

Specs only (`openspec/specs/change-viewing`, `change-listing`, `responsive-layout`). The code is already on `main`.

## Context

Retroactive change: the behaviour already shipped in `1ef6fd0`, `e7f8947`, `8c7ca6a`, `2452f32` and `e984dda`. The requirements below were read from those commits' code and tests. They are not a new design.

## Decisions

- **One change for all backfilled commits.** They are small, independent and already merged. Splitting them would add ceremony without review value.
- **Width lives in `responsive-layout`.** The width rule depends on the viewport (full width at 768px or less) and covers both the change viewer and the Project information panel. That fits the capability that already owns breakpoints.
- **Restore the refresh scenario through a MODIFIED requirement.** Archiving `add-project-docs-explorer` replaced "Render the change in a three-tab viewer" wholesale, so the scenario is re-added there. The requirement keeps its heading so the delta matches, even though its body now describes four tabs.
- **Unknown fence languages are escaped, not guessed.** This mirrors `highlightCode`: an empty or unregistered language falls back to HTML-escaped plain text.

## Risks / Trade-offs

- The spec is written after the code. It describes what the tests assert, so gaps in those tests stay gaps in the spec.

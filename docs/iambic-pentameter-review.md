# Iambic pentameter review follow-up

Validation checks a curated list of meaningful phrase arrangements, not automatic
scansion or all grammatical English. All supplied phrases already model an iamb.
Incorrect feedback gives the existing clue toward one solution without printing
that solution. Successful feedback scans the submitted accepted order.

## Dataset review

Alternative orders are explicitly listed as zero-based phrase indexes in
`src/data/poemChallenges.ts`; the original answer remains accepted in every round.

| Round | Review decision |
| --- | --- |
| Moonlit Road | Allow moving “tonight” and the intact “above the hills” phrase. |
| Starlit Plain | Allow “across the plain” before the subject and action. |
| Golden Morning | Allow the intact “with streaks of gold” before the subject and action. |
| Spring Meadow | Allow season/time phrases around the intact “the birds will sing their songs” clause. |
| River Path | Allow moving the intact location and time phrases around “we walk”. |
| Ancient Grove | Keep the coordinated verbs and their complement in the original order. |
| Owl Wood | Allow moving the time and intact location phrase around “the owl will call”. |
| Distant Village | Allow moving “throughout the night” while preserving “the bells resound”. |
| Rocky Shore | Allow moving “ashore” and the intact “against the rocks” phrase. |
| Clearing Mist | Keep the coordinated verbs and their complement in the original order. |

These alternatives are deliberately bounded. Broken phrase groups, reversed lines,
duplicate/unknown tiles, and incomplete submissions are rejected. The tests exercise
all accepted entries, rejected arrangements in every round, retry scoring, repeated
checking, hint-only feedback, and the disabled Check Answer button.

## Lockfile

Used Node 24.14.0 and npm 11.9.0. Restored `origin/main:package-lock.json`, then ran
`npm install --package-lock-only --ignore-scripts --offline`. Repeated in a clean
temporary workspace containing all three workspace manifests. Both runs removed
22 existing `libc` fields. Restored those entries verbatim from origin/main after
asserting that their only difference was the missing `libc` field. The final diff
against origin/main contains only the root workspace registration, workspace
manifest dependencies, and workspace symlink. No existing package resolution changed.

## Browser checks still required

The implementation follows the standard drag data lifecycle: set `text/plain` and
`effectAllowed` during dragstart, cancel dragover and set `dropEffect`, then read the
payload on drop. The whole occupied slot is now draggable; child spans cannot
intercept pointer events. Containment guards reduce drag-leave highlight flicker.
Reference: [MDN drag operations](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations).

Real Firefox testing is still required for bank-to-slot placement, occupied-slot
swaps, return-to-bank, canceled/outside drops, and highlight cleanup while crossing
child elements. Also manually verify keyboard activation focuses the destination
slot, reset confirmation cancellation preserves progress, and intro/feedback/final
screens fit at 320px and 375px (including zoom). Server-rendered component tests do
not establish native drag behavior, actual focus, or visual layout.

## Automated verification

- Poetry tests: 74 passing.
- Full suite: 114 passing across nine test files.
- TypeScript: all three workspace configs pass.
- Production build: all three workspaces pass.
- `git diff --check`: passes.

Existing Poe and Shakespeare Vite config-loader migration warnings remain; their
source files were not modified. CI now checks all three TypeScript configs before
building. Score is derived from awarded rounds, eliminating duplicate score state
while retaining the once-per-round guard. Tile banks shuffle once per mounted board
and retain that order during editing.

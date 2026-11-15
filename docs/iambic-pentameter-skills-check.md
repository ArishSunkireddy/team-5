# Iambic pentameter implementation and provenance

The new `iambic-pentameter` npm workspace implements the ten-round Poetry Builder from the local `Iambic Pentameter Side Quest` Figma Make export. The original export is a reference, not a workspace or submission dependency.

## Reused Figma-generated material

- `iambic-pentameter/src/data/poemChallenges.ts`: all ten challenge definitions, types, factory, tile IDs, fixed scrambled orders, hints, and scansion are copied from the export. The old validator was removed.
- `iambic-pentameter/src/index.css`: copied unchanged, including fonts, responsive layouts, landscape, parchment, controls, and focus styles.
- `iambic-pentameter/src/components/Presentation.tsx`, `Intro.tsx`, `PoetryBoard.tsx`, `RoundFeedback.tsx`, and `FinalResults.tsx`: extracted/adapted from the export's `src/App.tsx`. This includes SVG decorations, instructional text, markup, CSS classes, native drag-and-drop event handlers, click placement/removal, and result presentation. Return labels now say “Return to Introduction”; the final threshold delegates to tested logic.
- `iambic-pentameter/src/App.tsx`: retains the export's landscape/footer markup and screen composition; state management and action wiring were replaced.
- `iambic-pentameter/src/main.tsx`, `src/vite-env.d.ts`, and `tsconfig.json`: reused scaffold from the export.

## New Codex-authored implementation

- `src/game/validation.ts`: exact-length and intended-order validation.
- `src/game/tiles.ts`: immutable placement/swapping/removal, board/ID/index guards, empty-board creation.
- `src/game/state.ts`: reducer with screen guards, per-round award tracking, retries, skips, progression, and restart.
- `src/App.tsx`: reducer integration and dispatch callbacks.
- `tests/poetry-*.test.ts`: deterministic tests importing production modules.
- Minimal `vite.config.ts` and `index.html`, workspace registration, documentation. The workspace package manifest follows the existing Shakespeare dependency versions.

This work was implemented by Codex at the user's request with stated professor permission. Reused Figma-generated material and newly Codex-authored material should not be described as independently handwritten student code. This document does not certify any authorship percentage or the course's method of calculating it.

## Gameplay contract

Ten fixed challenges, five phrase tiles each. Validation recognizes only the intended order, not general meter. A failed check reveals the intended line; retry preserves the arrangement. Continuing after failure earns no point. A later successful retry earns one point, with at most one award per round. Reset Line preserves the score. After the tenth round, scores of eight or more get the stronger ending. Play Again resets all progress; Return to Introduction resets to the lesson. Progress is in memory only.

## Manual acceptance checklist

Run `npm run dev:poetry` and open http://localhost:8445. Check bank-to-slot placement, occupied-slot replacement, slot swaps, drag back to the bank, click placement/removal, keyboard activation and focus, failed submission/retry, skipping, reset, ten-round completion, and replay. Inspect narrow and wide layouts. Native drag-and-drop and visual layout require browser verification beyond the pure unit suite.

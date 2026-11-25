# Iambic pentameter implementation and provenance

The new `iambic-pentameter` npm workspace implements the ten-round Poetry Builder from the local `Iambic Pentameter Side Quest` Figma Make export. The original export is a reference, not a workspace or submission dependency.

## Reused Figma-generated material

- `iambic-pentameter/src/data/poemChallenges.ts`: all ten challenge definitions, types, factory, tile IDs, fixed scrambled orders, hints, and scansion are copied from the export. The old validator was removed.
- The original React screens and stylesheet adapted the export’s parchment design, decorations, lesson, board, and result text. SCRUM-43 ports that presentation and its interactions to the Konva class in `src/PoetryView.ts`.

## New Codex-authored implementation

- `src/game/validation.ts`: complete-board and accepted-arrangement validation.
- `src/game/tiles.ts`: immutable placement/swapping/removal, board/ID/index guards, empty-board creation.
- `src/game/state.ts`: reducer with screen guards, per-round award tracking, retries, skips, progression, and restart.
- `src/PoetryModel.ts` owns reducer state. `src/PoetryController.ts` coordinates view callbacks and reports the final score once per playthrough. `src/main.ts` mounts home navigation and supplies the worksheet completion action.
- `tests/poetry-*.test.ts`: deterministic tests importing production modules.
- Minimal `vite.config.ts` and `index.html`, workspace registration, documentation. The workspace declares Konva as its runtime dependency.

This work was implemented by Codex at the user's request with stated professor permission. Reused Figma-generated material and newly Codex-authored material should not be described as independently handwritten student code. This document does not certify any authorship percentage or the course's method of calculating it.

## Gameplay contract

Ten fixed challenges, five phrase tiles each. Validation recognizes the reviewed arrangements for each challenge. A failed check shows a hint. Retry clears the line. Continuing after failure earns no point. A later successful retry earns one point, with at most one award per round. Reset Line preserves the score. After the tenth round, scores of eight or more get the stronger ending. Play Again starts a fresh poetry game. Worksheet launches offer Return to Worksheet on the final screen. Return to Introduction resets the poetry game to the lesson. Progress is in memory only.

## Manual acceptance checklist

Run `npm run dev:poetry` and open http://localhost:5187. Check bank-to-slot placement, occupied-slot replacement, slot swaps, drag back to the bank, click placement/removal, keyboard activation and focus, failed submission/retry, skipping, reset, ten-round completion, and replay. Inspect narrow and wide layouts. Canvas drag-and-drop and visual layout require browser verification beyond the pure unit suite.

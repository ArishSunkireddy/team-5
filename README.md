# team-5

CSE 110 Team 5

## Setup

Requires Node 22.12+ (or 24+). Install once from the repo root — this installs every game:

```
npm install
```

Don't run `npm install` inside a game folder, and don't commit `node_modules` or any lockfile other than the root `package-lock.json`.

## Commands (run from the repo root)

| Command | What it does |
|---|---|
| `npm run dev:poe` | Edgar Allan Poe game at http://localhost:8443 |
| `npm run dev:shakespeare` | Shakespeare game at http://localhost:8444 |
| `npm run dev:poetry` | Iambic pentameter game at http://localhost:8445 |
| `npm run typecheck -w iambic-pentameter` | Type-check the poetry workspace |
| `npm test` | Runs everything in `tests/` |
| `npm run build` | Builds every game |

To add a dependency to one game: `npm install <package> -w <game-folder>`.

## Layout

Each game is its own folder (an npm workspace) with its own Vite app. Shared tests live in `tests/`.

## Poetry Builder

The `iambic-pentameter/` workspace contains ten poetry-ordering challenges. Drag tiles into the five slots, between slots to swap, or back to the bank. Click (or keyboard-activate) a bank tile to fill the first empty slot; activate a filled slot to remove its tile. Check Answer compares the exact intended order. Incorrect answers can be retried or skipped; each solved round awards at most one point. Play Again resets the quest. Return to Introduction returns to the lesson, not another game.

Run all tests with `npm test`, or only poetry tests with:

```sh
npm test -- tests/poetry-data.test.ts tests/poetry-validation.test.ts tests/poetry-tiles.test.ts tests/poetry-state.test.ts
npm run typecheck -w iambic-pentameter
npm run build
```

Tests cover production data, exact-order validation, immutable tile operations, invalid input, scoring, retries, skipping, all ten rounds, and restart. See [implementation provenance](docs/iambic-pentameter-skills-check.md) for Figma-generated material reused and new Codex-authored work. The original `Iambic Pentameter Side Quest/` export is only a local reference; do not include it or `node_modules/` in the feature commit.

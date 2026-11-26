# Out of Print - Team 5

A short literary game to help students learn about famous authors throughout time.

## Setup

Requires Node 22.12+ (or 24+). Install once from the repo root — this installs every game:

```
npm install
```

Don't run `npm install` inside a game folder, and don't commit `node_modules` or any lockfile other than the root `package-lock.json`.

## Commands (run from the repo root)

| Command | What it does |
|---|---|
| `npm run dev:basho-mvc` | Matsuo Basho game at http://localhost:5184 |
| `npm run dev:poe-mvc` | Edgar Allan Poe game at http://localhost:5185 |
| `npm run dev:shakespeare-mvc` | Shakespeare game at http://localhost:5186 |
| `npm run dev:poetry` | Iambic pentameter game at http://localhost:5187 |
| `npm run dev:trivia` | Trivia game at http://localhost:5188 |
| `npm test` | Runs everything in `tests/` |
| `npm run test:coverage` | Same, plus a coverage report in `coverage/` (fails under the thresholds in `vitest.config.ts`) |
| `npm run test:e2e` | Builds every game, then opens each one in a real browser (Playwright) to check it starts. First time only: `npx playwright install chromium` |
| `npm run typecheck` | `tsc --noEmit` on every workspace |
| `npm run lint` | oxlint (warnings count as failures) |
| `npm run format:check` | oxfmt check (advisory in CI for now) |
| `npm run check:lockfile` | Checks `package-lock.json` is in sync and has the Linux binaries CI needs |
| `npm run verify` | Lockfile check + lint + typecheck + tests with coverage + build (what the pre-push hook runs) |
| `npm run build` | Builds every game |
|`npm run dev:menu`| Main Menu at htnpm tp://localhost:5173|
|`npm run dev:all`| Builds every game and allows you to enter the main menu. Which is accessed at http://localhost:5173|

To add a dependency to one game: `npm install <package> -w <game-folder>`.

## CI

`.github/workflows/ci.yml` runs on every push/PR to `main`. Jobs run in parallel:

| Job | Catches |
|---|---|
| `lockfile` | `package.json`/lockfile out of sync, missing Linux native binaries (Tailwind/rolldown), extra lockfiles |
| `lint` | oxlint warnings (unused code, etc.) |
| `typecheck` | TypeScript errors in every workspace (e.g. a missing import) |
| `test` | Vitest suite + coverage floors, including repo-structure, menu-link and game-data checks |
| `build` | Any game failing `vite build`, or producing no `dist/index.html` |
| `e2e (smoke)` | A built game that crashes or renders nothing in a real browser |
| `spelling` | Common misspellings ([typos](https://github.com/crate-ci/typos); config in `_typos.toml`) |
| `format`, `security` | Advisory only for now: oxfmt formatting and `npm audit` |

**Pre-push hook.** `npm install` sets up a git hook that runs `npm run verify` before every `git push`, so most CI failures show up on your machine first. In an emergency, skip it with `git push --no-verify`.

**Lockfile rules.** Don't delete or regenerate `package-lock.json`: on Windows/macOS npm drops the Linux binaries CI needs. Use plain `npm install <package> -w <game>`. If `check:lockfile` complains, restore the lockfile from main (`git checkout origin/main -- package-lock.json`) and run `npm install`.

**Adding a game.** Add it to `workspaces` in the root `package.json`, give it an `index.html`, `tsconfig.json`, `build`/`preview` scripts, add `tsc --noEmit -p <game>` to the root `typecheck` script, and add it to `e2e/targets.ts`. `tests/workspaces.test.ts` tells you what's missing.

Coverage floors are set just under the current numbers, so they only fail a PR that lowers coverage. Raise them in `vitest.config.ts` as we add tests. Dependabot opens weekly dependency PRs.

## Layout

Each game is its own folder (an npm workspace) with its own Vite app. Shared tests live in `tests/`.

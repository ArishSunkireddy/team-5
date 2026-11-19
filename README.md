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
| `npm run dev:poe-mvc` | Matsuo Basho game at http://localhost:5184 |
| `npm run dev:poe-mvc` | Edgar Allan Poe game at http://localhost:5185 |
| `npm run dev:shakespeare` | Shakespeare game at http://localhost:5186 |
| `npm run dev:poetry` | Iambic pentameter game at http://localhost:5187 |
| `npm run dev:trivia` | Trivia game at http://localhost:5188 |
| `npm run typecheck -w iambic-pentameter` | Type-check the poetry workspace |
| `npm test` | Runs everything in `tests/` |
| `npm run build` | Builds every game |
|`npm run dev:menu`| Main Menu at htnpm tp://localhost:5173|
|`npm run dev:all`| Builds every game and allows you to enter the main menu. Which is accessed at http://localhost:5173|

To add a dependency to one game: `npm install <package> -w <game-folder>`.

## Layout

Each game is its own folder (an npm workspace) with its own Vite app. Shared tests live in `tests/`.

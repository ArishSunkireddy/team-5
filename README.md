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
| `npm test` | Runs everything in `tests/` |
| `npm run build` | Builds every game |

To add a dependency to one game: `npm install <package> -w <game-folder>`.

## Layout

Each game is its own folder (an npm workspace) with its own Vite app. Shared tests live in `tests/`.

# Project Logs

Generated from origin/main on 2026-04-23 21:14:00 -04:00.

## Latest Commits

- `4fa7e9b` | 2026-04-23T21:10:47-04:00 | **784594** | Fix arcade UI issues and wire Pac-Man maze update
- `3f3f4bd` | 2026-04-20T22:13:39-04:00 | **784594** | Create CNAME
- `b121416` | 2026-04-20T21:57:15-04:00 | **784594** | Delete CNAME
- `ceb1437` | 2026-04-20T21:57:04-04:00 | **784594** | Update CNAME
- `1ff581f` | 2026-04-20T21:55:27-04:00 | **784594** | Create CNAME
- `caeabc3` | 2026-04-20T21:52:19-04:00 | **Playr** | Upload Playr project without oversized dataset files

## Notes
- Keep this file for quick human-readable history.
- Use `commit-history.csv` for full commit metadata.
- Use `file-last-change.csv` to see latest change date per file.
- 2026-04-23: Added the Google AdSense Auto ads loader snippet to the `<head>` of every HTML entry page across the site so ads can be served consistently once AdSense is enabled. Files: `index.html`, `games/index.html`, `games/single-player/*/index.html`, `games/two-player/*/index.html`.
- 2026-04-23: Shipped a multi-game polish pass. Frogger now uses a larger cleaner board layout with rotating level patterns, Pac-Man now uses the updated custom maze with matching dynamic board dimensions and automatic life resets, Flappy Bird buttons now match the site theme and pipe gaps tighten more smoothly, Sudoku no longer color-reveals right/wrong entries and starts its timer on first input, and Infinite Craft room creation now writes to the Firestore collection allowed by rules. Files: `games/single-player/frogger/game.js`, `games/single-player/frogger/game.css`, `games/single-player/pac-man/game.js`, `games/single-player/flappy-bird-clone/game.js`, `games/single-player/flappy-bird-clone/game.css`, `games/single-player/sudoku/game.js`, `games/single-player/sudoku/game.css`, `games/single-player/infinite-craft-clone/game.js`, `games/two-player/infinite-craft-multiplayer/game.js`, `app.js`.
- 2026-04-23: Refined Pac-Man ghost behavior by removing stray ghost-house UI artifacts, slowing the overall game pace, letting ghosts overlap instead of sticking, adding floating eyes that return home after a ghost is eaten, extending ghost re-entry timing, and keeping chained frightened-ghost scoring at 200, 400, 800, and 1600 within a single power pellet. Files: `games/single-player/pac-man/game.js`.
- 2026-04-22: Optimized Infinite Craft dataset extraction by adding a resumable `infinite-craft.gg` chunk importer, resume-from-output support, and updated recipe extraction docs. Files: `scripts/fetch-infinite-craft-recipes.mjs`, `README.md`.
- 2026-04-22: Finished the full Infinite Craft recipe dataset at 3,470,353 recipes, split it into shared Git-safe chunks, removed hardcoded craft-result overrides from both Infinite Craft games, and updated the recipe docs. Files: `data/infinite-craft-recipes/`, `games/single-player/infinite-craft-clone/game.js`, `games/two-player/infinite-craft-multiplayer/game.js`, `scripts/split-infinite-craft-recipes.mjs`, `README.md`.
- 2026-04-22: Reset Infinite Craft saved progress and shared-room state versions so old custom blocks no longer carry over for single-player or multiplayer users. Files: `games/single-player/infinite-craft-clone/game.js`, `games/two-player/infinite-craft-multiplayer/game.js`.

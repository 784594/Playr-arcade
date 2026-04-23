# Project Logs

Generated from origin/main on 2026-04-21 17:02:27 -04:00.

## Latest Commits

- `3f3f4bd` | 2026-04-20T22:13:39-04:00 | **784594** | Create CNAME
- `b121416` | 2026-04-20T21:57:15-04:00 | **784594** | Delete CNAME
- `ceb1437` | 2026-04-20T21:57:04-04:00 | **784594** | Update CNAME
- `1ff581f` | 2026-04-20T21:55:27-04:00 | **784594** | Create CNAME
- `caeabc3` | 2026-04-20T21:52:19-04:00 | **Playr** | Upload Playr project without oversized dataset files
- `3bcd690` | 2026-04-20T21:35:53-04:00 | **784594** | Initial commit

## Notes
- Keep this file for quick human-readable history.
- Use `commit-history.csv` for full commit metadata.
- Use `file-last-change.csv` to see latest change date per file.
- 2026-04-22: Optimized Infinite Craft dataset extraction by adding a resumable `infinite-craft.gg` chunk importer, resume-from-output support, and updated recipe extraction docs. Files: `scripts/fetch-infinite-craft-recipes.mjs`, `README.md`.
- 2026-04-22: Finished the full Infinite Craft recipe dataset at 3,470,353 recipes, split it into shared Git-safe chunks, removed hardcoded craft-result overrides from both Infinite Craft games, and updated the recipe docs. Files: `data/infinite-craft-recipes/`, `games/single-player/infinite-craft-clone/game.js`, `games/two-player/infinite-craft-multiplayer/game.js`, `scripts/split-infinite-craft-recipes.mjs`, `README.md`.
- 2026-04-22: Reset Infinite Craft saved progress and shared-room state versions so old custom blocks no longer carry over for single-player or multiplayer users. Files: `games/single-player/infinite-craft-clone/game.js`, `games/two-player/infinite-craft-multiplayer/game.js`.

# Playr

Playr is a polished static front end for a multi-game arcade hub. It focuses on a featured-first homepage, searchable game tabs, support content, and game-specific leaderboard placeholders.

## Current layout

- Featured game hero with daily tab-specific rotation
- Searchable library tabs for All Games, 1P Games, 2P Games, Competitive, and Leaderboard
- In-place expandable game cards with metadata
- Leaderboard previews with top 5 and expand-to-top 100 behavior for eligible games
- Support section with About copy and a donation button

## Current games

- Single-player placeholders, including Snake, Minesweeper, 2048, and other arcade-style entries
- Two-player placeholders for head-to-head play
- Competitive titles with leaderboard support where applicable

## How to use

Open `index.html` in a browser. The site is fully static and does not require a build step.

## Publishing updates (every change)

Use this flow any time you edit files and want the live site updated:

1. Save your file changes.
2. Update the logs in `updates/` (required for every future change):
   - Append a short summary in `updates/logs.md`
   - Refresh `updates/commit-history.csv` and `updates/file-last-change.csv` when needed
3. Commit and push to `main`:

```bash
git add .
git commit -m "Describe what changed"
git push origin main
```

4. Wait for GitHub Pages to deploy automatically (usually under 2 minutes).
5. Hard refresh the live site (or use an incognito tab) to confirm the latest UI/code is live.

### Logging policy (required)

- Every update/file change must be recorded in `updates/logs.md`.
- Keep log entries concise and include date, what changed, and affected files/features.
- If a commit is pushed, make sure logs are updated in the same commit whenever possible.
- Exception: do not add entries to `updates/` for admin-panel-only changes.

If `git` is not recognized in your terminal on Windows, run Git with a full path:

```powershell
& "C:\Program Files\Git\cmd\git.exe" add .
& "C:\Program Files\Git\cmd\git.exe" commit -m "Describe what changed"
& "C:\Program Files\Git\cmd\git.exe" push origin main
```

Tip: check the repository Actions tab after each push to confirm the Pages deployment succeeded.

## Firestore rules setup

If you see "Firestore permission denied" while signing up, changing display name, or joining multiplayer rooms, your Firestore rules are too strict for this project.

1. Open Firebase Console for project `playr3`.
2. Go to Firestore Database -> Rules.
3. Replace rules with the contents of `firestore.rules` from this repo.
4. Publish rules.

If Firebase CLI is available on your machine, you can deploy with:

```bash
firebase deploy --only firestore:rules
```

## Notes

- Minesweeper is surfaced through the library cards instead of a standalone homepage section.
- Leaderboards are intentionally game-specific instead of using one universal score format.
- The homepage is designed to stay compact, with secondary sections hidden until needed.
- UI policy: do not use native browser dialogs (`alert`, `confirm`, `prompt`); use in-app panels/modals for all confirmations and inputs.
- Placeholder and status badges are hidden from game cards to maintain a polished, quality-focused hub. Only fully implemented games are showcased.

## Infinite Craft recipe dataset extraction

If you want to rebuild or extend the local recipe dataset yourself, use:

- [scripts/fetch-infinite-craft-recipes.mjs](scripts/fetch-infinite-craft-recipes.mjs)

This script can:

- fetch from zero (full rebuild)
- fetch in chunks (for example 1M, then next 1M, then remaining 1M, then the remainder)
- skip already-known recipe keys from existing files
- resume after interruption via checkpoint JSON
- use the fast `infinite-craft.gg` chunk dataset by default
- fall back to the slower `infinibrowser.wiki` per-item crawler with `--source infinibrowser`

Recommended four-file layout:

1. `data/wiki-recipes-part-1.json` or your current base file
2. `data/wiki-recipes-part-2.json`
3. `data/wiki-recipes-part-3.json`
4. `data/wiki-recipes-part-4.json`

The game loader now merges all four chunk files automatically, plus the legacy `wiki-recipes-lite.json` if it is still present.

Recommended fast workflow:

1. If you already have the current `~1.0M` legacy file, build the next chunk by skipping it:

```powershell
node scripts/fetch-infinite-craft-recipes.mjs --source icgg --mode chunk --target-new 2470353 --existing games/single-player/infinite-craft-clone/data/wiki-recipes-lite.json --output data/wiki-recipes-part-2.json --checkpoint data/wiki-recipes-part-2.checkpoint.json
```

2. If you want a fresh full rebuild from zero:

```powershell
node scripts/fetch-infinite-craft-recipes.mjs --source icgg --mode full --target-new 3470353 --output data/wiki-recipes-full.json --checkpoint data/wiki-recipes-full.checkpoint.json
```

3. If you specifically want the old crawler instead of the fast chunk import:

```powershell
node scripts/fetch-infinite-craft-recipes.mjs --source infinibrowser --mode chunk --target-new 1000000 --existing games/single-player/infinite-craft-clone/data/wiki-recipes-part-1.json --output data/wiki-recipes-part-2.json --checkpoint data/wiki-recipes-part-2.checkpoint.json
```

Notes:

- `icgg` is the default source now, so `--source icgg` is optional.
- The script reuses `--existing` files to skip known recipe keys.
- The script also resumes from a partially written `--output` file if one already exists.
- `data/wiki-recipes-part-2.checkpoint.json` now tracks chunk progress instead of item-id progress when using the fast source.
- The repo-friendly shared dataset lives in `data/infinite-craft-recipes/` and can be regenerated with `scripts/split-infinite-craft-recipes.mjs`.

## Next steps

- Replace placeholder game data with real titles and scoring rules
- Connect leaderboard data to persistent storage
- Add authentication and multiplayer session flow

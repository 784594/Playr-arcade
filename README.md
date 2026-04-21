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

## Next steps

- Replace placeholder game data with real titles and scoring rules
- Connect leaderboard data to persistent storage
- Add authentication and multiplayer session flow

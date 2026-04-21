# Global Leaderboard Plan

This project should use global leaderboards as a core retention feature, not as an afterthought.

## Product goals

- Give every player a reason to replay games and improve rank.
- Keep leaderboard rules specific to each game metric.
- Support both single-player and multiplayer rating styles.

## Recommended architecture

- Front end: existing static hub and game pages.
- API layer: lightweight service for score submission and rank queries.
- Database: PostgreSQL with indexes per game and metric segment.
- Auth: optional guest mode + account mode, with stable player IDs.

## Data model

Core tables:

- players: player profile and public display name
- games: game slug and metric policy
- score_entries: one row per submitted run/match
- leaderboard_views: denormalized top results by game and segment

Suggested score entry fields:

- id
- player_id
- game_slug
- mode_segment (for example easy/medium/hard)
- metric_name
- metric_value
- score_payload_json (extra context such as moves, seed, duration)
- created_at
- verification_status

## Anti-cheat baseline

- Validate payload shape per game server-side.
- Clamp impossible values based on game rules.
- Add replay hash or deterministic seed checks where possible.
- Rate-limit submissions by player and IP.
- Mark suspicious runs for manual review.

## Ranking behavior

- Support both descending metrics (highest score) and ascending metrics (fastest time).
- Keep separate boards for segmented games (for example Minesweeper easy/medium/hard).
- Store best-per-player and all-time history separately.

## Auth policy

- Viewing leaderboards: public (no login required).
- Submitting or updating a personal high score: login required.
- If a guest achieves a high score candidate, prompt login and submit only after successful authentication.
- Keep score entries tied to a stable account ID, not display name only.

## API endpoints (first version)

- GET /api/leaderboards/:gameSlug?segment=easy&limit=50
- GET /api/leaderboards/:gameSlug/player/:playerId
- POST /api/scores/submit
- GET /api/games/manifest

## Rollout phases

Phase 1:

- Minesweeper global board by difficulty.
- Snake global score board.
- 2048 global highest tile board.

Phase 2:

- Multiplayer Elo/rating boards for Battleship and Connect 4.
- Profile pages with per-game best records.

Phase 3:

- Seasons, badges, country filters, and friend leaderboards.
- Automated cheat-confidence scoring.

## Notes for current repo

- Game metadata and leaderboard metric policy are tracked in [data/games-manifest.json](../data/games-manifest.json).
- Keep leaderboard metric naming stable to avoid migration churn.

# Workspace Instructions

- Use the current folder as the project root.
- Keep the arcade hub polished, responsive, and focused on quality over quantity.
- Prefer a strong visual hierarchy, bold spacing, and reusable data-driven UI.
- Preserve the leaderboards as game-specific metrics instead of forcing one universal score format.
- Use simple static front-end files unless a real build step is explicitly added later.
- Never use native browser dialogs (`alert`, `confirm`, `prompt`) for user actions; use in-app UI panels/modals instead.
- Any time you make a real site change, update `updates/logs.md` in the same change set.
- Any time you make a user-visible release, public warning, maintenance note, or public moderation/system announcement, also add a short public-safe entry to `shared/site-notices.js` so it appears in the bell notification system.
- Keep `shared/site-notices.js` free of personal data, private evidence, passwords, internal-only notes, or account-specific private moderation details.

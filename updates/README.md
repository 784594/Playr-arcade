# Updates Folder

This folder stores project change logs generated from git history.

## Files
- `logs.md`: human-readable recent commits from `origin/main`.
- `commit-history.csv`: commit hash, author, timestamp, subject.
- `file-last-change.csv`: latest change timestamp per tracked file.

## Required Process
- Every real code/content change must add a concise entry to `updates/logs.md`.
- If the change is user-visible or is a public-facing warning/maintenance/system notice, add a matching short summary to `shared/site-notices.js` so it appears in the site bell dropdown.
- Keep bell notices public-safe. Do not include personal info, private moderation evidence, internal-only notes, passwords, or account-specific private actions.

## Refresh Commands
Run these when you want to regenerate logs:

```powershell
# Re-run the log generation block used by Codex, or ask Codex: "refresh updates logs"
```

# Agent entrypoint

Before changing this project, read these files in order:

1. `HANDOFF.md` — current status, architecture, verified behavior, and next steps.
2. `docs/MYUCLA_CONTRACT.md` — exact fail-closed MyUCLA DOM/button contract.
3. `PRIVACY.md` — allowed data and storage boundaries.
4. `DEVELOPMENT_LOG.md` — user-requested task history, verification and outstanding follow-ups.

After completing each requested update, append or update its entry in
`DEVELOPMENT_LOG.md` before handoff. Record the request, concrete changes,
affected files, checks actually run, user verification and remaining limits.
Record follow-up corrections separately; do not erase failed attempts or claim
fictional-browser checks verified the authenticated MyUCLA page. Use the user's
local date; if a historical date is unknown, say so instead of inventing it.
Keep real course names and account-specific page content out of this log.

Non-negotiable rules:

- Never click or automate Enroll, Drop, Remove, Exchange, or Waitlist.
- Never request, inspect, log, or store passwords, cookies, tokens, UID, grades, DARS, or Duo data.
- Do not add polling or extra MyUCLA requests without explicit user approval and a fresh privacy review.
- Keep the exact Class Planner path permission; do not broaden to all MyUCLA pages.
- Reordering must use the strictly validated native up/down buttons and retain user confirmation.
- If the MyUCLA DOM contract changes, fail closed. Do not replace exact checks with fuzzy button matching.
- Do not copy real course names or account-specific page content into fixtures, logs, screenshots, or commits.

Required checks before handoff:

```bash
npm run typecheck
npm test -- --run
npm run build
```

The project lives at https://github.com/comet-ctrl/myucla-workspace. Anyone may
open a pull request; only the maintainer merges. See `CONTRIBUTING.md`.

`dist/` is a build artifact and is not committed. Run `npm run build` after cloning.

Branch workflow: `main` is the permanent development/default branch. Work on
`main` for routine authorized updates; use short-lived descriptive branches for
substantial isolated changes. Do not create or rename branches for version bumps.
Version numbers belong in manifests and deliberate release tags.

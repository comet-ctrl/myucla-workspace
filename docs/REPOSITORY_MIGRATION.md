# Standalone project — 2026-10-05

> Migration snapshot at v0.19.4. The later v0.19.5 branding pass adopts the
> MyUCLA Workspace name. See the current [README](../README.md).

Development continues at https://github.com/comet-ctrl/myucla-workspace on
`workspace-v0.19.4`, the default branch. This is a standalone GitHub repository,
with the complete ancestry of the transferred branch, rather than another fork
in GitHub's fork network.

The extension remains Better MyUCLA. Its permissions, storage keys and installed
folder are unchanged by this repository move. A repository move does not reload
or install a new extension in Chrome.

## What was transferred

- The local v0.19.2–v0.19.4 docking, presets, header and calendar work.
- The latest remote workspace history, including contributor PR #2, merge
  `b90faff`, with viewport, course-tool and dark help-widget improvements.
- Original commits, authorship, MIT license and Aaron Wen's copyright notice.
- Current documentation, fictional fixtures, tests and production preview.

This project derives from [Astro-wen's Better MyUCLA planner](https://github.com/Astro-wen/better-myucla-planner).
The separate repository reflects its independently maintained workspace design;
it does not change the attribution or imply UCLA affiliation.

## Current branch workflow

After migration, development was consolidated onto permanent `main`.
`workspace-v0.19.5` was renamed to `main`; the fully included
`workspace-v0.19.4` branch was replaced by the `baseline-v0.19.4` tag in the
standalone repository. No commits were dropped and no release was published.
Future version bumps stay on `main`; substantial changes may use short-lived
descriptive branches. See [Contributing](../CONTRIBUTING.md).

## Historical branch naming

The initial migration used `<purpose>-v<version>` names. That convention
was subsequently replaced by the permanent `main` workflow above. CI runs
on every branch; releases remain separate, explicit publication milestones.

The historical repository is https://github.com/comet-ctrl/better-myucla-planner.
Its branches were renamed as follows, preserving their commit histories:

| Previous name | Versioned name |
| --- | --- |
| `main` | `main-v0.18.6` |
| `planner-improvements` | `planner-improvements-v0.13.0` |
| `planner-redesign` | `planner-redesign-v0.17.11` |
| `flexible-panels` | `flexible-panels-v0.18.6` |
| `v0.19-workspace` | `workspace-v0.19.4` |

The historical workspace branch receives the combined v0.19.4 migration
snapshot. Only that newest branch is continued in the new repository; older
branches, issues, pull requests, release records and ZIP downloads stay in the
historical repository. Neither repository is deleted or archived.

## Working locally

```sh
git clone https://github.com/comet-ctrl/myucla-workspace.git
cd myucla-workspace
npm ci
npm run typecheck
npm test -- --run
npm run build
```

Load the generated `dist` folder as an unpacked Chrome extension. See README
for update instructions. `dist` remains untracked. Pages publication is manual
and requires enabling GitHub Pages; the migration does not publish a new site
or create a new release.

For the existing maintainer checkout, `origin` points to the standalone
repository, `fork` preserves the historical repository, and `upstream` points
to Astro-wen's original project.

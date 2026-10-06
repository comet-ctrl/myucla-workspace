# Release checklist

Use commits for routine progress. Publish a release when a coherent, tested
milestone is ready for people to install.

- [ ] Match package, lockfile and manifest versions on `main`; no version branch is needed.
- [ ] Validate a clean dependency install with the release runner's Node 22/npm 10
      toolchain before tagging. `npm exec --yes --package=npm@10.9.9 -- npm ci`
      checks the current runner's npm version. A working existing node_modules
      folder does not prove the committed lockfile can install cleanly.
- [ ] Update README, CHANGELOG, HANDOFF and DEVELOPMENT_LOG with actual results.
- [ ] Run typecheck, all unit tests and the production build.
- [ ] Run browser fixtures appropriate to the changes, including light/dark,
      narrow layouts, keyboard access and Original layout restoration.
- [ ] Complete authorized live-page verification without changing enrollment.
      Clearly record anything still unverified.
- [ ] Generate the fictional preview from the same build and inspect it visually.
- [ ] Check the ZIP contains `dist/manifest.json`, icons, LICENSE and CREDITS.md;
      exclude logs, account data and installed-browser state.
- [ ] Test installation/update from the packaged folder; retain storage keys and
      permissions unless a separately reviewed change requires migration.
- [ ] Push a matching `vX.Y.Z` tag when ready to prepare a release. The workflow
      creates a **draft** with `myucla-workspace-vX.Y.Z.zip` for review.
- [ ] Review the draft, mark prerelease where appropriate, then publish it and
      update download links. Do not point users to an unpublished asset.

Chrome Web Store submission is a separate publishing step. Use the same
branding, current privacy policy, fictional screenshots and support URL.

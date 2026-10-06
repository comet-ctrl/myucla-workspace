<div align="center">
<img src="public/icons/workspace.svg" width="80" alt="MyUCLA Workspace pane icon">

# MyUCLA Workspace

**Your courses. Your schedule. Your workspace.**

A customizable Chrome extension for planning courses inside MyUCLA Class Planner.
Maintained by [comet-ctrl](https://github.com/comet-ctrl).

[Install](#install-or-update) · [Documentation](docs/README.md) · [Report an issue](https://github.com/comet-ctrl/myucla-workspace/issues) · [Privacy](PRIVACY.md)
</div>

Arrange course browsing, details and the weekly schedule together. Drag panels
into tab groups, split the workspace, or float a panel where you need it.
Your arrangement is saved in your browser.

**Unofficial; not affiliated with or endorsed by UCLA.** The extension changes
presentation within Class Planner and preserves UCLA's original controls.

## What you can do

- **Keep the schedule in view.** Browse courses and compare sections beside the native calendar.
- **Make the layout yours.** Drag, resize, close and reopen panels; choose visual presets in Settings.
- **Compare details.** Open several courses, with room, instructor, meeting time and original section status available.
- **Choose your appearance.** System, light or dark, with a compact header and local panel scrolling.
- **Organize your plan.** Reorder classes, see existing conflicts and add local notes. Reordering is written to MyUCLA only when you choose **Save to MyUCLA**.
- **Keep native functions accessible.** Plan actions, Optimizer, Study list, Personal entries, help and the original layout remain available.

Native search still requires UCLA's autocomplete choices and loading steps.
This extension does not fetch an entire course catalog, interpret DARS, check
prerequisites or automate enrollment.

## Install or update

**Current source: v0.19.5**, on `workspace-v0.19.5`. This branding build is not
published to the Chrome Web Store. Build from source for the current version:

```sh
git clone https://github.com/comet-ctrl/myucla-workspace.git
cd myucla-workspace
npm ci
npm run build
```

1. Keep the checkout in a permanent folder.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Choose **Load unpacked** and select the generated **dist** folder.
4. Open [MyUCLA Class Planner](https://be.my.ucla.edu/ClassPlanner/ClassPlan.aspx).
5. Open the **MyUCLA Workspace** extension popup and enable **Workspace layout**.

**Updating Better MyUCLA:** replace the files in the same `dist` folder Chrome
already loads, click **Reload** on the extension card, then refresh Class Planner.
Keeping the same loaded folder preserves the extension identity and browser
preferences. Existing storage keys are retained. Avoid loading a second copy
alongside the first.

Future release ZIPs are named `myucla-workspace-vX.Y.Z.zip` and contain a `dist`
folder. [Historical Better MyUCLA releases](https://github.com/comet-ctrl/better-myucla-planner/releases)
remain available for rollback; they do not include the new identity or all current changes.

## Make it yours

Drag a tab or dotted grip to group, split or float a panel. A shaded preview
shows its destination; **Escape** cancels. Resize panels using their edges or
dividers. Close a tab with **×**, and reopen it through navigation.

**Settings** offers visual layout presets. **Layout settings** contains
**Default layout** and **Original layout**. These currently have separate
entries; consolidating them is on the [roadmap](docs/PRODUCT_ROADMAP.md).

For multiple courses, use **Details** on each. Rooms, instructors and section
controls remain available; final-exam notes have a disclosure. Close details
with **×** or Escape. **Course tools** provides local reorder and note controls.

With the header compacted, move to the top edge to reveal UCLA's navigation
or use **Show header** to keep it visible. Original layout restores the native
presentation. Appearance and layout choices stay in this browser profile.

## Privacy

The only page match is `https://be.my.ucla.edu/ClassPlanner/ClassPlan.aspx`;
`storage` is the only extension permission. There is no project server,
telemetry or background seat polling. Layout preferences and notes stay local.

The extension does not read credentials, grades or DARS, and does not automate
enrollment, dropping, exchanges or waitlisting. UCLA's manual actions remain
native. See [PRIVACY.md](PRIVACY.md) for exact storage and session behavior.

## Build and test

```sh
npm run typecheck
npm test -- --run
npm run build
npm run preview:build
```

Open `site/workspace-preview.html` for an interactive **fictional** preview
using the production presentation modules. It does not connect to an account.
Some native actions and secondary modules are approximations; the preview is
not evidence of live-site compatibility.

Browser fixtures require Playwright Chromium or an installed Chromium path in
`BETTER_MYUCLA_CHROMIUM`. Relevant checks include `test:dark-mode`,
`test:header-reveal`, `test:calendar-gridlines`, `test:workspace-splits`,
`test:workspace-settings` and `preview:verify`. The vector icon is editable in
`public/icons/workspace.svg`; `npm run icons:build` regenerates Chrome's PNGs.

The combined v0.19.4 baseline passed 565 unit tests, typecheck, build and targeted
browser regressions. See [HANDOFF.md](HANDOFF.md) for current v0.19.5 verification
and remaining live-page checks. No claim is made that every native account
workflow has been exercised.

## Contribute

Start with the [product roadmap](docs/PRODUCT_ROADMAP.md) and
[contribution guide](CONTRIBUTING.md). Use issues to report a reproducible problem
or propose a clearer workflow. Use fictional or redacted examples.

Releases are tested milestones; everyday fixes use commits and pull requests.
The [release checklist](docs/RELEASE_CHECKLIST.md) describes packaging and verification.
Historical design notes are indexed under [documentation](docs/README.md).

## Credits and license

Derived from [Better MyUCLA by Aaron Wen (Astro-wen)](https://github.com/Astro-wen/better-myucla-planner),
with subsequent work by comet-ctrl and contributors. Original history and
copyright attribution are preserved. See [CREDITS.md](CREDITS.md) and the
[MIT license](LICENSE).

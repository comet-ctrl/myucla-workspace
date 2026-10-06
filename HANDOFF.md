# MyUCLA Workspace — Agent handoff

Last updated: 2026-10-05

Current development version: `0.19.5`, branch `main`.
Installed files: `0.19.4` (Chrome reload requested). Published: `v0.19.1` prerelease.

## Permanent main workflow

`main` is now the permanent default/development branch. The prior
`workspace-v0.19.5` branch was renamed; v0.19.4 is retained by the
`baseline-v0.19.4` tag. The standalone repository has one working branch.
Use temporary descriptive branches only when useful for substantial changes,
and deliberate version tags for releases. Do not create branches for each
version bump. Historical branch names below record earlier work.

## v0.19.5 product identity

MyUCLA Workspace is the product and extension name. The pane mark uses an
indigo/mint palette independent of UCLA branding. The popup retains every
setting and handler, with shorter explanations and privacy/support/credit links.
The opt-in tidy setting is now labeled Workspace layout. Storage keys, message
channels, DOM ownership identifiers and exact page permissions remain unchanged.
The new package includes LICENSE and CREDITS.md. README and install page now
lead with current source installation; historical releases remain separately linked.
The installed extension folder has not been changed in this branding pass.
Verification: typecheck, all 565 unit tests and production build pass.
Light/dark popup checks confirm original preference reads and all setting
actions, icon rendering, no horizontal overflow and text contrast >= 4.5:1.
The install page fits 1440px and 390px in both themes. Existing dark-mode
regressions pass at four widths, and the regenerated fictional preview passes
its four-width suite after updating its Original layout step for the current
Layout settings menu. Screenshots were inspected. No live account was used.
The local ZIP is myucla-workspace-v0.19.5.zip; no release tag or Store
submission was created. Future release tags create drafts for review.

## Standalone repository migration

Canonical repository: https://github.com/comet-ctrl/myucla-workspace.
The latest remote contributor history (`b90faff`, PR #2) is merged with the
local v0.19.4 work; both ancestries and the original license are retained.
The historical fork and its release downloads remain available. Its branches
retain version suffixes; the standalone repo now uses permanent `main`. See
[migration details](docs/REPOSITORY_MIGRATION.md).
The installed Chrome extension has not been changed during this migration.
The rebuilt combined source requires a separate install/reload to use locally.

Verification: typecheck, all 565 unit tests and production/preview builds pass.
Dark-mode checks pass at four widths; viewport fill passes at six sizes, and
course tools pass at three widths with ten repeated local drag operations.
All ten header-reveal cases and five calendar pixel/geometry cases also pass.
Browser fixtures use fictional data; the combined build is not yet verified
on an authenticated MyUCLA page.

## v0.19.4 header, notice and calendar polish

Compared the authorized live planner in dark workspace and Original layout,
then restored its original workspace selection. No plan/enrollment action ran
and no account-specific content was saved. Native notices use transparent inline
links; generic dark button fills caused rectangular patches. The notice wrapper
and inline links now stay transparent, with readable help icons. Urgent notice
content stays visible. Native controls, handlers and status markup are retained.

Native calendar hour rows sit behind transparent full-height day columns. The
old dark rule made those columns opaque and covered horizontal lines. Only day
background transparency changes. A new fictional native-shaped layered fixture
checks painted rule pixels (including a negative control reproducing the old
bug), exact event colors/geometry, native spacing redraw, resize, print and
Original restoration. All five widths passed, 390–2048px.

PlannerIntroduction owns a thin top-edge reveal button, mounting only with one
recognized layout-headerwrap. Hover/click/native focus temporarily scrolls the
unchanged UCLA header into view. Leave waits 280ms and respects native menus,
focus and held pointer gestures. Escape/outside click returns to compact view;
outside dismissal runs after the target click to avoid moving a native control
before its click completes. Explicit Show header still saves the pinned choice.
Temporary access never writes preferences. Reduced motion skips animation.
Native header nodes/styles/parents/handlers remain intact. Root scrollbar hiding
is screen-only; document scrolling and visible local panel scrollbars remain.

Live structural inspection confirmed the real layout-headerwrap is an open
shadow host (nested components). Header visibility checks observe that structure
without reading menu text or account values; fictional nested-shadow fixtures
cover it. A separate print regression found old fixed panel coordinates could
survive print media and overlap navigation. PlannerWorkspace now suspends screen
geometry during print and measures once after screen styles return, including
native events and media-only transitions, with complete listener/frame cleanup.

Header unit tests cover interaction timing, native actions, focus, menu hold,
preferences, animation lifecycle and cleanup. Escape only suppresses hover
when the pointer is actually at the normal top-edge strip, measured after focus
returns to Show header. This prevents immediate reopen without blocking the
next deliberate hover. Typecheck/build and all 552 unit tests in 39 files pass.
The production header matrix passes all ten cases: light/dark at 2048, 1440,
1280 and 390px, plus nested-shadow dark variants at 2048 and 390px. Checks include
both Escape regressions, keyboard sensor access, trusted native click timing,
native identity, notices, preference isolation, local scrolling and post-print
Original restoration. All five calendar pixel/geometry cases pass. Dark-mode
and popup checks pass; the four-width fictional preview also passed and was
rebuilt from the final sources. Screenshots are fictional and visually checked.

Evidence: outputs/v0194-unit.log, outputs/v0194-header-reveal.log,
outputs/header-reveal/report.json, outputs/calendar-gridlines/report.json,
outputs/v0194-dark.log and outputs/v0194-preview.log. Test-driven fixes included
outside-click timing, post-print overlap and both Escape hover sequences.
The appearance-test media mock was corrected to keep print and color-scheme
queries separate; production appearance behavior did not require a change.

Installed all 20 production files with SHA-256 verification into the existing
Downloads unpacked extension. Backup: outputs/installed-backup-before-v0194-20261004-225129.
Record: outputs/v0194-installed.json. Requested Chrome extension Reload and
Class Planner refresh for installed-page verification; that final live check
remains pending. The authorized Chrome tab timed out to MyUCLA's logoff page
before verification; asked the user to sign in themselves and return to Class
Planner. No credentials were accessed. The tab is marked for handoff, without
plan/enrollment changes. No GitHub push or new public release.

## v0.19.3 Settings and layout presets

The user requested a bottom-left Settings button and a visual layout picker
like the supplied snap-layout image. Five honest presets use the existing
one/two-group engine: One pane, Balanced, Browse wide, Schedule wide, Schedule
on the left. The pure workspace-presets model preserves tab order and optional
closed panels, redocks floating modules, retains current browsing selection,
and reopens Schedule for a split. Details redocks without closing course rows.
No native disclosures, selections or account actions run when applying layouts.

WorkspaceSettings owns the footer gear and a native modal dialog. Presets
apply immediately and remain available for comparison. Light/dark diagrams,
selected state, Default layout, keyboard trapping, Escape/outside dismissal
and focus return are verified. On narrow windows the gear remains at the start
of the scrolling navigation. Original layout removes Settings; print hides it.
The existing direct Default layout action remains available.

Only a validated layoutPreset enum is added to the existing v2 local preference.
Ratios adapt to the viewport, respecting readable-width floors and compact
fallback. Manual sizing/tab movement returns to a custom arrangement; cancelled
divider gestures restore the preset and cannot save intermediate geometry.
No permissions, network APIs or other storage keys were added.

Verification: typecheck/build, 526 unit tests in 37 files, all seven Settings
browser viewport/theme cases (2048/1440 light+dark; 1280/960/390 light), existing
group fixtures at five widths, 39 split regressions and four preview widths
passed. An initial modal Tab escape was caught and fixed with explicit trapping.
Checks cover native node/form/handler/status identity, native selections, saved
fresh-document restoration, resizing, focus, print, original layout, and zero
native actions/requests. Screenshots are fictional, visually inspected.
Evidence: outputs/v0193-*.log and outputs/workspace-settings/report.json.
Picker screenshot: outputs/workspace-settings/settings-dialog-1440-dark.png.

Installed and SHA-256 verified all 20 production files into the existing
Downloads extension folder. Backup: outputs/installed-backup-before-v0193-20261004-220619.
Installation record: outputs/v0193-installed.json. The user has been asked to
reload the extension and refresh Class Planner; installed-page verification
remains pending. Changes are local; no new release or GitHub push this turn.

## v0.19.2 tab-splitting repair

Live v0.19.1 reproduction on the authorized Class Planner tab found that a single
left group containing Classes and Schedule would not split Schedule at the left
edge; the same drag to the right edge worked. Restored the original grouping
and selected Classes afterward, without invoking account/plan actions.

Root cause: `splitWorkspaceTab` rejected an occupied logical dock, including
the dragged tab's own group. Its missing target fell through to the whole-pane
merge target. The reducer now removes the dragged tab first, and moves the sole
remaining group to the opposite edge when needed. It preserves closed siblings,
selection and order. Two singleton groups can exchange sides. More than two
groups or insufficient width still reject without changing committed state.

Split targets cover 15% of the deck, bounded at 80–180px, plus a 12px outer gutter.
The 40px tab strip is reserved for grouping/order; split hysteresis cannot extend
back into it. Narrow (<1100px) layouts do not advertise invisible splits. Filled
previews now show Split left/right or Group tabs on a readable light/dark badge.

Typecheck/build and 485 unit tests passed; the final label-only markup refinement
also passed its 12 focused operation tests. Existing grouped-workspace browser
checks passed at five widths. New production split suite passes 39/39 cases at
1440/2048px plus 1024px fallback: both edges from main/left/right, singleton swaps,
wide targets, strip grouping, outside gutter, dark appearance, cancellation, native identity and
pixel-matched preview/final geometry. v0.19.1 failed 24 of the original 32 cases.
Evidence: outputs/v0192-*.log and outputs/workspace-split-regressions/.
The rebuilt fictional preview also passes at 1440/1280/960/390px.

Installed all 19 v0.19.2 files with matching SHA-256 into the existing Downloads
folder. Backup: outputs/installed-backup-before-v0192-20261004-213812.
Record: outputs/v0192-installed.json. User has been asked to reload extension and
refresh Class Planner; fixed-build live verification is pending. No new release
was requested or published this turn. Changes remain local for review.

## v0.19.1 dark appearance

The user requested dark mode and publication. The extension popup now offers
System / Light / Dark; System is the default. Only the validated string at
`plannerLift.appearance.v1` is persisted through the existing storage permission.
`PlannerAppearance` scopes the HTML theme attribute to recognized enhanced
workspace/intro markup and restores it on Original layout, tidy off or disposal.
Media/storage listeners are cleaned up; stale initial reads cannot overwrite
newer changes. The popup waits for the first preference before enabling selection.

`public/dark.css` is concatenated after injected.css and v019-calendar.css into
the existing content stylesheet. All dark rules are screen-only. Native UCLA
masthead/navigation, course status markup, event colors and geometry remain
intact; dialogs, floating panels, search, details and the popup use dark surfaces.
The fictional website preview is rebuilt from this CSS and shared production
code, but intentionally shows light appearance; the README screenshot shows dark.

Verification: typecheck, build and 477 tests in 34 files pass. The first highly
parallel test run timed out in one existing DOM test; rerunning the suite with
two workers passed. Dark/browser checks cover 2048/1440/1280/390px, popup keyboard
selection, contrast, saved preference changes, native control identity, status
markup, calendar geometry/colors, print and restoration. Group and course-action
fixtures pass. The preview harness now checks v0.19 group behavior rather than
obsolete v0.17 splitters; Information temporarily fills the deck and Escape
restores the original calendar/controls. Four preview widths pass with no requests.

Evidence: outputs/v0191-*.log, outputs/dark-mode/report.json and screenshots,
outputs/planner-preview-v0.19.1/. The release ZIP contains dist/; all 19 entries
were checked byte-for-byte against the build, with SHA256SUMS.txt supplied.
Installed into C:\Users\freeb\Downloads\better-myucla-v0.10.3\dist, all 19 hashes
verified. Backup: outputs/installed-backup-before-v0191-20261004-212206.
Installation record: outputs/v0191-installed.json. No live authenticated page
verification was performed for v0.19.1. Reload the extension and refresh Class
Planner before verifying its loaded appearance. Do not claim live enrollment
or Optimizer backend behavior based on fictional fixtures.

## v0.19 implementation and installation

The user requested implementing/testing v0.19 after the initial branch push.
Completed course/detail spacing, 14px body text, always-visible room/instructor
metadata and keyboard detail-jump navigation. Multiple native details remain
expanded; the jump row scrolls the existing stack. It preserves current course
and owned-button focus across recognized redraws, never storing course data.
The index resets UCLA's inherited navigation shadow. Native course ancestry,
controls, statuses and form association remain intact.

Calendar CSS is in public/v019-calendar.css, concatenated after injected.css by
scripts/build.mjs. The preview builder validates both CSS sources against dist.
Event geometry, inline styles and colors stay native; labels/borders/focus are
refined. Rebuilt the fictional site/workspace-preview.html from this build.

Typecheck/build and all 466 unit tests passed. Current production fixture runs:
workspace groups (2048/1440/1280/960/390), course presentation/navigation
(same five widths), course actions (2048/1440/1280/390), native module controls
(1440/1280/960x900 and 390x600), calendar geometry/control/restore (seven cases,
including 1366 and 390x600). Evidence outside repo: outputs/v019-ready-*.log,
outputs/v019-course-polish/, outputs/v019-calendar/.

Installed and SHA-256 verified all 18 files into the previously authorized folder
C:\Users\freeb\Downloads\better-myucla-v0.10.3\dist. Record:
outputs/v019-installed.json. Backup:
outputs/installed-backup-before-v019-20261004-173404.
The user signed in and Class Planner was found, but live v0.19 verification is
NOT complete: Windows computer control stopped because it could not determine
Chrome's URL confidently while attempting to reach the existing Extensions tab.
No extension reload or further browser action was attempted after that stop.
Next: user reloads Better MyUCLA, refreshes Class Planner, then verify via the
browser connector in a new turn. Do not claim installed-page verification yet.

## v0.19 tab-group milestone

The user requested saving GitHub first, then beginning v0.19. Baseline v0.18.6
is committed and pushed as `1337c94b32a8a095ff36061ec8cb04ff272d5626` on
`fork/flexible-panels`. Draft PR #1 targets the user's fork main and CI passed:
https://github.com/comet-ctrl/better-myucla-planner/pull/1.
The v0.18.6 baseline is backed up; see the newer installation record above.

`workspace-groups.ts` is a pure six-panel model (Classes, Find, Optimizer, Study,
Personal, Schedule). It supports open/closed remembered membership, active tabs,
visible-tab insertion order, singleton floating and at most two docked groups.
Find's 560px minimum is reserved while it is an open tab; Schedule needs 420px.
Narrow views select one group without overwriting saved desktop grouping.

Native sections remain in their existing parents and project beneath owned
40px tab strips. Inactive sections are hidden; independently floating Details
keeps its Classes anchor, while docked Details is concealed with its tab. The
native header close is hidden while a tab close serves the same docked panel.
Keyboard arrows/Home/End select tabs and Delete closes. Explicit center merge
and edge split targets share the reducer used by the resulting layout; preview
bounds include the strip. Tab hit intervals are clipped to visible strip bounds.
Selected-tab reveal scrolls only the strip. Escape/blur/redraw cancels gestures.
Grouped pane bounds end inside the visible viewport so short windows retain
local scrolling. Native title Help popups keep their parents and handlers;
bounded positioning can flip them above the title, with exact style cleanup.

Storage uses `plannerLift.workspace.v2`, containing only allowlisted public
layout fields and group state. It reads v1 as a migration fallback and leaves
the old key intact for rollback. Details retains separate bounded panel geometry;
course expansion and native values are never stored or replayed.

See `docs/V019_WORKSPACE.md` for scope. `harness/v019-design-draft.html` is an
interactive fictional exploration; it also shows later course-list/details and
calendar ideas that this first milestone does not implement. The user's real
UCLA masthead remains unchanged. Fictional screenshots are in
`outputs/v019-design-draft/` and `outputs/workspace-groups/` outside the repo.

Typecheck, build and all 462 unit tests passed. The group browser suite passes
2048/1440/1280/960/390 plus legacy migration, merging/splitting, filled previews,
cancellation, native redraw, divider and Widen/Restore, tab reveal, print,
all-closed and Original layout. Course Details action fixtures pass four widths
and Plan Actions pass four viewport sizes. Native module controls also pass
1440x900, 1280x900, 960x900 and 390x600, including Help, calendar redraw, native
control identity and restoration. Logs: outputs/v019-unit-final.log,
v019-groups-final.log, v019-details.log, v019-plan-actions.log and
v019-module-final.log.
No real account action or installed-page verification was performed for v0.19.

## Compact headers and panel control fixes (0.18.6 development)

The user reported excess schedule header space, a dark navigation shadow,
misplaced panels after collapsing navigation and duplicate Details close icons.
Live inspection found the extension NAV inherited UCLA's global box-shadow
(rgba(0,0,0,.4) 0 0 4px 2px). Scoped CSS removes that shadow without touching
UCLA's masthead. Dock coordinates now measure after applying navigation collapse,
including keyboard toggles and cancellation. One open course retains only its
individual close; multiple courses get independent closes plus Close all class
details. Group hiding preserves the existing reopened-detail behavior.

The native calendar menu is #ctl00_MainContent_panelGrid > #gridDiv >
.classPlanner_SectionMenu.plannerMenuLinks.checkboxStateHolder. Its observed
ancestors are static-positioned. At roomy widths, the same node projects into
the measured gap between the native title and header controls, without moving
parents or changing values/handlers. It tracks the sticky header on scroll.
Overflow, an unexpected offset parent, hidden/collapsed panes or insufficient
space retain normal flow. Print and restore remove projection. Native menu
spacing is reduced in both forms. Disabled Widen is hidden; Restore remains.

Browser checks also exposed native absolute checkbox buttons wider than their
reserved inline slots. Each native icon-toggle pair now reserves 36px and keeps
its existing checked/unchecked visibility. A 34px fixture button verifies that
neighboring labels do not overlap its hit area.

Typecheck/build and all 419 unit tests passed. Three new focused regressions
cover navigation geometry, close control semantics and native menu projection,
fallback and cleanup. The full production panel suite passed 2048/1440/390,
including seven-document persistence, autofill, compact controls, native click
targets, collapsed navigation, floating geometry and Details close/focus. Broader
workspace checks passed nine widths plus empty/future, redraw, print and header
cases; course detail action checks passed 2048/1440/1280/390. Evidence:
outputs/panel-polish-{unit,workspace,details,panels}.log. Successful fictional
screenshots are in outputs/panel-layout/compact-schedule-2048.png,
collapsed-navigation-details-1440.png and single-details-floating-390.png.

Installed and SHA-256 verified all 17 files. Backup:
outputs/installed-backup-before-panel-polish-20261004-162552.
Record: outputs/panel-polish-installed.json.
content.js: fced197fd8096149a86416a21ac54d9a71c4ca8fe9b9e11ff696295225674e94.
injected.css: 48a9b799c82e9de59be2eaf1ae98f627e8b54bcbf76e1932e539b1b92bd0ce19.

The user reloaded/refreshed. Verified directly on the existing Chrome tab:
1399px Schedule uses an inline menu (header58.8px; menu36.05px, vertically
centered), native menu stays in #gridDiv, nav shadow is none, and disabled Widen
is hidden. All 12 visible native display buttons were reachable at their center;
toggle buttons fit inside their reserved slots. Opening one course showed one
course close and a hidden group close. Docked Schedule left, collapsed navigation
and measured exact alignment (deck/calendar left both72.8px, previously184.8px).
Restored expanded navigation and the user's right calendar1399px/main420.4px
split, with the first course details open as in their report. No native plan or
enrollment action was used, and no private page content was saved. No commit or
publication was requested for this follow-up.

## Automatic space filling (0.18.5 development)

User identified unused main space beside the sole visible left calendar. Empty
main groups now consume no width: one edge panel fills the deck; two edge panels
share it with a single divider. Explicit divider gestures update both preferred
sizes; automatic filling never overwrites preferences. Reopening a main module
restores the remembered split. Drop previews use the same occupancy calculation
as the final layout. Floating panels and Details remain accessible even when
their original main ancestor has zero width. Explicit hidden CSS suppresses the
Widen button in layouts where it is not applicable. Official design reference:
https://obsidian.md/help/tabs.

Typecheck, production build and all 416 tests passed. Production panel suite
passed 2048/1440/390px, including persistence and Default reset. Fill cases passed
2048/1440: one/two edges, shared divider gestures and reload, remembered widths,
float/drop previews, native identity and restoration. Broader workspace checks
passed nine widths plus empty/future, long content, redraw, print and header
cases; native Details checks passed 2048/1440/1280/390. Evidence:
outputs/autofill-panel-final.log and outputs/dock-fill-{unit,workspace,details}.log.

Installed all 17 files with matching SHA-256 hashes in the existing Downloads
extension. Record: outputs/dock-fill-installed.json. Backup:
outputs/installed-backup-before-dock-fill-20261004-155038.
content.js: 62146ce27592f91322a48f39a812f423eebab534e20e80287022733357470496.
injected.css: 26f2457913efb49ac376ea68ac95b01d2dfa568cb94c58aaf6377b09ab9553e5.

User reloaded v0.18.5. On their actual page, My classes was open (420.4px), Find
closed, and Schedule docked right (1399px). Closing My classes made Schedule fill
the complete 1831.4px deck; main width became zero and Widen was visibly hidden.
After refresh, full width and closed panels remained. Reopening My classes
restored the prior 420.4/1399px split. Left the page in that original arrangement.
Only layout controls were used; no private content was saved and no plan or
enrollment actions were performed. No commit or publication this turn.

## Remembered layout and smoother dragging (0.18.4 development)

The user explicitly authorized saving their customized layout and requested a
Default layout button. This supersedes the prior memory-only layout restriction.
New `plannerLift.workspace.v1` local storage contains only allowlisted public
module identifiers, placement, bounded floating boxes, hidden flags, navigation
choice/collapse, schedule/dock widths and primary-pane folds. Reads and writes
reconstruct the schema; no course, term, plan, account or search data is included.
Startup awaits the preference before mounting. Restoration forwards no native
actions, preserves controls in their original parents, and leaves closed native
bodies closed. User changes coalesce in a microtask and storage writes serialize.

Default layout sits above Original layout in navigation (↺ when collapsed). It
resets placements, widths, hidden flags, module/navigation and local folds, and
saves the reset. Plans, native selections, notes, open Details and the compact
header preference remain unchanged. Original layout still restores native flow.

Live v0.18.3 inspection confirmed the native title buttons now fit their labels
and blank header dragging works. It also reproduced a tall panel failing to
follow vertical pointer movement because every move was clamped. Runtime now
coalesces movement once per animation frame, allows exact grabbed-point tracking
during dragging and clamps the final floating placement on release. Workspace
geometry is recalculated once when detaching, then only projected Details move.
Release flushes the last pointer position; cancellation removes pending frames.

Canceled navigation drags and divider gestures roll back their presentation and
never save temporary choices. Reconciliation cancels all gestures BEFORE taking
its snapshot, including table-only native redraws. Three tests reproduced the
prior transient module/navigation/width leak and pass with this correction.
Keyboard width changes clamp before persistence so shrinking at a boundary
does not restore a different width on reopening.

Production fixtures cover stored geometry across fresh documents, hidden/folded
panels, native-closed Optimizer restoration without disclosure, mobile bounds,
durable Default reset, canceled gestures, native identity and exclusion of course
content. Broader native module/Plan Actions/Details checks passed four widths;
workspace checks passed nine widths plus long, empty/future, redraw, print and
header preference cases. Evidence is in outputs/layout-memory-*.log and
outputs/persistent-panel-*.log. Final typecheck, production build and all 410
unit tests passed. The final interruption fix was rechecked in the complete
1440px panel suite and seven fresh-document persistence scenarios (including
390px restoration). Earlier full panel checks passed 2048/1440/390.

Installed and SHA-256 verified all 17 files in the existing
Downloads/better-myucla-v0.10.3/dist directory. Backup:
outputs/installed-backup-before-layout-memory-20261004-153725.
Record: outputs/layout-memory-installed.json.
content.js: e2c71f05a9e32893f259d01f5d16f2d05d2dff98ab4388a0ed83cdbd09d02e2e.
injected.css: 745cbcc2c580a7a38786fcdf743531dd761774a65ddb01460de0ca73051605c0.
The user reloaded and refreshed; live checks confirmed their custom left-docked
1519px schedule with Classes/Find hidden survived refresh. Default layout reset
the calendar to the right, 640px width, with both browsing panels available; a
second refresh retained that default. Restored the user's left-docked/widened
arrangement afterward using layout controls only. Browser connection this turn is
Chrome id 3, existing tab 505443073, accessible through cua_repl. The initial
live check restored schedule to its original right dock and 640px width; no
private page content was saved. See outputs/layout-memory-live-baseline.json.
No publication or commit was requested this turn; changes remain local.

## Live header drag correction (0.18.3 development)

Live Chrome checks confirmed v0.18.2 schedule float, close/reopen, keyboard
left/right docking and pointer grip float/left docking. The original right-side
placement and width were restored; no account action was performed. Pointer
preview during a held gesture was covered by fictional browser fixtures, not
captured by the atomic live drag call. No private page content was saved.

Live inspection also exposed a real blank-header problem: native title buttons
flex across the apparent empty region, so drag ignores it as an interactive
control. CSS now fits native title buttons to their labels with an automatic
trailing margin belonging to the parent drag surface. Classes/Search overrides
no longer grow the button; small Search titles align to the start of their cell.
Native controls/handlers and adjacent button groups remain unchanged.

The panel harness previously used plain text for some native titles and probed
edge padding. Its regression now models native button titles and checks the
meaningful blank space between title text and trailing controls. The new check
fails the v0.18.2 build because that region hits the native button.
Typecheck, production build and 389 unit tests passed. Final production panel
fixtures passed at 2048/1440/390, including meaningful center-header pointer
dragging, native title clicks, all six modules' control reachability, close,
reopen, cancellation, preview/drop geometry, redraw and restoration. Native
module controls passed at 1440/1280/960/390. Narrow header probes at 326/390/480
confirmed controls stay inside their panels and long labels wrap internally.
Evidence: outputs/header-grab-unit.log, header-grab-panels.log and
header-grab-module-controls.log; fictional baseline failure retained as
outputs/panel-layout/header-gap-baseline-0.18.2.json and PNG.

All 17 v0.18.3 build files installed and SHA-256 verified in the existing
Downloads/better-myucla-v0.10.3/dist folder. Backup:
outputs/installed-backup-before-header-grab-20261004-110343.
Install record: outputs/header-grab-installed.json.
injected.css SHA-256:
314498562b55f0ac7deea1e4bdc5e51829b168250b9c0e2354dd518570268783.
Runtime content.js is unchanged from v0.18.2. Asked the user to reload the
extension and refresh Class Planner for final blank-header live verification.
This is a local development fix, not a new published release; source edits are
uncommitted. The published archive and fictional site preview remain v0.18.2.
Sanitized live check record: outputs/live-dock-check-v0.18.2.json.

For this Chrome connection use the existing tab through cua_repl. Its
getScreenshot()/drag() methods worked. The standalone Windows helper could not
validate the browser URL; do not use it as the browser fallback. Browser menus
use menuitemradio for Float/Dock, menuitem for Hide/Reset.

## Filled docking preview and simpler placement (0.18.2)

Removed bottom docking from runtime, menus, keyboard and dividers. Dragging
blank native header space, the dotted grip or navigation tab moves the actual
panel. One shaded rectangle fills its predicted destination. Generous side
regions and the main header accept drops; empty space leaves the panel floating.
Targets are captured before movement, with edge hysteresis and Escape/blur
cancellation. Native header controls and Help popovers cannot start a drag.

Preview and committed layout share geometry, including collisions, narrow
Details stacking, and returning Details to hidden/floating My classes. Revealing
hidden Classes frees an occupied edge first. Details focus synchronizes its
projected native row before measuring, fixing a reproduced small-screen action
that stayed clipped after a synchronous scroll/focus change. Native nodes,
parents, form association, selections and statuses remain intact. No additional
storage, permission, API, server or background requests.

Typecheck, production build and 389 unit tests pass. Browser fixtures pass:
panel dragging/destination bounds within 2px at 2048/1440/390; native Details
actions at 2048/1440/1280/390 across four redraw modes; Plan Actions and native
module controls at four widths; broader workspace at nine widths plus long,
empty/future, header/quarter redraw, resize, print and restoration cases. The
resize fixture now waits for the actual schedule geometry after viewport
changes, rather than accepting the previous main-pane frame. Screenshots and
requests are fictional/intercepted. Evidence: outputs/dock-preview-*.log and
outputs/panel-layout/. No live enrollment action was performed. User has been
asked to reload Chrome's extension and refresh; installed-page QA is pending.

All 17 built files installed and SHA-256 matched in
`C:/Users/freeb/Downloads/better-myucla-v0.10.3/dist`.
Backup: outputs/installed-backup-before-dock-preview-20261004-002511.
Record: outputs/dock-preview-installed.json.
Build content.js SHA-256:
106c50090b346a7a369d486afac104617f02bafe993e8396937ed1e799b61317.
Build injected.css SHA-256:
37fcee649c1cb75a7799f9661136f9b07c67fe527e6d673f78e071cee3fab77b.
Verified 17-file ZIP: outputs/release-v0.18.2/better-myucla-v0.18.2.zip.
ZIP SHA-256: 39bdd9e1b6d4d738bcc893b9639500e38530b310211c1a3592492e5a69522139.

Production source commit: `f4c2729`. Fictional site preview regenerated from
that source with matching production hashes; preview checks pass at
1440/1280/960/390. Its data and actions are local fixture demonstrations only.

Release workflow note: pushing/creating a v* tag triggers Release, which rebuilds
and replaces the ZIP and release notes. Wait for that workflow to finish, then
restore the verified local ZIP and notes, and check remote asset digests against
SHA256SUMS.txt. Do not claim published hashes before that final verification.

## Prior release packaging (0.18.1)

The user explicitly requested a downloadable GitHub release after the branch
push. Package v0.18.1 as a prerelease; keep v0.17.11 available for rollback.

Release ZIP: outputs/release-v0.18.1/better-myucla-v0.18.1.zip, containing all
17 verified dist files. Its SHA-256 is
0640d8f972594c555aabd69b8c7fca0e009cbc771039a0478d85e22ecdba2131.
Only manifest.version_name changed from development to prerelease; runtime
JavaScript and CSS exactly match the hashes and checks below. The installed
manifest label was updated too. The prior installation record describes the
development-label manifest, while this release ZIP contains the prerelease label.

## Close panels and live dragging (0.18.1)

Every native module and the owned Details frame now has a header × that hides
its presentation without removing controls or clearing selections. Navigation
reopens modules and includes Schedule; a course's Details button reopens the
whole retained details group. A floating Details panel can remain visible when
My classes is hidden. Escape does not close concealed course records, and
closing a visible course returns focus to visible navigation when necessary.

Dragging moves the real panel on every pointermove. Original nodes stay in
their native parents. Fixed dock targets avoid shifting during the gesture;
Escape/blur/pointer cancellation restores position, placement and stacking.
Snapshots taken during dragging use committed geometry. Explicitly dragging or
floating a closed pane does not displace another pane from its former dock.
Hidden flags remain in memory through same-context redraws. Reset reveals all;
print and Original layout restore native content. No storage/permission changes.

Typecheck, production build and all 375 unit tests pass. Final production
browser fixtures pass at 2048/1440/390 for hide/reopen, live drag before release,
cancellation, dock/resize, independent Details, native identity, selection
retention, redraw, reset, print and restoration. Inspected real-drag screenshots
with fictional data, including mobile close controls. Native Details actions,
Plan Actions and module-control regressions pass four viewports each. Broad
workspace checks pass nine widths plus long/empty/future/redraw/print cases.
Proof: outputs/panel-close-*.log and outputs/panel-layout/. No live enrollment
was attempted; final installed-page verification still requires Chrome reload.

Build hashes: content.js SHA-256
24633268db65a0389674ad402189ccf79cee0ba18469ede0bcd11ed0f359ddcc;
injected.css SHA-256
f0c24378083d53a1ff4b5278d357b5bb540d7990a61e40233223634774cf626d.

Development source commit: `4cf2edf`. All 17 files installed in
`C:/Users/freeb/Downloads/better-myucla-v0.10.3/dist` and SHA-256 matched.
Backup: outputs/installed-backup-before-panel-close-20261003-223943;
install record: outputs/panel-close-installed.json. Matching fictional preview
regenerated from that source commit and verified at 1440/1280/960/390 with the
exact production CSS and content hashes. Asked the user to Reload the extension
and refresh Class Planner; actual installed-page check remains pending.

## Prior flexible-panel baseline (0.18.0)

User requested Obsidian-like draggable tabs, floating schedule/details and
retractable navigation without a toolbar full of new buttons. Implemented an
in-page PanelLayoutController: owned dotted grips/nav proxies, thresholded
pointer dragging, edge docking targets, bounded/resizable floating panels,
dock dividers, keyboard/context-menu alternatives and atomic Reset layout.
Navigation can collapse with its chevron or drag edge. Multiple details and
other modules remain usable together. Floating means within the same document.

Native sections stay under their existing main/deck parents; original course
third rows remain inside their TBODY, projected into the owned details frame.
No native controls/handlers/values are cloned or moved out of the original
form. Existing strict native disclosure forwarding is explicit-user-only;
layout reset, displaced panes and snapshot remounts never open a module.
The current plan/term boundary still clears old details and layout. Same-plan
redraw restores only public panel IDs/geometry from memory. No new persistent
storage, permission or request is introduced. Print/Original restore native flow.

Typecheck/build and 354 unit tests pass. Production panel-layout fixtures pass
2048/1440/390, including overlapping floating My classes/Details/Find, trusted
drag/dock/resize/sidebar gestures, native review focus and hit-testing, same-plan
redraw, reset, print and exact control identity/ancestry/status. Native detail
actions passed four widths x four redraw types. Plan Actions and original
module controls passed four viewports each; broader workspace passed nine
widths plus long/empty plans, quarter/header redraw and print. Matching preview
uses the same production source and CSS. Final installed-page verification
still requires the user's Chrome reload/open Class Planner tab; no enrollment
was attempted. Fictional proof: outputs/panel-layout/ and flexible-panels logs.

Development source commit: `7d40af3`. Installed all 17 build files in
`C:/Users/freeb/Downloads/better-myucla-v0.10.3/dist`; every SHA-256 matches.
Backup: outputs/installed-backup-before-flexible-panels-20261003-221052.
Content JS SHA-256: 8be6aa9833bcd993d27358499564884b2a3ae09f33d061ef8fdf5b32c401caac.
CSS SHA-256: 58035ab4a153f2a466f79e1c5d058b7b9daf2b7d2ae52ebc869ada34872f5ffd.
The final three-width docking run includes the empty-center placeholder rather
than implicit selection of unopened Optimizer. Preview metadata identifies
the source commit and exact production hashes; preview checks pass four widths.
An exact-URL Chrome lookup could not find Class Planner. Asked the user to reload
the extension and open/refresh that page; installed live verification is pending.

## v0.17.11 published baseline

Merged `planner-redesign` through `0fa3f46` into the fork's `main` by
fast-forward at the user's request. Local `main` now tracks `fork/main`;
upstream `origin` remains read-only. The source and tested extension build are
unchanged; README branch links and publication notes now describe `main`.
The install page's source and issue links now point to this fork, rather than
directing fork users to the upstream author's support inbox.

README refreshed for the current release: opt-in install/update steps, named
workspace navigation, multiple Details, schedule sizing/status colors, native
action continuity, privacy, current test commands and explicit live limitations.
The leading screenshot is fictional multiple-course Details; the Find classes
preview is retained. Removed obsolete v0.14.x verification prose and corrected
Save/partial-postback claims against current code. Source is now on the fork's
main branch; the versioned prerelease links to the existing tested ZIP.

User reported a missing next panel after Enroll from My classes Details and
requested multiple simultaneous expanded details. Bounded live inspection
confirmed the requested course's Details/action menu opened and Enroll was
enabled, correctly associated with the native form and pointer reachable.
No live enrollment command was invoked. No private screenshot/content captured.

Found and reproduced a display regression in installed 0.17.10 using fictional
native menu/action structures: replacing the course, plan table or wrapper
closes Details and hides the returned native workflow content. The baseline
fixture records 7 expected failures at 1440px. In-place response already worked.

Open courses now have independent original third rows aligned into a shared
scrolling details stack with owned spacers. Native table/control ancestry is
unchanged. Close/Escape is per course, Class actions leaves details open, and
opening another aligns its content within the details viewport. Wheel, keyboard
and touch gestures scroll locally; taps, pinch, fields and nested scrollers are
preserved. Print removes clipping/docking; Original layout removes presentation.

Same-context reconciliation retains open validated course IDs, opening order,
exam disclosures and local scroll, then decorates only the fresh native nodes.
Exact still-connected native focus is restored after remounting containers;
no value, replacement ID or stale node is used. Controller leaveContext now
restores the workspace before a new term/plan, including matching course IDs.
No native action replay, extra requests, permission or storage is added.

Typecheck, all 324 unit tests and production build passed. Broad workspace
browser tests passed all 9 widths; Details passed 6 widths plus rich metadata.
Final native-action regression passed 4 widths x 4 redraw modes, including
returned response hit-testing, form/control identity, native focus, context
reset and no action replay. Trusted touch passed at 2048/1440/390 with unchanged
document and class-list scroll. Matching production preview passed 4 widths;
Plan Actions passed 4 viewports. No outgoing fixture requests or script errors.

Installed 0.17.11 in Downloads/better-myucla-v0.10.3/dist; all 17 files SHA-256
match production. Backup: outputs/installed-backup-v0.17.10. ZIP:
outputs/better-myucla-v0.17.11.zip SHA-256:
f8adcae16c370435bc601bdf8ed01b0bf7c849c7ceabac71a0dbd797accc5979.
Content JS SHA-256: dced188324b3c0900345d31814a719e3f88e0680203d3e96d4a79a85f4dc8bf4.
CSS SHA-256: 0c18e8ed88a54fb5dcdbf01a039bd4e9fa2a30017a46bc5f79e1db6fcb557743.
Fictional proof: outputs/multi-details-review-v0.17.11/multi-open-2048.png.
Awaiting requested extension reload/page refresh for installed live verification.
Code e36c4d7 is pushed to fork/planner-redesign. CI 37176107650 and Release
37176109011 passed. v0.17.11 is a prerelease; the workflow asset was replaced
with the exact installed Windows ZIP and GitHub's digest matches above.

Live backend enrollment remains unverified; do not equate fixture success with
an actual enrollment. The prior native Optimizer limitation also remains.

## v0.17.10 historical record

User requested a bigger adjustable calendar and class-list status colors matching
Details. Added Widen/Restore width beside Weekly schedule. The old 640px maximum
is replaced by available deck width minus 432px (420px browsing + 12px divider).
Default proportions remain; pointer/keyboard resizing, End and ARIA bounds use
the larger range. Widen tracks viewport changes and restores the prior manual
width. Narrow screens keep the existing full-width Schedule switch. New owned
controls are removed for Original layout and hidden in print. No native action
or new storage is involved.

Section summaries use the existing strict status parser for tone only: green
Open/Enrolled, amber Waitlist, red Closed; unknown/contradictory stays neutral.
Original wording and counts remain separate per lecture/discussion. BR boundaries
become spaces; explicitly hidden native rows/text are excluded. Native cells,
icons and handlers are unchanged. Small dots complement colored text.

Typecheck, all 319 unit tests and production build pass. Visual probes at
2048/1440/1280/390 confirm color/style/wording, Widen/Restore and no overflow.
At 2048px the calendar grows from 640 to 1414px; at 1440px it grows to 806px,
retaining a 420px browsing pane. Matching preview passes all 4 widths.
Full workspace browser suite passes at 9 widths, including wider/custom sizes,
resize and partial-redraw retention, native identity/geometry, narrow fallback,
printing, restoration, long content, future quarters and drag scrolling.

Installed 0.17.10 in Downloads/better-myucla-v0.10.3/dist; all 17 files match by
SHA-256. Backup: outputs/installed-backup-v0.17.9. ZIP:
outputs/better-myucla-v0.17.10.zip SHA-256:
30cbb91814c7761a14e21be91a493398caa3dd8d22fafdf07786776969cea48e
User reloaded/refreshed. On the exact ClassPlan page, Widen grew the calendar
640→1399px while retaining 420.4px browsing with no horizontal clipping. Restore
returned it exactly to 640px. Known status tones and their text/dot CSS colors
match the build. Inspected only structural geometry/style/control labels; no
course text or private screenshots collected. Prior width restored; tab marked
deliverable. No actual plan/enrollment changes.

Code `89c9a6f` is pushed to fork/planner-redesign. CI `37174783389` and Release
`37174784926` passed. v0.17.10 is a prerelease; the asset was replaced after the
workflow with the exact installed Windows ZIP, and GitHub's digest matches above.

CSS SHA-256: f96abc28bf1bb86a813c962f250add72c74c944a33d760f164d554ea67d28481.
Content JS SHA-256: 4e6bd3d4eee178c427a79bc92bf4df803cca0df96769231806846b3be86544fa.
Fictional proof: outputs/schedule-status-v0.17.10/widened-1440.png.
The prior native Optimizer response limitation remains unresolved.

## v0.17.9 historical record

User asked for further improvements to the cramped course list and scattered
section details. Widened the index (248–288px, medium 228px), kept Details/Class
actions on one row, unified selected background and bounded the filter width.
Docked content caps at 1040px. Wide detail tables have one primary heading band;
plain metadata THs are visually clipped while interactive native headings remain
visible. Rooms/instructors retain local captions and always-visible native data.
Native Change controls now have a visible 28px outlined target.

Visual review at 2048/1440/1280/960/390 uses fictional data only. The Details
suite covers 6 widths plus long metadata/native help, identity, hidden states,
printing, dismissal and full restoration. The wider-list test exposed an old
drag autoscroll bug: the controller selected the non-scrolling outer section
instead of #panelPlan. The old browser assertion accepted the scroll caused by
opening Class actions. Fixed the scroll host; the browser test now requires an
actual scroll delta down and back up, with no native commands or page scrolling.

Final typecheck, all 315 unit tests and production build pass. Broad workspace
checks pass at 9 widths plus lifecycle/long content/printing; course controls at
5 widths; empty plans 8 variants; Details 6 widths plus native-help/long-metadata;
matching production preview 4 widths. No outgoing fixture requests or errors.
Final CSS SHA-256: 13bb963a233b26712effa9552815335c66e3a9069af1f7460a2c160e076aa270.
Final content JS SHA-256: 459d9a1e0ec349378a50eafa3e301138603fd7f2ea105c9a423e34b9c0f2531d.

Installed 0.17.9 to existing Downloads/better-myucla-v0.10.3/dist; all 17 files
match production by SHA-256. Backup: outputs/installed-backup-v0.17.8. Release ZIP
outputs/better-myucla-v0.17.9.zip SHA-256:
f63c1afaa1524fffd8cf65ae0d76b75265c50bba0d017cbf93750cc80efd1b7d
User reloaded/refreshed. Bounded live inspection on the exact ClassPlan URL
confirmed 288px course list, 320px filter, same-row Details/Class actions, clipped
duplicate plain headings, visible room/instructor fields without overflow, and
28px outlined native Change targets retaining #aspnetForm. No horizontal page
clipping. Existing open course and selection left untouched; tab marked deliverable.
No real-page screenshots, course/account contents or live mutations were taken.

Code `6c8aab5` is pushed to fork/planner-redesign. CI `37174078214` and Release
`37174080787` passed. v0.17.9 is a prerelease; after the release job completed,
the asset was replaced with the exact installed Windows ZIP. GitHub's asset
digest matches the SHA-256 above.

Fictional rendered proof: outputs/course-layout-v0.17.9/detail-after.png.
Existing live Optimizer response limitation remains unresolved; this change
does not claim to repair it. No live plan/enrollment changes are authorized for QA.

## v0.17.8 historical record

User requested clear boundaries around the tiny expand/collapse chevrons and
other focused UI improvements. This is CSS-only plus release/preview metadata;
no runtime JavaScript, native handlers, status wording or form behavior changed.

Primary fold buttons keep their 38px hit areas and accessible labels/titles,
with a border, light fill, CSS chevron reflecting aria-expanded, visible hover
and stronger keyboard focus. Class actions gains a quiet outline and chevron.
Close details/Information retain 44px targets with visible outlines. Native
secondary disclosure headers and Help gain quiet boundaries; About/final-exam
summaries are framed, and open Plan Actions has a distinct active appearance.
Narrow Find headings put the title/fold above the original link/help. Details
reserve 56px for Close; long titles have 10px measured clearance.

Typecheck, 315 unit tests and production build pass. Existing production-browser
checks pass: workspace 4 widths plus lifecycle/long content/printing; Search 7;
module controls 4 viewports; Plan Actions 4; Details 6; matching preview 4. Final
visual inspection at 1440/390 covers default/hover/focus/open/closed controls,
long titles, narrow Find, Details and Information Close; no horizontal clipping,
script errors or unexpected requests. No new trivial styling tests were added.
Fictional before/after proof: outputs/control-affordance-v0.17.8/before-after.png.
Final CSS SHA-256: 3ba0dc5e282b00d29bf52f6a130e6b8ce43805cfd0c98ad4d14e1e54e8be5067.

Installed 0.17.8 in existing Downloads/better-myucla-v0.10.3/dist; all 17 files match
production by SHA-256. Backup: outputs/installed-backup-v0.17.7. Release ZIP:
outputs/better-myucla-v0.17.8.zip, SHA-256:
974b8fbd519bde2794c6e95ca0317b662ce1f7e2d9e42eb0b9efe243a7eac484

User reloaded the extension and refreshed Class Planner. Bounded live inspection
on the exact ClassPlan URL confirms the new 38px outlined controls and light fill.
My classes and Find classes collapse/expand correctly, with matching accessible
labels, content visibility and directional chevrons. No horizontal clipping in
either view. Restored both expanded and My classes active; tab marked deliverable.
Previous Optimizer native-response limitation remains unresolved; this cosmetic
change does not claim to repair it. No live plan/enrollment changes, screenshots
or account/course content were collected in this turn.

Code commit `6bfd855` is pushed to the fork's planner-redesign branch. CI
`37172430221` and Release `37172446359` passed. v0.17.8 is a prerelease; after
the workflow completed, its ZIP was replaced with the exact tested/installed
Windows build. GitHub's asset digest matches the SHA-256 above.

## v0.17.7 historical record

User reported Final exam week and asked for every page button to be checked.
Live reproduction found a 640px finals table inside a roughly 200px course list,
lost focus, and native Study/Personal Help popovers clipped behind navigation.
Finals now has one entry, an owned nonmodal dialog, local scrolling and Close/
Escape/outside dismissal with focus return. More uses an owned top-layer popover.
Stale finals close on plan/root/course replacement, trailing course removal or
native in-place exam changes; unrelated/owned changes are ignored.

Additional regressions found hidden recovery actions inside their hidden parent,
search labels left behind by hidden fields, section grids overriding native hidden
rows, missing Study/Personal disclosure icons, and a natively closed calendar
remaining blank after Original-layout return. These are fixed. Explicit module
expansion forwards only exact validated native disclosures; mount/redraw never
opens them automatically. All primary/secondary original controls remain native.
Help popovers retain their own nodes and handlers, bounded to the active pane.
See docs/CONTROL_AUDIT.md and the 0.17.7 contract/privacy changes for boundaries.

Required typecheck, all 315 unit tests, production build and core harness pass.
Final production-browser passes: search 7 widths; Details 6; Results 12 cases;
Plan Actions 4 viewports; Optimizer 4 widths; Empty-plan 8 variants; Finals 5 viewports;
native module controls 4 viewports; course controls 5 viewports; broad workspace 4
main widths plus redraw/printing/lifecycle/divider checks. Course actions include
notes, both Undo controls, recovery restore/discard, pointer/keyboard reorder,
Save/Stop, foreign-plan rejection and error Reload. Requests were intercepted
with fictional data. Preview rebuilt from matching production modules and hashes,
verified at 1440/1280/960/390; it does not claim to emulate UCLA's backend.

Installed 0.17.7 to the existing Downloads/better-myucla-v0.10.3/dist; all 17 files
SHA-256 match production. Prior 0.17.6 backed up under outputs/installed-backup-v0.17.6.
ZIP outputs/better-myucla-v0.17.7.zip SHA-256:
9f3251e1be64abe9bf2b607cff36054b9dd48c12eb21e4754882078fa32a5697

Code commit `4ebd7b5` is pushed to the fork's planner-redesign branch. CI
`37169130903` and Release `37169153266` passed. v0.17.7 is published as a
prerelease; after the workflow finished its asset was replaced with the exact
tested/installed Windows ZIP. GitHub's digest matches the SHA-256 above.

Live pre-update check: all 7 Plan Actions hit targets, handler/form identities;
Rename/Save a Copy/Load/About opened and closed without submission. Native Grid±,
Agenda and category switches were exercised; original display settings restored
(Study+Plan on, Alternates off, Grid only). Slow redraws need settled visibility
checks before the next click; networkidle alone did not establish completion.
Native Optimizer stayed collapsed even via Original-layout heading; this remains
an explicit live limitation pending fresh-load verification, not a fixture pass.
No live plan, enrollment or annotation was changed. No real-page screenshots or
account/course content were copied into the repository.

Awaiting user's one reload of the extension + Class Planner refresh. Then inspect
actual finals menu/panel sizing+dismissal, Help bounds, native expansion and safe
Plan Actions. Preserve the current user's selections. Browser binding is Chrome 3,
verifiedPlannerTab 505443073; exact ClassPlan URL, user tab marked handoff.
Do not claim all buttons pass on UCLA solely from the fictional tests.

## v0.17.6 historical record

User requested normal behavior for every Plan Actions option, a readable Search
classes button, and rooms/instructors visible without another click. Removed
those metadata disclosures from Find classes and My classes Details; original
fields/help remain in place, with all native hidden states preserved.

Live structural inspection reproduced Load and About as static direct-host
children stealing workspace grid rows. Recognized native Load/About/Save/Response
panels now receive bounded positioning in place. All original fields, parents,
form ownership and handlers remain intact. Exact close-only forwarding adds
Escape and a Close load plan button; no plan mutation is automated. An anonymous
native menu replacement now survives reconciliation and Original-layout restore.
Short-screen menus scroll within their available height; native hidden entries
stay hidden. See the 0.17.6 contract for observed native panel shapes.

The Search classes native input retained UCLA's white-gray gradient behind the
extension's white caption. Scoped CSS now uses solid blue when enabled and dark
text on a neutral background when disabled, with visible keyboard focus. The
native name, Go value, form and disabled state are unchanged.

Search fixtures pass seven widths, Details six widths, and result fixtures twelve
single/multiple-course cases. Metadata is immediately visible; original status
content, control identity, hidden states, printing and restoration pass. Long
results check all nine last-section fields for pointer reachability instead of
requiring invisible card padding to fit under the footer. Typecheck, 272 unit
tests, production build and matching preview verification pass. Broad workspace
regressions pass, including native redraw, empty plans, long results and header
preferences. The Plan Actions browser harness verifies all seven native handlers,
dialog submitters, Delete cancellation/confirmation, Load selection, Print,
foreground-message dismissal and focus return at 1440x900, 1280x900, 390x900 and
390x600. These plan-changing actions run only on fictional fixtures.

Installed v0.17.6 in Downloads/better-myucla-v0.10.3/dist; all 17 files match the
tested production build by SHA-256. Previous installed v0.17.5 backed up under
`outputs/installed-backup-v0.17.5`. After the user reloaded and refreshed,
bounded live checks verified all seven original menu entries retain their native
handlers and form. Rename/Save a Copy/Load/About opened and closed correctly;
the panels fit the viewport and workspace height stayed constant at 691.95px.
Native Close and Escape returned focus to the visible triggering entries.
No field values were read or changed, no saved plan selected, and no New/Delete/
Save/Print action was submitted live; those flows passed fictional fixtures.

Live My classes Details show both original room/instructor fields for lecture
and discussion with transparent cell backgrounds and native form ancestry. The
search button is 128x42, with no gradient, readable disabled caption, unchanged
native disabled state and form. Find keeps the schedule visible; returning to
My classes retains details. No horizontal page overflow or open action panel
remained. The real page was left on My classes Details; no account/course text,
field values or real-page screenshot was captured.

Code commit `7ad4e1e` and live-verification commit `88916e3` are on the fork's
`planner-redesign` branch. CI `37166887966` and Release `37166890105` passed.
v0.17.6 is published as a prerelease. Its asset was replaced after the release
workflow with the exact installed/tested build; GitHub's SHA-256 matches local:
`1509ea23a2b5cc0b98b81ba94d1751f9e385c579f02724336f52fd0c4dc6d4df`.

## v0.17.5 historical record

Live inspection reproduced the blank Optimizer pane: navigation selected the
module while UCLA's `#panelOptimizer.hidden` remained collapsed. One explicit
click on the original heading loaded its controls through a native partial
postback. No optimizer calculation or plan/course mutation was invoked.

Explicit workspace navigation now forwards that verified native expansion once;
mount, redraw and implicit module restoration do not. Pending feedback keeps
the original heading available for retry. Validation, loading deduplication and
restoration retain native control/form/handler identity. The original disclosure
icon is visible again, and the opened native panel has consistent outer padding.

Live Details geometry measured a 919px-wide section row at 161px tall, with
gray native cell backgrounds, centered days and a three-line floated status icon.
Plan Details now reuse the original table headings for compact aligned columns
in wide panes and two labeled bands in narrower panes. Native background/icon
resets apply only to validated marked plan/result cells, keeping Study list
opaque. Optional fields, statuses, native hidden choices and controls stay intact.

Dedicated Details browser checks pass at 2048/1440/1366/1280/960/390; the fictional
wide one-line row shrinks from 161px to 55px. All twelve search-result cases pass
with the stronger native-style fixture. Typecheck, 255 unit tests, production
build, the four-width Optimizer suite, broad workspace suite and preview checks
pass. The Original-layout return at 390px is keyboard-tested because the fictional
native fixture restores a fixed-width sidebar; desktop returns are pointer-tested.

The installed unpacked extension is v0.17.5; all 17 files match the production
build by SHA-256. The previous installed v0.17.4 is backed up under
`outputs/installed-backup-v0.17.4`. The live tab timed out before reload verification;
the user has been asked to reload the extension and sign back into Class Planner.
Do not claim the new build passed live verification until that is completed.

Code commit `489e548` is pushed to fork branch `planner-redesign`; CI
`37162949600` and Release `37162951331` passed. The v0.17.5 prerelease is published.
After the release workflow completed, its asset was replaced with the tested
installed build. GitHub reports ZIP SHA-256
`32437122adb3ac6f87017829a9cc80f8e7c313fe32dd416da295bc0799c65e7c`, matching local.

## v0.17.4 historical record

Live recheck of v0.17.3 after the user signed in found the workspace still absent.
The exact recorded empty `#panelPlan` was present, but Study list `#panelNotplan`
also contained `#div_landing > table` with native course rows. The empty validator
incorrectly rejected those unrelated rows. All other native shape checks passed.
Only structural booleans, element types/classes/IDs and geometry were read; no
course names, values, account text or real-page screenshots were captured.

The absence check now scopes to `#panelPlan`. The editable adapter was already
scoped correctly and stays unchanged. Native Study content remains opaque, with
no course-context activation or extension course tools. Disposal now clears
drag styles only from the current plan rows, preserving Study row inline styles.

Typecheck, 239 unit tests and production build pass. The shared empty fixture
now includes a populated fictional Study list; tests cover native identity/form,
style preservation, no editable context/storage reads, stable reconciliation,
full/empty transitions and malformed-marker fallback/recovery.
Populated-Study browser checks pass at 2048/1440/1280/390, including initial empty
and native New Plan transitions, all modules/search/calendar, no remount loop,
native control/markup/styles preservation, Original/Tidy/dispose restoration,
no extra requests or course-context activation. Desktop/phone fictional views
reviewed; native Study tables retain local scrolling. The matching website
visualization also passes at 1440/1280/960/390.

Installed in Downloads/better-myucla-v0.10.3/dist; all 17 files SHA-256 match the
tested production build. Backup: outputs/installed-backup-v0.17.3. Earlier
rollback backups remain intact. After the user reloaded and refreshed, bounded
checks on the actual Class Planner verified the empty workspace alongside the
populated Study list. All six navigation destinations and Original layout are
visible; the calendar is 640px wide at a 2048px viewport. The empty plan has no
course tools, its duplicate details slot is hidden, and the page fits its width.
Study list and Find classes both open beside the calendar with original controls
in aspnetForm. Study has local scrolling and no extension course-editing tools.
Plan actions opens and closes with Escape; UCLA's native Load/About visibility
is preserved. Returned to My classes with the menu closed. Only local navigation
and disclosure controls were clicked; no native plan/course action was run.

Published prerelease: https://github.com/comet-ctrl/better-myucla-planner/releases/tag/v0.17.4
Implementation commit: 88ab790; release target with live verification: c76c418.
CI 37161310321 and Release 37161312911 succeeded on that target.
The published ZIP matches the installed build after the automated release job:
SHA-256 cef4c82bf5915415a6c99bf218d6f296d8186f179f738866b3a4e1f4d9136352.

## v0.17.3 historical record

The user explicitly requested trying Plan actions > New Plan. One live native
click on the exact Class Planner page rendered an empty working plan without a
dialog. All six native modules remained, but the course table disappeared and
v0.17.2 incorrectly dropped the workspace into the long native layout.

Empty-plan presentation now has a separate strict structural contract, recorded
in docs/MYUCLA_CONTRACT.md. It preserves search, calendar, module navigation and
native plan-menu visibility while leaving the editable/reorder adapter unchanged.
No course context, annotation/view/draft storage or reorder tools activate for
an empty plan. My classes displays one full-width native empty message. Unknown
structures stay native. Returning from Original layout validates current nodes,
rejecting detached course snapshots after a malformed native redraw.

Typecheck, all 238 unit tests and production build pass. The new
`npm run test:empty-plan` browser regression reproduces the v0.17.2 failure and
passes with v0.17.3 at 2048/1440/1280/390. It covers initial empty loads, New Plan,
all modules, search handlers, empty/full transitions, malformed states, native
identity/forms/visibility, Original/Tidy/dispose restoration and no empty course
storage or extra native actions/requests. Desktop/phone fictional visuals reviewed.
The broader workspace suite and exact-build website preview checks also pass.

Installed at Downloads/better-myucla-v0.10.3/dist; all 17 files SHA-256 match the
tested production build. v0.17.2 is backed up at outputs/installed-backup-v0.17.2;
the v0.16.0 rollback remains intact. The reload question has been sent; final
live v0.17.3 verification is pending. The tab subsequently reached UCLA's timeout
sign-out URL; the user must sign in again. No sign-out page text or field values
were read. The last planner state was the empty plan produced by the single
authorized New Plan click. Do not create another plan or select/save/enroll
courses for verification. After sign-in and reload,
check only bounded structure/geometry and local module navigation; do not read
field values or capture real account/course content.

Published source: 0888fae on the user's planner-redesign branch.
Release: https://github.com/comet-ctrl/better-myucla-planner/releases/tag/v0.17.3
CI passed: https://github.com/comet-ctrl/better-myucla-planner/actions/runs/37158574178
Release passed: https://github.com/comet-ctrl/better-myucla-planner/actions/runs/37158590195
The final published ZIP matches the installed build after the automated job:
SHA-256 a5400a3b05293c43030973a8793b56584f327cda17be88ae06660dfa23b15d90.

## v0.17.2 historical record

The user's next screenshot exposed legacy result styles that the fixtures had
not reproduced. Optional room/instructor data stayed visible even with Rooms &
instructors closed. Header help stacked at the right. Native clearfix boxes,
30px minimum cell heights and a three-line floated lock icon enlarged rows.

The fix scopes resets to marked, validated result rows. Optional data and its
native header help now share the Rooms & instructors disclosure. Open headings
align with the optional fields; labels/values align left. Status text, icons,
colors, nested widgets, native controls and form ancestry remain unchanged.
No runtime JavaScript, permission, request or storage behavior changed.

The shared fictional fixture now includes observed native result constraints.
Typecheck, 228 unit tests and production build pass. The broader browser suite
passes at 2048/1440/1280/390 and its additional long-result, print/restoration,
compact-header and lifecycle scenarios. Focused result verification passes all
12 single/multiple-course cases at 2048/1440/1366/1280/960/390, including strict
column alignment, native hidden states, print/Tidy restoration, unchanged native
status/control/widget identity and zero native actions or extra requests.
The regression fixture reproduces a 118px one-line row in v0.17.1, reduced to
46px in v0.17.2. Closed/open desktop and scrolled phone screenshots reviewed.
Website preview checks also pass at 1440/1280/960/390, and the preview is rebuilt
from the final production CSS.

Installed in Downloads/better-myucla-v0.10.3/dist; all 17 files hash-match the
production build. v0.17.1 is backed up at outputs/installed-backup-v0.17.1 and
v0.16.0 remains intact. User reload and live results verification are pending.
The existing browser tab subsequently reached MyUCLA's sign-out page; only its
URL was checked, and no other page contents were inspected. The user needs to
sign in, reload the extension/refresh and reopen results. Do not claim a live
v0.17.2 pass until that check is complete. Prior live v0.17.1 geometry exposed
the reported issue: Rooms aria-expanded=false while optional fields were visible,
result row height 119.4px and header height 79.2px.

Published prerelease source: c33e60f on the user's planner-redesign branch.
Release: https://github.com/comet-ctrl/better-myucla-planner/releases/tag/v0.17.2
Both CI and release build passed for that commit:
https://github.com/comet-ctrl/better-myucla-planner/actions/runs/37157366361
https://github.com/comet-ctrl/better-myucla-planner/actions/runs/37157367868
The final ZIP is the exact installed build (after the automated release build):
SHA-256 36719fb10c4df4c1f5aa342e5ba3cd408873c5920372b16324b900da6401a52b.

## v0.17.1 historical record

The user's live screenshot exposed a layout regression missed by the original
fixtures: native `.row` clearfix pseudo-elements became grid items, percentage
panel widths shrank again inside grid columns, and native inline `display:block`
defeated the field panel's flex layout. Inputs could shrink to about 70px on the
actual desktop page while Search By occupied the wrong column.

Scoped CSS now removes only the validated search row's clearfix, resets its
native panel/input widths, and overrides only the observed visible inline block
state. Native `display:none`, hidden attributes/classes, original controls and
form associations remain intact. The native label and colon stay together;
the original enrollment link follows the section heading visually.

Shared fictional fixtures now reproduce those native styles. The new
`harness/verify-native-search-layout.mjs` reproduces the old failure and verifies
the fix at 2048/1440/1366/1280/1100/960/390px, exact 599/600/699/700px container
boundaries, three-field modes, hidden states, control identity and zero search
events/extra requests. At 1440px inputs increased from 42px to 196px, and the
search controls decreased from 267px to 66px high. Fictional screenshots reviewed.

Typecheck, all 228 tests and production build pass. The broader production
workspace suite also passes at 2048/1440/1280/390px and its additional lifecycle,
long-result, print/restoration, future-term and compact-header cases.

Installed v0.17.1 into Downloads/better-myucla-v0.10.3/dist; all 17 files hash-match
production dist. The prior build is backed up at outputs/installed-backup-v0.17.0;
the original v0.16.0 rollback remains untouched.

After the user reloaded, bounded read-only checks on the actual Class Planner at
2048x927 verified 347.5px-wide inputs (previously 69.1px), a 66.2px-high search
band (previously 272.4px), aligned mode/inputs/submit and one-line field labels.
The native link follows the heading, the unused field stays hidden, all fields
remain associated with aspnetForm, and no horizontal page overflow occurs.
Switching My classes → Find classes preserves the fix and the adjacent calendar.
Only local navigation was clicked; no search, plan or enrollment action was run.
No real course contents or search values were read, captured or stored.

Published prerelease source: c3c3053 (planner-redesign on the user's fork).
Release: https://github.com/comet-ctrl/better-myucla-planner/releases/tag/v0.17.1
CI passed: https://github.com/comet-ctrl/better-myucla-planner/actions/runs/37155540081
The attached ZIP is the hash-verified installed build. The regenerated website
preview passes at 1440/1280/960/390px with zero requests and inert account actions.

## v0.17.0 historical record

Current-build visualization added: `src/preview/index.ts` imports the production
presentation modules; `npm run preview:build` creates the offline fictional
`site/workspace-preview.html`. Exact CSS and production content hashes are
embedded. Shared modules must match dist/content.js.map before generation, so
stale JavaScript cannot silently produce a different preview. Live origin guards,
permissions and runtime code are unchanged. All 17 rebuilt dist files still
hash-match the installed extension; no user reload is needed for preview changes.

Preview-only native search is a local simulation; account actions are blocked.
Fixtures approximate native calendar/module content. Navigation, Details,
resizing, loaded result filtering and section selections use production code.
Standalone checks pass at 1440/1280/960/390. The inline wrapper also passes at
1440/1024/736/390; its bounded 800px scroll surface maps document scrolling so
Compact header/Show header work without host auto-height feedback. The old
course-browser visualization has been replaced. Source scripts are
`scripts/build-inline-preview.mjs` and `scripts/preview-fragment.html`.
Only fictional content was captured. The website hero now shows the current
workspace; public/demo.html remains explicitly documented as the legacy reorder
fixture. Pages deployment from main is separate from this branch's preview.

The approved design replaces the Plan/Find switch with named navigation, a main
workspace and a persistent weekly schedule. My classes details are visually
docked beside the list; native controls remain in their original course row.
Find keeps the original Search by selector and fields visible, with a local
index only for courses UCLA has already loaded. Optimizer, Study list and
Personal entries remain complete native modules. Information & help visually
places the original sidebar in the workspace without reparenting. Plan actions
wraps the complete original menu; its buttons retain their immediate parent.

Desktop navigation is 168px; the schedule defaults to 38%, bounded at 420–640px,
with a keyboard/pointer divider. Below 1280px navigation is horizontal; below
1100px a Schedule/workspace switch preserves local state. Narrow Find panels
below 600px allow local panel scrolling with usable index/preview heights;
desktop results scroll independently while search fields stay in view.

Native statuses, control identity/form association and UCLA navigation are
preserved. Per-section summaries update when native text changes in place.
Unknown native modules restore the complete original layout. Unknown result
widget siblings retain scrollable fallback. Native Go replacements survive
cleanup of the Search classes wrapper. No permission, request, server or new
persistent storage was added. Only fictional fixtures are screenshotted.

Typecheck, production build and 228 tests across 20 files pass. Production Chrome
fixtures pass at 2048, 1440, 1366, 1536 (735px tall), 1280, 1200, 1100, 960 and
390px. Coverage includes every module's native fields/handlers, control/status
identity, keyboard/mouse/touch, Details docking/focus, native calendar geometry,
print, Original layout/Tidy restoration, selections and local panel positions.
Additional checks pass for long results (2048/1536/390), single-course results
(1440/960/390), unknown module fallback, tall headers, five introduction widths,
quarter/redraw/reload/tab header persistence, empty/future quarters and local drag.
Desktop and phone screenshots were reviewed visually with fictional data.

Installed v0.17.0 in Downloads/better-myucla-v0.10.3/dist. All 17 files SHA-256
match the production dist. v0.16.0 is backed up and hash-verified at
outputs/installed-backup-v0.16.0 outside Git. ZIP and fictional screenshots are
also under outputs outside Git; v0.16.0 remains the published rollback release.

After the user reloaded, live verification passed on the exact Class Planner page
at 2048x927. All seven navigation destinations were reachable; the schedule stayed
visible beside every module. Native search-mode changes and one explicit public
instructor/course search loaded a single course into the bounded preview with
native controls still associated with aspnetForm. No course names or account
content were recorded. Details retained its native row ancestry, and Escape
closed it with focus returning to its trigger. Information & help returned to
the previous module. All original plan-menu controls were visible. Original
layout restored all six native modules and the original menu/sidebar, and the
workspace reopened successfully. Keyboard resizing changed the schedule from
640 to 624px and back. No horizontal page clipping occurred. Find is left open.
No Add, Enroll, Drop, Remove, Exchange, Waitlist, reorder or Save action was run.
Quarter transitions and print were verified in fixtures, not on the real account.

Published source/tag: 9a229e85c9a11ca272848f596a20067f2582606f.
Release: https://github.com/comet-ctrl/better-myucla-planner/releases/tag/v0.17.0
CI: https://github.com/comet-ctrl/better-myucla-planner/actions/runs/37151668605
Release build: https://github.com/comet-ctrl/better-myucla-planner/actions/runs/37151670022
Both workflows passed for the exact release SHA. ZIP: 361854 bytes; SHA-256
8a05ff14356ae27b743cae238d7b574c4495236425ded52a793803417db71be5.

## v0.16.0 historical record

Last updated: 2026-10-03

Current version: `0.16.0` (redesign beta)

The user rejected the visual design of v0.15.1 and pointed to GitHub's UI-design
topic. The new presentation uses a consistent light visual system, readable
14px body text, a flat workspace, restrained blue accents and larger controls.
The Find content is bounded at 1280px (1080px for a single course), with a 260px
course index. Classes defaults to 360px and can resize from 300 to 480px.

Each class initially presents its code/title, Details and Class actions. Class
actions reveals native ordering/color controls and owned order/note tools in
their original parent. Only one disclosure opens at once. Escape dismisses an
inner More menu before Class actions, and closing restores focus. Details,
Find, pane folding and restoration close actions. Explicit opening near the
bottom reveals the controls within the Plan pane only.

UCLA masthead/navigation, native status content, form controls/handlers and
calendar geometry/state borders remain unchanged. No framework, remote font,
network request, permission or storage feature was added. Public inspiration:
https://oat.ink/ and https://daisyui.com/components/list/ (principles only).

Typecheck, production build and all 220 tests across 20 files passed. The full
production fixture suite passed at seven workspace widths, three single-course
widths and five compact-introduction widths, including print, calendar geometry,
note editing, mouse/keyboard/touch actions, foreground Tools Escape priority,
native control/status identity, quarter transitions and local dragging. Desktop
and narrow screenshots were visually reviewed with fictional data only.

Browser testing caught note blur moving Class actions between mouse down/up.
Primary mouse-down now defers focus until click dispatch; the original blur/save
still runs normally. Foreground Tools dismisses before background class controls.

Installed v0.16.0 in the existing Downloads/better-myucla-v0.10.3/dist folder;
all 17 files SHA-256 match dist. The prior v0.15.1 build is backed up outside Git.
ZIP and fictional screenshots are under outputs outside Git. User reload and
live verification of v0.16.0 are pending; v0.15.1's live record below is historical.
The connected browser tab was no longer on ClassPlan.aspx at the final check;
do not inspect the other page. Reopen only the authorized Class Planner page.

Source and ZIP are published to the user's fork as the v0.16.0 prerelease:
https://github.com/comet-ctrl/better-myucla-planner/releases/tag/v0.16.0
Exact source 5ad38b3d05a70b8b012cdf0561ed8ce1dcdc7ee5 passed both workflows:
https://github.com/comet-ctrl/better-myucla-planner/actions/runs/37146547615
https://github.com/comet-ctrl/better-myucla-planner/actions/runs/37146569348
Published ZIP: 355993 bytes, draft=false, prerelease=true, SHA-256
80b727faa42fcf70f5f987065b41449026e389f12eec5fa946833be443193bef.

## v0.15.1 verification record

This is a visual refinement of the Plan / Find classes design. Details is first
in each class's control host and keyboard order, with a 34px minimum target and
aria-expanded state. Adjacent owned order tools are quieter but remain visible.
Native order/color controls keep their original parents and handlers.

Wide result previews (actual content width >=640px) use each group's original
native column headings, aligned with rows and sticky within the preview. Repeated
row captions are visually clipped but accessible; narrow cards retain labels.
Optional location/instructor fields keep their own captions when revealed, and
their native header help remains available even while the fields are folded.
No native header content, status text, form control, request or permission changes.

Typecheck, all 213 tests across 20 files and production build passed. The full
production fixture suite passed at seven widths, including the three single-course
widths, five introduction widths, print, redraws, compact-header persistence,
future-quarter transitions and local dragging. New checks cover Details-first
Tab order/size, shared-header alignment/stickiness, native header content/help,
control parents and narrow labels. At 960px both wide single-course and narrow
multi-course previews passed. No browser errors or extra requests. Fictional
desktop/narrow screenshots were visually reviewed.

Installed v0.15.1 in the same Downloads/better-myucla-v0.10.3/dist folder; all 17
file hashes match dist. Prior v0.15.0 is backed up outside Git. A ZIP and fictional
screenshots are under outputs outside Git. Source and ZIP are published to the
user's fork as the v0.15.1 prerelease. Exact source commit
098bf0f795d85cd7fce2182cded3b9dcd9969491 passed both workflows:
https://github.com/comet-ctrl/better-myucla-planner/actions/runs/37143916639
https://github.com/comet-ctrl/better-myucla-planner/actions/runs/37143938987
https://github.com/comet-ctrl/better-myucla-planner/releases/tag/v0.15.1
The published ZIP is 349909 bytes; release is non-draft and prerelease=true.
Authorized live verification passed on October 3 at 2048x983 after reload.
All six Details buttons show the new first-action placement, expanded state and
minimum size. First and last class Details keep the native row inline, schedule
visible and close control in bounds. Escape and Close return focus correctly.
A native subject/course/search sequence retains Find through redraws; the loaded
1911px preview has aligned shared headings, sticky positioning, clipped accessible
captions and visible native help. All inspected result controls retain their
original form. Rooms/instructors reveal with labels and no overflow; the result
survives Plan/Find switching. Tools exposes both pane controls, all three extra
module controls and Original layout. Compact mode remains active, BODY scroll
is zero and there is no horizontal overflow. Final view is Plan, compact.
No live plan or enrollment action was taken, and no private page contents were
retained. Installed files still match all 17 dist hashes. No new defect found.

## v0.15.0 verification record

The user approved replacing three competing panes with two task views within
the same extension/page. Plan shows a resizable 320px class list beside Schedule;
Find classes fills the workspace with native search and loaded course previews.
The segmented task control keeps the chosen view through partial remounts.
Original fields, selections, statuses and native handlers remain unchanged.
Escape in Find returns to Plan and focuses Find classes; native autocomplete
gets first Escape. No new storage, permission, network request or separate page.

Details now stays inline inside its original class card at every width. Only
the owned heading/disclosures move. Find closes Details before hiding its card.
Tools contains the two plan-pane reopen controls, three additional modules and
Original layout. One divider resizes Classes from 260 to 440px while reserving
Schedule room. Two columns remain at 900px and above; narrower windows stack.
UCLA navigation, native term and plan menus remain untouched. Header compaction
keeps its existing saved choice. Type/spacing are calmer; preview rows size
against their actual available width rather than the entire search area.

Typecheck, production build and all 211 tests across 20 files passed, as did the
full production fixture suite at seven widths, including intro/header lifecycle,
future-quarter transitions and local dragging. Final focused checks passed at
1440, 960 and 390px after narrow class-control wrapping, printing all six modules
from Tools initially open/closed, and revealing inline Details at the pane's
lower edge. No browser errors or additional requests. Final desktop/mobile
screenshots were visually reviewed using fictional data only.

Installed v0.15.0 in the existing Downloads/better-myucla-v0.10.3/dist folder;
all 17 files SHA-256 verified. v0.14.7 is backed up outside Git. Source and ZIP
are published to the fork as the v0.15.0 prerelease. Exact code commit
837b02b4b0182808a9598b3b6dbd9016b6129ab4 passed CI and release packaging:
https://github.com/comet-ctrl/better-myucla-planner/actions/runs/37108200960
https://github.com/comet-ctrl/better-myucla-planner/actions/runs/37108220893
https://github.com/comet-ctrl/better-myucla-planner/releases/tag/v0.15.0

After reload/sign-in, authorized live verification passed on October 3 at
2048x983. Plan shows Classes and Schedule; Find classes uses the full width.
Opening the last class's Details keeps its close control visible/focused and
the schedule visible; Escape closes it and returns focus. Find survives native
subject/course/search redraws, showing a single loaded preview without the
duplicate index; native inputs retain their original form association. Loaded
results survive Plan/Find switching. Tools exposes both pane controls, all three
secondary modules and Original layout; Escape closes Tools before returning
Find to Plan. Compact choice remains active; Show header restores root scroll
zero and Compact header returns the title to 12px with the term visible.
Final view is Plan, compact; BODY scroll is zero and no horizontal overflow.
All 17 installed files still match dist SHA-256. No live plan/enrollment action
was taken. Only structural facts were retained. Do not inspect credentials or
other MyUCLA pages; screenshots/fixtures must use invented course/account content.

## v0.14.7 verification record

The user asked for another hands-on review. Live inspection of v0.14.6 reproduced
an empty inspector after Details followed by Expand Browse: Classes was hidden
with the native details row still inside it. The expand action now closes that
inspector before revealing results. Single-course searches show only their
preview, without duplicate course index/filter/count. Known native planner
notice spacing is reduced; content and navigation remain unchanged.

Independent fictional-browser review found checked sections hidden in other
course previews and preview scroll resetting on section-row redraw. A normally
hidden count/disclosure now offers review buttons for off-preview selections;
these reveal/focus existing checked controls without changing their state.
Only checked booleans from validated selection cells are read, never values.
Both index and preview scroll survive same-result redraw. Unknown extra course
heading controls trigger native fallback instead of being hidden. Partially
loaded result sets still use MyUCLA's native loading flow; no prefetch added.

Typecheck, 201 tests across 20 files and build passed. Production fixtures passed
at seven widths, including Details-to-Browse, checked selection review, native
identity and print; single-result presentation passed at 1440, 960 and 390px.
Five-width intro/root scrolling, persistent header, future/current transitions
and local dragging also passed. Single-result and selection-reminder screenshots
were visually inspected using fictional courses only.

The installed build is v0.14.7; all 17 files are SHA-256 verified. v0.14.6 is
backed up outside Git. After user reload, authorized live verification passed
Details to Expand Browse both before and after a native search. A single loaded
result hides the duplicate index/filter/count and fills the preview width.
Escape restores all three panes and button focus. All three additional modules
remain accessible; original search controls retain their form association.
There is no horizontal overflow, BODY scroll remains zero, and the saved compact
choice remains active. Checked-selection review was tested only on fictional
fixtures. No live plan/enrollment action was taken; retain structural facts only.
Preserve all original UCLA navigation. Use only the authorized Class Planner tab.

Source and ZIP are published to the user's fork, explicitly marked prerelease.
Code SHA 660024d09ed7aaa92807ede07e416695d5d69650 passed CI and release packaging:
https://github.com/comet-ctrl/better-myucla-planner/actions/runs/37041125966
https://github.com/comet-ctrl/better-myucla-planner/actions/runs/37041133579
https://github.com/comet-ctrl/better-myucla-planner/releases/tag/v0.14.7

## v0.14.6 verification record

This review adds Expand Browse / Restore panes and a responsive list-and-preview
view inside the existing native search section. The loaded-course filter is
owned, unnamed and memory-only; Enter never submits. The selected heading is
shown above its native sections, with arrow/Home/End index navigation. Local
filter/disclosure/focus/list-scroll choices survive a section-row redraw, and
new result sets reset them. Widening Browse preserves previous pane choices;
Escape or named pane buttons restore them. Native controls/statuses/handlers
and original UCLA navigation remain unchanged. Incomplete result sets remain
native; no background load or request is added.

The review also fixes controller disposal/startup races and wrong-plan local
notes/view/draft state after partial context changes. Stale async responses are
ignored; prior plans' persisted drafts survive. Invalid/future quarters remove
obsolete save controls while retaining independently validated introduction UI.
Original layout reattaches its return button after redraw. Print reveals all
loaded courses and optional room/instructor fields without viewport clipping.

Automatic workspace remounts now preserve root scroll across the temporary
document-height clamp caused by removing the old spacer. This does not change
explicit Original layout or disable behavior. Saved compaction still supplies
its minimum scroll after the new layout is positioned.

Typecheck, 196 tests across 20 files and the production build passed. Final
workspace/browser fixtures passed at seven widths, including print, a five-width
introduction/root-scroll series, compact preference across redraw/reload/tab
return, both future/current transitions and local dragging. Independent native
search and calendar/layout regressions passed. Screenshots were visually reviewed
at 1440, 960 and 390px. No new requests were observed in isolated fixtures.
The existing unpacked build is updated to v0.14.6; all 17 files SHA-256 verified.
Prior v0.14.5 is backed up outside Git. After user reload, authorized live QA
passed full-width Browse and persistence through native subject/course/search
updates. Loaded index and preview were side by side, selected heading matched,
native controls retained their form, and there was no horizontal overflow.
Local no-match filtering and Enter kept Browse open; clearing restored the
preview. Escape restored all three panes and button focus. Switching Fall to
Winter future plan removed obsolete save controls and retained Show header;
returning to Fall restored all six modules with BODY scroll zero. Show header
then Compact header left Fall's title and term at 12px. Retain only structural
facts, not actual course names/account contents. No live plan or enrollment
action was taken. Source and ZIP are published to the user's fork, with v0.14.6
explicitly marked prerelease. Code SHA c4e49940c76caeb255bf2f624d2a87cb2851afc9
passed CI and release packaging:
https://github.com/comet-ctrl/better-myucla-planner/actions/runs/37039114974
https://github.com/comet-ctrl/better-myucla-planner/actions/runs/37039176249
https://github.com/comet-ctrl/better-myucla-planner/releases/tag/v0.14.6
Only fictional fixtures/screenshots may be retained. No live course, plan or
enrollment change is authorized for verification. Use the existing Class Planner
tab only. Keep dist untracked and publish only to the user's fork.

## v0.14.5 verification record

Status: persistent Compact header / Show header is built and verified on fictional
production fixtures. Typecheck, 182 tests across 19 files and build passed.
Seven-width workspace and five-width introduction QA passed. A saved one-boolean
preference survives native quarter redraws, fresh controllers and browser-tab
return. Show header and native-menu keyboard focus release compaction. No new
requests, polling, permissions or account/course storage were introduced.

Authorized live inspection found future quarters have no editable class table.
The exact-page bootstrap now permits independently validated introduction
presentation there, while the adapter/reorder contract stays unchanged. Fictional
QA covers starting on a future quarter, current/future redraws both directions,
normal course tools only after validation, native identity and Tidy restoration.
The control scrolls the document only, never styles, hides or moves UCLA's menu.
The existing unpacked build is updated to v0.14.5, all 17 files SHA-256 verified.
The old v0.14.4 build is backed up outside Git. After the user reloaded/refreshed,
authorized live QA passed: Fall to Winter future plan retained Show header and
title/native term at 12px; a fresh Winter reload retained that choice. Show header
restored root scroll zero and its off choice survived returning to Fall. A new
compact choice survived Fall reload. Native header class/style remained unchanged,
BODY scroll remained zero, there was no horizontal overflow, and all six modules
returned. Only structural checks and a public heading crop outside Git were saved.
No class/plan/enrollment action was automated. Final page is Fall, compact.
Source and ZIP are published on the user's fork under v0.14.5, redesign beta.
Code SHA: db1acee521ee6b855719e4ab459f4cef9882f1f3. Exact-commit CI and release
packaging passed; the release is explicitly marked prerelease:
https://github.com/comet-ctrl/better-myucla-planner/actions/runs/36980554461
https://github.com/comet-ctrl/better-myucla-planner/actions/runs/36980556043
https://github.com/comet-ctrl/better-myucla-planner/releases/tag/v0.14.5
Never automate plan/enrollment actions.

## v0.14.4 verification record

The prior build was installed with all 17 files SHA-256 verified; v0.14.3 was
backed up outside Git. Source and ZIP were published under v0.14.4, code SHA
8e9ad669d827273278107e61d5097da0a1b8b18f. CI/release packaging passed:
https://github.com/comet-ctrl/better-myucla-planner/actions/runs/36977363593
https://github.com/comet-ctrl/better-myucla-planner/actions/runs/36977366150
https://github.com/comet-ctrl/better-myucla-planner/releases/tag/v0.14.4
Live clicks verified one-time compaction and Show header restoring the menu.
The user reported that changing quarters resets it, motivating v0.14.5.
The browser screenshot clip uses document coordinates and can return root scroll
to zero: inspect fresh bounds and use the owned control to restore the intended
view afterwards. Retain only public heading crops outside Git, never account
or course content. The planner is left compacted for the user.
Screenshots and the versioned ZIP belong outside Git under outputs.

## v0.14.3 verification record

The preceding compact introduction and intentional page scrolling were built, tested,
installed and verified on the authorized live Class Planner tab. Source and ZIP
are published to the user's fork; GitHub CI and release build passed for db9f48e.

The pre-redesign source at aa992da is saved on the user's fork's
planner-improvements branch and GitHub release v0.13.0, with a complete ZIP:
https://github.com/comet-ctrl/better-myucla-planner/releases/tag/v0.13.0
Do not rewrite that snapshot or push to upstream.

The redesign lives on the separate planner-redesign branch. The presentation has been
rebuilt around Classes (left), Schedule (center) and Browse (right). Side panes
resize with pointer/keyboard dividers. All three remain independently foldable
and reopenable. Widths/choices are in memory only. UCLA navigation and plan menus
retain their original nodes and placement. The term selector keeps its native
parent/form but appears beside the compact title. All three secondary
modules remain native under Tools (3); Original layout restores all six sections.

The user explicitly wants UCLA's untouched banner/menu to scroll away normally.
PlannerIntroduction compacts only the known lower introduction, wraps existing
text/links in About this planner, leaves term notices/alerts visible and exposes
all original sidebar widgets through Links & help. Sidebar/term parents, controls
and handlers remain native; its contents are never copied or logged. Unknown
introduction shapes remain native. ×/Escape closes info with focus return.
Root document scrolling replaces the old clipped BODY rule; BODY has visible
overflow and cannot scroll independently. A full-height owned flow spacer gives
the page room to scroll the banner away. Marker viewport bounds position/expand
the fixed workspace; a passive root-scroll listener updates Details and tools.
Narrow/short-window fallbacks remain normal flow. Restoration removes the spacer,
listener, compact classes and controls and unwraps native replacement text safely.

CourseBrowserPresentation indexes only complete, already-rendered public result
headings and shows one native course body locally. Bodies can be direct siblings
of their headings or the older nested shape; duplicates fail closed. SectionCards
recognizes the exact native header labels including Day(s), Time in Pacific Time
and Instructor(s). Native help buttons stay accessible. SectionCards formats exact
nine-column section rows into labelled cards, appending owned text after native
children. Native controls/status innerHTML/action rows remain unchanged. Edit
search reveals original fields. Rooms/instructors expand locally. Unknown or
incomplete results retain native controls; no prefetching, input-value reads,
polling, storage or extra query is introduced. Last selected heading/id is memory
only. Row/cell replacement triggers reconciliation without reviving stale nodes.

Details dock in Browse instead of opening a blocking overlay. The native third
row remains under its original course tbody; CSS positions it in the reserved
inspector area. Other planner controls remain interactive. ×/Escape closes with
focus return; narrow windows move only the owned heading inline. There is no
backdrop or outside-click capture. Header identity and status wording remain
native. Never mark containers holding native descendants as extension-owned.
The exam note is a separate disclosure; the inspector heading is bounded and
content height is clamped to its pane and viewport. Native refresh-row inline
margins are compacted by scoped CSS, restored by removing workspace classes.

Typecheck, 179 tests across 18 files and the production build passed for the patch. Production
Chrome QA used isolated fictional fixtures at seven widths (including 1536x735
and 390px), covering pointer/keyboard resizing, pane folding/reopening, all six
modules, local course previews, no extra requests, native control/status/nav
identity, calendar geometry, docked/inline Details, focus, partial redraws,
restoration and long-list local dragging. Independent search and layout
regressions passed against v0.14.3. The sibling-result, native header-help,
tall-header/long-exam and constrained-BODY/long-sidebar scrolling checks also
passed. The scrolling fixture confirms hidden overflow permits the old behavior
before checking that non-scrollable BODY prevents it. Five introduction widths
(2048, 1440, 1280, 960 and 390px) also passed compact headings, term/notice
visibility, sidebar reopening/close/Escape/focus and restoration. Desktop checks
passed header scrolling away/back, full-height planner bounds, scrolled native
redraw position and Details tracking without any new requests. Fictional QA pictures and
versioned build ZIP live outside Git under outputs. Keep dist untracked.

Live inspection works after explicit human authorization for the browser
connector's required MyUCLA origin permission. Inspect only the existing exact
Class Planner tab. Do not navigate to other MyUCLA pages or inspect private
account data. Resizing, pane reopening, Details dismissal and all three secondary
modules passed on v0.14.0. Live native search exposed sibling result bodies and
an inspector overflow below a tall header; both fixes passed live on v0.14.1.
Live v0.14.1 confirmed real course previews, nested section expansion, native
help visibility, local field toggles, original-form controls and Details bounds,
exam expansion, ×/Escape and focus return. Native search redraw can scroll BODY
behind the fixed workspace despite window.scrollY remaining zero. That hides
navigation and makes the position marker negative. Desktop overflow:clip fixes
the BODY scroll; panes/narrow/flow layouts retain their own scrolling. Live
v0.14.2 confirmed clipped overflow is loaded, BODY scrollTop stays zero through
native subject/course selection, search and section expansion, and the workspace
marker and original header/term chooser remain on screen. Loaded course previews
and two section cards retain native form controls without horizontal overflow.
Details stays within Browse and the viewport; Escape returns focus and restores
the loaded results. All six native modules remain present. Record only these
structural checks, never account contents or actual course names.
v0.14.3 deliberately allows document scrolling of the unchanged header at the
user's request. Do not interpret its intentional offscreen position after a user
scroll as the old BODY bug. After the user reloaded v0.14.3, live checks confirmed
the smaller heading and native term selector, visible notices, explanatory
disclosure spacing, all four sidebar widgets, close/Escape/focus, all six modules,
document scrolling away/back and Details bounds when fully scrolled. A native
subject/course selection and search preserved the document's scrolled position
and compact presentation, with a loaded course preview, native-form controls and
no horizontal overflow. BODY scrollTop remained zero. Only structural facts were
retained; no account contents, course names or real-page screenshots were saved.
Never automate enrollment or plan-changing actions during live QA. Extension
manifest permissions remain the exact Class Planner path.

The source is published to the user's fork's planner-redesign branch and tag
v0.14.3 (code SHA db9f48ec1e5cc6ad99594fe812227a14c06eb627). GitHub CI and
release packaging passed. The current beta release is:
https://github.com/comet-ctrl/better-myucla-planner/releases/tag/v0.14.3
The local versioned folder and ZIP are in outputs. Earlier releases are preserved.
The existing unpacked extension folder is the installation target. All 17
installed v0.14.3 files are SHA-256 verified against dist. The preceding v0.14.2
build is backed up alongside earlier versions in outputs. The user reloaded and
refreshed; live v0.14.3 verification passed.
Tidy remains opt-in.

## Archived v0.13.0 handoff

v0.13.0 restores native status text/icons and removes aggregate course badges.
Known title + one DIV body modules now fold locally with consistent chevrons;
primary panes reclaim their column and reopen from persistent named buttons.
Secondary shortcuts unfold their content before locating it. Native header
toggle clicks are captured only in the validated workspace, with original
handlers restored in Original layout. Body inline styles/hidden attributes and
native controls are unchanged. Pane choices survive redraws in memory only.

Latest user constraint: UCLA's original top navigation must remain visible and
unchanged. The term chooser and original plan menus now keep their native
placements. An in-flow marker reserves original space above the wrapper; short
available heights use a flow fallback. Other sections is positioned below its
own summary, fixing a browser-test failure where it covered its close control.
Short windows may require local class-pane scrolling to retain the header.

Typecheck, 165 tests and production build passed. Fictional Chrome checks cover
native navigation/status identity, keyboard folding/reopening, empty-pane
recovery, all six modules, Details, redraws and restoration at seven widths,
including 1536x735; existing search/layout regressions passed. Live inspection
is unverified: automatic approval review rejected the exact Class Planner
URL repeatedly, including after fresh exact-page user authorization. Do not
retry through alternate browser surfaces or broad MyUCLA permission. Complete
isolated checks and request manual verification of the installed update.
`docs/UI_DIRECTION.md` distinguishes implemented fixes from recommended
adjustable panes and contextual course results; those larger changes are not
implemented. Keep work in the existing extension, never a separate app.

The final v0.13.0 build is installed in the existing unpacked extension's dist,
with all 17 files SHA-256 verified. The prior v0.12.2 build is backed up outside
Git. Release folder/ZIP and fictional QA images are in outputs. The user has
been asked to reload the extension, refresh the planner and manually check
navigation and module controls, because live access remains blocked.

Source publication uses the existing `planner-improvements` branch on the
user's `comet-ctrl/better-myucla-planner` fork, not the upstream remote. The
preceding v0.12.2 commit was pushed successfully and CI passed. Build outputs
and fictional screenshots remain outside Git.

v0.12.2 adds outside-click dismissal, an accessible 44px × close button and
an Escape hint to course details. Outside clicks are captured before they can
activate page actions, while the original third-row contents remain interactive.
Focus returns without scrolling. The owned backdrop and document listener are
removed on restore/redraw. Typecheck, all 165 tests and build passed. Isolated
production Chrome checks passed dismissal, focus, native controls, restoration,
redraw and responsive geometry at six widths; search/layout regressions passed.
The installed v0.12.2 build was hash-verified across all 17 files. After the
user reloaded, live QA passed outside-click dismissal, Escape, the × button,
focus return, native section-table interaction/form ancestry and zero page
scroll. All six original sections remain present. No enrollment or plan change
was performed. The planner is left open with details closed. The prior installed
build and fictional QA images are retained locally outside the repository.
The working Git branch is `planner-improvements`. Publish reviewed source to
the user's `comet-ctrl/better-myucla-planner` fork, whose main currently matches
the local base. Do not push to the upstream `Astro-wen` repository. Build files
and local QA screenshots remain untracked. CI runs on main and
planner-improvements. Future live updates require the user to reload the
unpacked extension and refresh the planner; Chrome's internal extensions page
cannot be operated by the browser-control tool.

v0.12.1 widens desktop search to at least 520px and adds Expand search /
Restore columns (Escape also returns) on the existing MyUCLA page. Only the
known `.ClassSearchList .row-fluid.class-info.table-width2` rows get a 940px
minimum width; the narrow column scrolls locally, expanded results use the full
workspace width. No native nodes/controls are replaced or cloned. The three
other panels now have named shortcuts in Other sections (3) & actions:
Plan Optimizer, study list outside this plan, and Personal Entries. Original
layout restores all six native sections; Escape closes the tools disclosure.
Typecheck, 163 tests and build passed. Production-bundle isolated Chrome QA
passed at 1920/1440/1536/1280/960/390px, including fictional nine-column results,
native disclosure/controls, expansion/focus, all six sections, restoration,
partial redraw and local dragging. Search/layout regression harnesses passed.
Live pre-change testing confirmed search was 395px wide at 1536px; native result
rows became ~196px tall from wrapping. First native query returned a MyUCLA
error; a clean page and second query produced section results. Only public
search and course disclosure were used, never Add/Enroll or other plan actions.
The build is installed in `<existing unpacked extension folder>/dist`,
with all 17 build files hash-verified. Prior installed v0.12.0 is backed up in
`outputs/installed-backup-v0.12.0`; release folder/ZIP and fictional QA pictures
are in `outputs/`. User reload and live verification are still pending.

v0.12.0 has been copied into the user's existing
`<existing unpacked extension folder>/dist` and all 17 build files
hash-verified. The prior v0.11.1 files are backed up at
`outputs/installed-backup-v0.11.1`; release folder/ZIP and fictional screenshots
are in `outputs/`. Typecheck, 161 tests and build passed. Isolated Chrome checks
passed workspace bounds at 1920/1440/1536/1280/960/390px, native control identity,
Details/Escape/focus, exact restoration, panel redraw and long-list dragging;
existing search/layout regression checks also passed. Live inspection confirmed
the current native section structure, tidy enabled and no unsaved order before
the update. The user's first reload showed all three panels at 1536x735px,
but Details was missing: MyUCLA's coursetable has a header tbody plus one tbody
per section, so the original first-child selector counted 27 cells. The final
check uses only the first actual header row (nine cells), and the fictional
fixture now reproduces these groups. Corrected Details was verified live: six
buttons, original course-row/form ancestry preserved, headings visible, drawer
within viewport, Escape/focus return, and no unsaved order. Live CSS exposed
native title-cell margins (20px top/5px bottom) and landing margins (30px), which
made cards taller than the original fixture. These are now reset within the
workspace and reproduced in the fixture; six compact test cards fit at the
actual 1536x735 viewport. Final spacing build is installed and hash-verified;
live QA completed after the user's reload. Card heights shrank from roughly
116/96px to 77/57px. All three primary panels fit the viewport, with internal
scrolling for the weekly grid and longer content. First/last class Details,
native column headings/form ancestry, Escape/focus return and Original layout
restoration/return passed live. The main page stayed at scrollY=0. Workspace is
left open, with six Details buttons and no unsaved order. Native search loading
still remains; no full-catalog browsing or background loading was added. No
enrollment action was clicked and no account content was saved.

Latest product direction (2026-10-01): the user explicitly rejected a separate
page and switching between Week/My classes/Find classes. Work only through the
existing Chrome extension on the existing MyUCLA page. Keep schedule, class list
and search visible together in one desktop workspace, reducing page scrolling
and information density. Keep important conflicts and enrollment state visible.

`PlannerWorkspace` moves whole known native sections into a three-column deck
inside their original form. The term chooser remains accessible at the top;
native plan actions and secondary tools go in a disclosure. Compact cards open
their ORIGINAL third row as a fixed details overlay without changing its DOM
ancestry, controls or handlers. Only the read-only heading is copied. Close and
Escape return focus. Original layout restores the stacked sections; disabling
tidy also restores their presentation. Native replacement panels remount via
the controller, without resurrecting disconnected old nodes. Containers with
native content are deliberately not marked owned. Dragging scrolls the class
panel; windows at 1150px or less stack for readability.

Live search inspection found 92 native subject autocomplete rows before
submitting Go. The public titles are already available to browse; full section
times/seats arrive through the native result request. No enrollment/plan action
was clicked. Do not promise all live section details without loading them, or
silently add background requests. The current extension still uses its original
native search flow. The earlier separate course-browser visualization was
rejected; do not present it as the extension or continue building a separate app.

Previously installed copy updated and hash-verified at
`<existing unpacked extension folder>/dist` (folder name remains old,
manifest was 0.11.1). The previous installed build was 0.11.0, so installation
was not the cause of the missing UI. A backup is in the workspace's
`outputs/installed-backup-v0.11.0`. The following turn's live inspection confirmed
the search controls mount after the user's reload. This validates mounting,
not the broader desired course-browsing workflow, which remains unimplemented.
The original live autocomplete and explicit Go search were exercised, without
any plan or enrollment action. No live account content was copied into fixtures.

Search presentation: `ClassSearchPresentation` adds Subject / Instructor / GE
shortcuts, field labels and a More searches disclosure around the existing
native search controls. Native autocomplete inputs, full dropdown, Go input,
form association and handlers remain intact. Shortcut mode changes are explicit
user actions; there is no automatic query submission or extra request.
The live page exposed a v0.11.0 mounting failure: its native options contain
recorded online classes instead of CUTF. Offerings and their order vary by term.
Require exact known common mappings, and validate each grouped action's exact
value/label immediately before forwarding a change. Unknown modes retain the
original dropdown; never guess actions from similar labels. Grouped choices
appear only when offered, and changed options wake reconciliation.
Desktop fields share a row; mobile fields stack. A hint tracks Go's native
disabled state. Required autocomplete selections, not arbitrary typed text,
enable the native Go control (verified with an explicit live search).
The submit caption uses a pointer-transparent overlay. Its temporary aria-label
is restored. Navigation/More/submit wrappers contain native nodes and must not
be marked owned; restore the presentation before general owned-node cleanup.
A comment anchor restores the dropdown panel to its exact original position.
Search-only redraws must wake reconciliation even when the plan table is unchanged.
The optional tidy setting also enables a calm page theme, without hiding sections.
`harness/verify-search.mjs` covers native submit identity, mode choices, field
label updates, search-only replacement, restoration and four viewport widths.

Local layout update: the course rail keeps drag, position and collapse visible,
with top/note actions inside an ellipsis menu. The optional tidy switch also
adds reversible nine-column colgroups and folds recognized exam location
advisories. Originals remain intact. Calendar text insets are on the wrapped
lines, never outer box padding: native content-box `calc(100% - 3px/7px)`
widths already account for solid/double borders. Do not switch these blocks
to border-box or overwrite native positions, dimensions or border styles.

`harness/verify-layout.mjs` exercises fictional percentage-width, overlapping
meetings at four viewport widths, detects the old padding overflow, checks
short-meeting text, menu keyboard behavior, layout reversal and popup version.
The popup identifies the manifest version so an old unpacked build can be distinguished.

Section status update: tidySectionStatuses adds short per-row wording inside
the existing Status column. Native nodes move into a reversible wrapper that
is NOT marked extension-owned, so readOfficialText still reads the originals.
The compact summary is owned and ignored by source readers. The wrapper becomes
a tooltip on hover/focus; Escape dismisses it. Only static known icons/text in
the exact nine-column table shape are supported. Waitlist Taken counts describe
capacity filled, never the student's queue position. No status text is stored
or refreshed by requests. restoreSectionStatuses must run before owned-node
cleanup, and when the tidy switch is disabled.

`README.md` is the project tracker and the place to start. This file is the
architecture and trap list.

## Start here

This is a Manifest V3 Chrome extension for the exact page:

`https://be.my.ucla.edu/ClassPlanner/ClassPlan.aspx`

It enhances the existing UI and reuses MyUCLA's native ordering buttons. It is not an enrollment bot and must never automate enrollment-state changes.

Quick verification:

```bash
npm install
npm run typecheck
npm test -- --run
npm run build
```

Last verified result: TypeScript passed, 155 tests passed across 15 files,
the build completed, and the browser layout/search checks passed at four widths.

Session timeouts (verified in page source, 2026-08-20): `Timeout.js` extends the
idle timer on any `mousedown keydown click` and, when `keepAlive` is set, pings
every two minutes. MyUCLA opens its own warning dialogs (`#divFeatureTimeout`,
`#divMaxTimeout`). Do not rebuild a general-purpose countdown on top of that.

The plan is inside the `ctl00_main_wrapper` UpdatePanel — see
`docs/MYUCLA_CONTRACT.md`. Never attach a MutationObserver to the course table,
never wait only on an iframe `load` event, and never assume `beforeunload` will
catch a MyUCLA-initiated re-render.

Real-page gotchas already paid for — do not regress these:

- `#div_landing > table` interleaves `tbody.course_divider` between course
  `tbody.courseItem` nodes. Anything that walks or restyles rows must account
  for them.
- CSS custom properties declared on our injected elements do **not** reach the
  official course table. Declare tokens on `.pl-plan-root` as well, or every
  `var()` there silently drops the whole declaration.
- The page ships Bootstrap base rules; injected form controls need element-name
  specificity, including `box-sizing` for `input[type=search]`.

Live-page read-only verification on 2026-08-20 confirmed the offscreen frame is
readable, same-origin, and shows the same term/Plan/order as the visible page.
A first real *mutating* run has still not been watched — do that with a course
that only needs one or two steps.

## What is implemented

### Safe server-persisted ordering

Two engines share one contract. `FastReorderCoordinator` is tried first;
`NavigationReorderCoordinator` is the fallback.

`src/content/fast-reorder.ts` (default path):

- Opens one offscreen same-origin `ClassPlan.aspx` frame.
- Requires the frame's contract and term/Plan context key to match before any
  click. The course *order* may legitimately differ (a stale visible page), so
  the run re-plans from the server's real order as long as the course *set*
  matches; a different set returns `unavailable` and the controller falls back.
- After the first click the full expected order must match exactly, every step.
- Clicks one strictly whitelisted native button per full frame load, then
  revalidates the entire expected order.
- Maximum 60 adjacent native moves per action; cancellable at any step.
- The visible page is never reordered by the extension; it reloads once when the
  run ends, restoring scroll position.

`src/content/navigation-reorder.ts` (fallback path, unchanged):

- One native move per full *page* navigation, with a chrome.storage write-ahead
  record and a sessionStorage tab marker so only the initiating tab resumes.
- Maximum 20 moves, 5-minute pending-operation expiry.

Shared:

- Stops on page, term, Plan, DOM, button, or order mismatch.

Confirmation model (changed in 0.6.0): rearranging is local and writes nothing.
The single `保存` button names the number of changes and the estimated wait, and
is the explicit authorisation for the whole batch. This is a deliberate reading
of the "retain user confirmation" rule, not a relaxation of it — the student now
authorises every server write with one informed, deliberate click instead of
being trained to dismiss a confirmation per drag.

Realm note: `MyUclaPlannerAdapter` takes a `Document`, and its button check reads
`HTMLButtonElement` from that document's own view. A bare `instanceof` against
the top frame's constructor is always false for offscreen-frame nodes.

### Where the UI lives (changed in 0.9.0)

Measured on the live page on 2026-08-22:

- Every Class Planner section has a `.classPlanner_SectionTitle` bar: `#2C5E91`,
  7px radius, 5px padding, white 14px ProximaNova. MyUCLA parks that section's
  own actions on the right of it. The plan toolbar therefore mounts **inside**
  `#plannerSectionClip` and adds `pl-host-bar` to it (removed on dispose). The
  old placement above the table survives as a fallback.
- `td.linkPanelRight` is ~300px wide; `.OrderingButtons` uses ~73px. Card
  controls are an `inline-block` beside them, not a second row underneath.
  Do not restore `width: 100%` on `.pl-card-tools`.
- Anything pending lives in `#planner-lift-actionbar`, fixed to the bottom of
  the window: unsaved changes, the restore-a-draft offer, and save progress.
  `html.pl-has-actionbar` exists so the landing chip can dodge it.
- A 17-class plan is ~5,800px tall with 163-246px cards. Assume every move
  leaves the viewport.

### Local/read-only enhancements

- Up to 24-character local tags.
- Search current cards by course, instructor/page text, or tag.
- Per-course collapse and collapse/expand all. Compact mode was removed in
  0.9.0 along with its persisted `compact` view-state field.
- `src/content/page-polish.ts` changes MyUCLA's own markup, and is **gated
  behind the `plannerLift.layout.v1` switch, which is off by default**. This is
  a product rule, not a technical one: our own injected controls are ours to
  design, but MyUCLA's markup is what students already have in their hands, and
  reshaping it is opt-in. 0.10.0 shipped it on for everyone and had to be
  reverted in 0.10.1. Do not turn it back on by default.
  Three further rules hold there: read only text MyUCLA already rendered, never rewrite it (hide the
  original and add ours beside it), and bail out on any shape that does not
  match the contract exactly. Everything it does is undone in `dispose`.
  - The weekly grid lives outside `getRoot()` and MyUCLA re-renders it from its
    own toggles, so `needsReconcile` watches for an untidied `.planneritembox`.
  - The shared column grid is applied only when a `table.coursetable` header row
    has exactly nine cells. Do not widen that check; a different column count
    with fixed widths would misalign every row.
  - A bare `<td>` cannot be parsed from `innerHTML` in a test. Wrap fixtures in
    a `<table>`.
- Drag measures in **document space** (`pageY`), never `clientY`. The page
  scrolls under a long drag, so a viewport-relative delta slides the card out
  from under the cursor. Edge auto-scroll runs on its own rAF loop and
  recomputes the drag from `lastClientY + scrollY` after each scroll step.
- Move feedback: the view is never scrolled for the student. `animateToOrder`
  pins an anchor card, skips the FLIP for a card travelling further than one
  viewport, flashes the landing spot, and raises a chip naming the new position
  with Show me / Undo when the landing spot is off screen.
- Cached course snapshots and status text; search does not re-run the full DOM contract.
- Extension-owned DOM mutations are ignored to prevent reconcile loops.
- Reorder confirmation is an inline page bar instead of a blocking browser dialog; confirmation is still required.
- Existing MyUCLA color picker, multiple Plans, optimizer, and conflict UI are preserved.

## Real-page facts already verified

On 2026-08-19, with the user logged in and explicitly authorizing a minimal test:

1. A native up/down click submitted the MyUCLA form and caused full-page navigation.
2. The expected adjacent pair swapped.
3. A normal refresh retained the changed order, confirming server persistence rather than a DOM-only reorder.
4. The inverse native move restored the original order, and another refresh confirmed restoration.
5. No Enroll, Drop, Remove, Exchange, or Waitlist action was clicked.

Do not repeat live mutation tests casually. If a future DOM change makes revalidation necessary, use one adjacent move, record the original order, immediately restore it, and retain explicit user confirmation.

Exact sanitized selectors and button rules are in `docs/MYUCLA_CONTRACT.md`.

## Architecture map

- `public/manifest.json` — exact URL match and the single `storage` permission.
  Two content scripts: the isolated-world extension, and a page-world bridge
  that reads MyUCLA's timeout counters and nothing else.
- `src/page-bridge/index.ts` — the page-world bridge (reads two numbers, posts
  them same-origin, never writes to the page).
- `src/content/session-clock.ts` — validates those messages and derives the chip.
- `src/content/boot-hold.ts` — the quiet-reload hold.
- `src/content/index.ts` — selects the real MyUCLA controller or local fixture controller.
- `src/adapters/myucla-adapter.ts` — strict real-page DOM and native-button allowlist, bound to one `Document`.
- `src/content/fast-reorder.ts` — offscreen-frame reorder engine and the `PlannerFrame` seam used by tests.
- `src/content/myucla-controller.ts` — toolbar, bottom action bar, card controls,
  filtering, collapse state, tags, move feedback, confirmation UI.
- `src/content/navigation-reorder.ts` — cross-navigation one-step reorder coordinator.
- `src/content/plan-insights.ts` — pure read-only status detection, filtering, and summary logic.
- `src/domain/reorder.ts` — adjacent-move planning and expected-order functions.
- `src/storage/annotations.ts` — validated local tag storage.
- `public/injected.css` — real-page styles; selectors are namespaced with `pl-`.
  Tokens mirror the live page (see `docs/MYUCLA_CONTRACT.md`), and form controls
  need element-name specificity to beat MyUCLA's Bootstrap base rules.
- `src/storage/settings.ts` — the popup on/off switch, watched by the content script.
- `tests/` — DOM contract, queue, controller, insights, storage, and reorder tests.
- `harness/` — headless-Chromium preview. `fixture.mjs` builds an invented plan
  that satisfies the production contract (note: the native buttons must carry
  **no** `type` attribute, or `isSafeMoveButton` rejects them); `run.mjs` loads
  the built `dist/` against it and screenshots into `harness/shots/`;
  `probe-position.mjs` checks that "move to #N" lands on #N from every start.
  Use it before asking the user to reload the extension.
- `scripts/build.mjs` — bundles `dist/` with esbuild.

The fixture/demo adapter remains intentionally separate from the real adapter so looser demo markup cannot weaken the production contract.

## Storage and privacy

Persistent local storage:

- Tags keyed by validated term/Plan/course identifiers.

Temporary local storage during sorting:

- Target course, target position, expected full order, step count, expiry, and random operation ID.
- A random operation ID is also kept in page `sessionStorage` so only the initiating tab resumes.
- Pending state is cleared on success, cancel, failure, or expiry.

There is no fetch, XHR, WebSocket, beacon, telemetry, analytics SDK, or external server.

## Deliberately not built

Each of these was asked for and declined with a reason. Re-read the reason
before implementing one.

- **Unit-cap dates ("when can I go to 22 units", "when can I petition").** The
  Registrar states the second-pass cap is the student's *College or school
  study-list limit*, not a universal number, and excess-unit petitions open with
  second pass rather than on their own date. Any hard-coded number or date would
  be wrong for some students in some terms, during enrollment, when it matters
  most. The overflow menu links to the authoritative page instead.
- **GE requirement tags.** Not present in the Class Planner DOM, so it would
  require scraping the Schedule of Classes per course. GE credit is
  college-specific and a wrong tag can cost a graduation requirement. The
  local note field already lets a student write `GE 社科` and search for it.
- **Background session heartbeat / auto re-login.** Still not built. A timer-based
  ping keeps an unattended machine signed in, which is the exact thing the idle
  timeout protects, and re-login needs credentials and Duo. What *is* built
  (0.8.0) is narrower: MyUCLA's own extend call, fired only by real input on a
  visible, focused tab, at most once a minute, with a hard cap. See
  `docs/MYUCLA_CONTRACT.md`.

## Known limitations

- User must load or reload `dist/` manually through `chrome://extensions`.
- The extension has not been published to the Chrome Web Store.
- Plan/Find view and pane widths are in memory for this page session. The header's
  compact choice is persisted as one local boolean across quarter changes/reloads.
- Tags stay in the local browser and do not sync to MyUCLA.
- Status summaries reflect the currently rendered MyUCLA page; they are not independently refreshed.
- Bruinwalk, DARS, reminders, additional seat polling, and automatic lecture/discussion/lab combination management are not implemented.
- The working branch is `main`, tracking `fork/main`; upstream origin is read-only
  for this task, and the user's GitHub fork is the publication target.

## Recommended next work

Kept in `README.md` under "State of play" so there is one list, not two. The
short version: watch a real multi-step save end to end, then seat-pressure
bars, then back-to-back gap warnings, then note export/import. Bruinwalk only
as a separate read-only integration with its own privacy review. Avoid DARS and
automated course-combination generation; both substantially expand
sensitive-data and correctness risk.

Do not rebuild a weekly grid. MyUCLA ships one on this page.

### Getting a build onto a macOS user's machine from a Linux sandbox

The mounted folder refuses `unlink`, so `tar x` and `rm -rf dist` both fail with
EPERM, and the user's `node_modules/esbuild` is a darwin binary that will not
run under `device_bash`. What works: build `dist/` in the Linux sandbox, ship it
as a tarball, extract to `/tmp` on the device, and `cat file > dest` over each
existing path. Then the user presses Reload on the extension card.

## Handoff checklist

- Read `AGENTS.md`, this file, `PRIVACY.md`, and `docs/MYUCLA_CONTRACT.md`.
- Preserve the user's existing files and unrelated changes.
- Run tests before and after changes.
- Rebuild `dist/` after source or public asset changes.
- Update `CHANGELOG.md`, this status, and the README when behavior changes.
- Never place real logged-in page data in repository files or tool output intended for sharing.

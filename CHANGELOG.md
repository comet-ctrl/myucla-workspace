# Changelog

## 0.19.5 — MyUCLA Workspace identity (unreleased)

- Adopt the MyUCLA Workspace name, independent pane icon and indigo/mint popup palette.
- Shorten popup explanations while preserving all settings and their saved values.
- Add current install instructions, project credits, contribution templates, a product roadmap and release checklist.
- Package original MIT licensing and credits with the extension. Future version tags prepare branded draft releases.
- Preserve the exact page permission, storage keys and native planner behavior.


## 0.19.4 — unreleased header and calendar polish

- Reveal UCLA's unchanged header temporarily by hovering at the top edge or
  focusing its native menu. Moving away returns to the compact planner; Show
  header still pins it open. Temporary reveals do not change the saved choice.
- Hide the outer page scrollbar while retaining local panel scrolling,
  keyboard access, reduced-motion support and the original printable layout.
- Restore dark calendar hour lines by keeping UCLA's day overlays transparent.
  Native event positions, course colors and grid-size controls are preserved.
- Keep native notice links inline without disconnected filled backgrounds;
  improve dark help-icon contrast and remove the added notice-strip fill.
- Restore panel positions after printing so panes cannot overlap navigation.

## 0.19.3 — unreleased layout presets

- Bottom-left Settings opens a visual layout picker: One pane, Balanced, Browse
  wide, Schedule wide, and Schedule on the left. Thumbnails describe the actual
  supported one- or two-pane layout. Existing drag and resize controls remain.
- Preset proportions adapt to available space and are remembered with the
  existing local layout preference. Manual resizing or moving a tab returns to
  a custom layout; cancelling a resize restores the preset.
- Settings supports keyboard focus, Escape, outside-click dismissal, light and
  dark appearance, and a compact navigation button on smaller windows. Native
  controls, course selections and UCLA's menu are unchanged.

## 0.19.2 — unreleased tab splitting fix

- Split a tab at either workspace edge even when its current tab group already
  occupies that side. Remaining tabs keep their grouping and selections.
- Swap two single-tab panes at an occupied edge without silently grouping them.
- Widen the split target and keep the tab strip available for grouping/reordering.
  Preview labels distinguish Split left/right from Group tabs.
- Offer splits only where both panes can be shown at readable widths. Keep the
  two-pane limit, cancellation, saved-layout behavior and native controls intact.

## 0.19.1 — dark appearance prerelease

- Add a saved System / Light / Dark choice in the extension popup. System is
  the default and follows browser appearance changes while the page is open.
- Theme the enhanced planner's tabs, course details, search, native module
  surfaces, menus, help and floating panels with readable dark colors.
- Preserve UCLA's masthead and top navigation, native controls and statuses,
  and calendar meeting geometry and course colors. Original layout restores
  native presentation; printing remains light.
- Includes the v0.19 tab groups, saved layout, course-details navigation and
  calendar refinements described below.

## 0.19.0 — unreleased development

- Group primary modules into tabs. My classes and Find classes share browsing
  by default, with Schedule beside them. Opening a module selects its tab.
- Merge tabs by dropping into a pane, or split into a second pane at an edge
  when there is room. Filled previews describe the resulting group bounds.
- Enforce readable widths and at most two docked groups. Narrow windows show
  one group at a time without rewriting the saved desktop arrangement.
- Save tab order, membership and active choices in a new v2 layout preference;
  preserve the previous v1 data for rollback. Closing retains remembered placement.
- Add keyboard tab selection and distinct tab close controls; floating panels
  retain their own header close. Details and native actions keep their existing
  original nodes, values, handlers and form association.
- Keep active calendars visible in narrow views, fit module scrolling to short
  windows and position native Help popups within the visible screen.
- Tighten course and section spacing with readable body text and visible rooms
  and instructors. Add a keyboard-accessible jump row for multiple open details,
  preserving selection and focus across recognized native redraws.
- Refine calendar borders, labels and focus rings without altering native event
  geometry, colors, Grid/Agenda state or meeting controls.
- Include a clearly labeled fictional design draft for subsequent course-list,
  details and calendar refinements. This is not a published release.

## 0.18.6 — unreleased development

- Place the schedule's title and original display switches on one row when
  space allows, with a wrapping fallback in smaller panels.
- Remove the native navigation shadow from the extension's sidebar.
- Recalculate docked panels after navigation collapses or expands.
- Show one close button for a single expanded course; keep individual course
  controls and a distinct Close all class details action for multiple courses.

## 0.18.5 — unreleased development

- Let docked panels occupy unused main-workspace space. One remaining panel
  fills the available width; two edge panels share it with one divider.
- Restore space for a reopened module using the remembered width preferences.
  Automatic filling does not overwrite those preferences.
- Hide unavailable schedule-width controls in custom dock layouts.

## 0.18.4 — unreleased development

- Remember panel placement, floating bounds, closed panels, divider sizes and
  navigation preferences locally when Class Planner is reopened.
- Add **Default layout** to navigation to reset the workspace arrangement.
  Course selections, plans, notes and the compact-header preference are unchanged.
- Render drag updates once per animation frame. Let the grabbed panel follow
  the pointer during movement, then keep floating panels inside the viewport on
  release. Escape cancels movement without saving a partial layout.
- Store only validated public module names and display settings. No course,
  account, search or enrollment data is included in the new preference.

## 0.18.3 — unreleased development

- Reserve the blank area beside native panel titles for dragging. Native title
  buttons fit their labels instead of stretching invisibly across the header.
  Their original click handlers and neighboring controls remain unchanged.

## 0.18.2 — 2026-10-04 (docking preview prerelease)

- Show a full shaded destination preview while moving a panel. Generous left
  and right regions and the main panel's header accept drops.
- Remove the bottom dock from dragging, layout menus and keyboard shortcuts.
- Drag blank panel-header space as well as the dotted grip or navigation tab.
  Native buttons, links, fields and Help retain their normal behavior.
- Keep the actual panel following the pointer and Escape cancellation. Closing,
  reopening, resizing, selections and expanded course details remain supported.
- Reveal focused native Details controls immediately after a scroll change,
  including on small screens, so they do not remain clipped below the panel.
- Keep layout state in page memory; permissions, storage and native action
  boundaries are unchanged. v0.18.1 remains available for rollback.
- Typecheck, 389 unit tests, production build and fictional browser regressions
  pass. Installed-page verification after Chrome reload remains pending.

## 0.18.1 — 2026-10-03 (flexible-panels prerelease)

Includes the flexible-panel changes developed in 0.18.0, plus close controls
and live dragging. This is the first published release of those panel changes.

- Close any panel with its header ×; reopen it from navigation. Schedule now
  has a navigation entry. A course's Details button reopens the details group.
  Hiding retains native controls, selections, open courses and panel placement.
- Move the actual panel continuously with the pointer, with stable dock targets.
  Escape cancels the gesture and restores its original position and stacking.
- Preserve hidden panels across same-plan redraws and reveal them with Reset
  layout. Keep hidden content out of keyboard/pointer interaction; return focus
  to a visible control when closing. No new storage or permissions.
- Typecheck, 375 unit tests, the production build and fictional browser fixtures
  pass. Installed-page verification after reload is pending; actual enrollment
  completion and the native Optimizer backend response remain unverified.

## 0.18.0 — unreleased development baseline (included in 0.18.1)

- Drag panel grips or navigation tabs to dock at an edge or float inside the
  existing Class Planner tab. Multiple floating panels can remain open together.
- Resize floating panels at their corner and docked regions at their dividers.
  Double-click a grip to float/return; right-click or Shift+F10 offers layout
  choices and Reset layout. Keyboard docking/resizing is also available.
- Collapse navigation with its chevron or by dragging its edge. Keep native
  navigation, controls, handlers, status wording and form association intact.
- Retain layout through same-plan native redraws, using page memory only.
  Reset layout on reload/context changes; restore native flow for print and
  Original layout. No new permissions, persistent storage or external windows.

## 0.17.11 — 2026-10-03 (multiple details and native action continuity)

- Keep multiple My classes details open in a shared scrolling area, with an
  independent Close button for each course. Opening another course does not
  discard the previous course's sections or choices.
- Retain expanded courses through same-plan native redraws so subsequent
  native action content is not hidden by a closed Details view. Reset open
  courses on plan/term changes, including matching course identifiers.
- Preserve native controls, form association and handlers. No enrollment is
  automated, and no additional requests or persistent storage are introduced.

## 0.17.10 — 2026-10-03 (larger schedule and status colors)

- Let the schedule grow beyond 640px, using available workspace width while
  retaining at least 420px for browsing. Add Widen/Restore width beside its title.
  Keep drag/keyboard adjustment and double-click reset; narrow screens keep the
  existing full-width Schedule view. Native Grid size controls remain unchanged.
- Color each lecture/discussion status in the class list: green Open/Enrolled,
  amber Waitlist and red Closed. Keep original wording/counts, with unknown
  statuses neutral. Preserve readable spacing at native line breaks.
- Keep all sizing in memory and preserve native controls, data and navigation.

## 0.17.9 — 2026-10-03 (readable course details)

- Give the course list more room and keep Details/Class actions on one row.
  Use a consistent selected-course background and bound the filter width.
- Keep section details at a readable width. Show one primary heading row with
  room and instructor captions beside each section, without duplicate headings.
  Retain native metadata help controls when present.
- Give native Change controls a visible boundary, hover and keyboard focus.
- Correct drag autoscrolling to target the actual course list in the workspace.
  Verify a change in scroll position instead of accepting a pre-scrolled list.
- Preserve native status wording, controls, rooms, instructors and plan actions.

## 0.17.8 — 2026-10-03 (clearer controls)

- Give expand/collapse buttons a visible outline, light background and crisp
  state-aware chevron, with distinct hover and keyboard focus.
- Outline Class actions, close buttons, native module disclosures and Help;
  frame the About/final-exam disclosures and highlight open menus.
- Separate the search heading from its Help/enrollment links in narrow panes.
  Reserve enough title space for the Close details button on long course names.
- Keep native handlers, statuses, selection, save behavior and UCLA navigation
  unchanged. This update changes presentation only.

## 0.17.7 — 2026-10-03 (control audit)

- Open Final exam week in a bounded, keyboard-accessible panel instead of the
  narrow course list. Keep a single entry and support Close, Escape and outside
  click with focus return. Keep More above workspace clipping containers.
- Restore native Study list and Personal entries disclosure icons and reopen
  their known collapsed panels on explicit navigation. Keep native Help popups
  within their pane, with local scrolling for long instructions.
- Correct expansion after native Calendar, Class Plan or Search was collapsed
  in Original layout, preserving native loading and Grid/Agenda visibility.
- Preserve native hiding of section rows and search fields. Make existing draft
  recovery actions visible together with their containing bar.
- Add functional browser audits for course actions, finals and native modules,
  including native postback-shaped calendar switches, redraws and narrow layouts.
  See `docs/CONTROL_AUDIT.md` for live/fixture coverage and remaining limitations.

## 0.17.6 — 2026-10-03 (native actions and visible course information)

- Keep rooms and instructors visible alongside every section in Find classes and
  My classes Details; remove the extra disclosure button.
- Give Search classes a readable disabled state, solid blue enabled state and
  keyboard focus indicator while preserving the original native submit input.
- Keep native Plan Actions panels above the workspace without taking space from
  the schedule. Preserve the native menu and controls through partial redraws,
  and make the menu scrollable on short screens.

## 0.17.5 — 2026-10-03 (workspace compatibility fixes)

- Open the original Plan Optimizer disclosure when its navigation is selected.
  Validate the native button and forward one explicit click, with loading feedback
  and duplicate protection. Mounting and redraws never run it automatically.
- Align native class details into compact columns in wide panes and two labeled
  bands in narrow panes. Remove inherited gray cell blocks, centered days and
  oversized status-icon boxes from validated Details and search result rows.
- Preserve native status content, section choices, room/instructor disclosures,
  form associations, keyboard access, printing and Original layout restoration.
- Add native-style Details fixtures and Optimizer loading regressions alongside
  the existing workspace and result checks.

## 0.17.0 — 2026-10-03 (workspace redesign beta)

- Keep the weekly schedule beside the selected workspace and expose My classes,
  Find classes, Optimizer, Study list and Personal entries as named destinations.
  Put information/help and Original layout within the same navigation.
- Show per-section meeting/status summaries and dock selected class details in
  a stable reading area, retaining the original native rows and controls.
- Keep search modes and fields visible; remove duplicate shortcut and Edit search
  layers. Preserve loaded course previews, native options and required fields.
- Resize the schedule independently; use horizontal navigation on medium windows
  and a persistent Schedule switch on narrow windows. Preserve all native modules,
  print/restoration, original statuses and UCLA navigation.
- Keep long results within a bounded desktop preview, with a local scrolling
  fallback for narrow screens. Preserve replacement search controls after redraws
  and restore the native layout if an unfamiliar module appears.

## 0.16.0 — 2026-10-03 (redesign beta)

- Rework the workspace around readable typography, consistent controls and fewer
  enclosing borders. Give the class list more room and normalize the schedule's
  toolbar while keeping UCLA's navigation and calendar geometry intact.
- Limit the course browser's reading width, keep its list a predictable size,
  and bring section values closer together. A single course uses a narrower
  preview instead of stretching across the whole monitor.
- Keep class cards focused on the course and Details. Class actions reveals
  the original ordering/color controls and note tools in place; Escape closes
  them with focus return. This disclosure does not submit or change a plan.

## 0.15.1 — 2026-10-03 (redesign beta)

- Make Details the first action on each class, with a larger target and visible
  open state. Quiet the adjacent ordering tools while retaining every control
  and matching the visual order to keyboard navigation.
- Align wider course results beneath each section group's original column
  headings. Keep those headings visible while scrolling and reduce repeated
  captions; narrow cards retain individual labels. Original help controls,
  statuses and form associations remain intact.
- Tighten result spacing and use consistent control sizing. Plan / Find classes,
  original UCLA navigation and native search behavior remain unchanged.

## 0.15.0 — 2026-10-03 (redesign beta)

- Organize the existing page around Plan and Find classes. Plan shows a resizable
  class list beside the weekly schedule; Find classes gives native search and
  loaded course previews the full workspace. Switching retains the original
  fields and selections; Escape returns to Plan. No separate page or request.
- Expand Details within its original class card at every width, keeping the
  schedule available. Close/Escape restores focus. Move supporting pane controls
  and Original layout into Tools alongside the three additional native modules.
- Simplify the toolbar, use clearer type hierarchy and calmer dividers, and fit
  section rows to the preview's actual width. Wide search fields sit side by
  side. Preserve original UCLA navigation, statuses, form controls and print.

## 0.14.7 — 2026-10-02 (redesign beta)

- Fix the live Details → Expand Browse transition: close the docked inspector
  before hiding its original class row, then show search results. This prevents
  the empty inspector left behind in 0.14.6.
- Show a single loaded course directly, without a redundant course list,
  filter and count. Multi-course results keep the list-and-preview layout.
  Reduce extra spacing below native planner notices while retaining every notice.
- If checked sections are hidden in another course preview, show their count
  with a disclosure to review them. Reviewing clears only the local course
  filter and reveals the existing selection; it never changes a checkbox.
- Preserve preview scroll through section-row redraws. Retain native results
  if an unfamiliar course heading contains extra controls that would be hidden.

## 0.14.6 — 2026-10-02 (redesign beta)

- Give Browse the full workspace with Expand Browse. A wide pane places the
  loaded course list beside the selected course's sections; Restore panes,
  Escape or a named pane button returns to the previous layout. Original UCLA
  controls, statuses and form associations stay intact.
- Add an in-memory filter for loaded course numbers/titles, a selected-course
  heading, and Up/Down/Home/End navigation. Filtering never submits a search.
  Keep filter text, field disclosures, focus and list scroll through section-row
  redraws; reset them when MyUCLA replaces the result set.
- Recreate the Open planner workspace button after native redraws in Original
  layout. Printing includes all loaded courses, rooms and instructors even when
  Browse is expanded or extra fields are folded.
- Preserve document scroll during automatic workspace remounts, preventing a
  temporary document-height change from jumping back to the top.
- Cancel pending startup, redraw and save continuations when disabled. Reload
  notes, collapsed state and draft offers when the term/plan changes; ignore
  stale responses and keep previous plans' stored drafts. Remove obsolete save
  controls on empty/future quarters. No new storage schema, permissions,
  background requests or catalog prefetching.

## 0.14.5 — 2026-10-02 (redesign beta)

- Save the explicit Compact header / Show header choice as one local boolean.
  Restore it across quarter changes, native redraws, page reloads and returning
  to a browser tab. Compaction now maintains the document's minimum scroll
  position instead of acting as a one-time scroll shortcut. No native menu
  nodes, styles, handlers or form actions change.
- Show header releases compaction and saves that choice. Keyboard focus on the
  original UCLA menu also releases it so native navigation stays accessible.
  Disabling Tidy or Original layout removes all event handling. Report failed
  preference writes in the control's tooltip; serialize successive choices.
- Add fictional storage validation and controller lifecycle coverage for native
  quarter redraw, fresh-page restoration, browser tab return and menu access.
  No page content is stored; no polling, new requests or permissions are added.
- Keep the validated introduction and header controls available on empty/future
  quarters independently of course tools. Native future-plan contents stay in
  place. The reorder adapter's strict checks are unchanged and no course actions
  mount until that contract passes. Restore the workspace on a populated redraw.

## 0.14.4 — 2026-10-02 (redesign beta)

- Add Compact header / Show header in the existing workspace. One explicit
  click scrolls UCLA's banner away while retaining the planner title, original
  term selector and notices; another returns to the original menu. Native menu
  nodes, placement, styling and handlers are unchanged. No search or plan action
  is submitted. The control also follows ordinary page scrolling.
- Keep focus on the control and remove it with Original layout or disabling
  Tidy. Add fictional pointer/keyboard, viewport, native identity and restoration
  checks. No extra requests, storage or permissions are introduced.
- Typecheck, 180 tests, build and production layout QA passed, followed by GitHub
  CI/release packaging. After reload, live clicks verified both directions,
  title/term visibility, focus and all six modules without horizontal overflow.

## 0.14.3 — 2026-10-01 (redesign beta)

- Compact the planner introduction below UCLA's untouched banner/navigation:
  smaller heading, native term selector alongside it, and the original explanatory
  text and links under About this planner. Keep term notices and alerts visible.
- Let normal document scrolling move UCLA's banner out of view. The planner
  expands into the freed space while each pane keeps its own scrolling. BODY is
  no longer an independent scroll container. Scrolled native panel redraws retain
  the user's position, and Details tracks the viewport.
- Expose every original sidebar widget through Links & help without changing its
  parent, controls or contents. ×/Escape closes and returns focus. Original layout
  and disabling Tidy restore the introduction and sidebar. Unfamiliar shapes stay
  native; no extra requests, permissions or storage are introduced.
- Add fictional introduction, root scrolling, scrolled redraw, sidebar and
  restoration checks. After reload, live verification passed the compact heading,
  disclosures, original widgets, scrolling away/back, Details and native search
  redraw while scrolled, with native controls and no horizontal overflow.

## 0.14.2 — 2026-10-01 (redesign beta)

- Prevent native focus/postback scrolling of BODY behind the fixed workspace.
  Use clipped overflow on desktop while preserving local pane scrolling, the
  narrow stacked layout and the short-window flow fallback. This keeps UCLA's
  original navigation on screen without moving or modifying it.
- Add a constrained-body/long-sidebar regression for that native scrolling
  behavior. Keep the existing navigation, search and layout checks.
- Live v0.14.1 verification passed course previews, nested section expansion,
  native header help visibility, Rooms & instructors, Edit search, Details bounds,
  exam disclosure and both dismissal paths. It exposed the BODY scroll issue
  after a native search redraw. After reload, v0.14.2 passed native search and
  section expansion with BODY scrollTop zero and the original header/term chooser
  visible; course previews, native form controls and Details bounds/focus passed.

## 0.14.1 — 2026-10-01 (redesign beta)

- Fix live search compatibility: loaded course bodies can be siblings of their
  headings; recognize the native Day(s), Pacific Time and Instructor(s) labels.
  Select only the chosen body locally and retain original native result actions.
- Keep native column help buttons accessible in a compact header row. Ambiguous,
  unknown and unloaded bodies still retain their native presentation.
- Keep Details within short panes below tall native headers. Make the final-exam
  note expandable, bound the heading and reserve only the available row height.
  Preserve UCLA's original navigation, term chooser and plan menus.
- Add fictional sibling-result, help-button and tall-header regression checks.
  Live inspection found these issues after verifying resizing, reopening,
  Details dismissal and all three secondary modules in v0.14.0.

## 0.14.0 — 2026-10-01 (redesign beta)

- Rebuild the presentation around Classes on the left, Schedule in the center,
  and Browse on the right. Resize side panes with pointer or keyboard controls;
  preserve independent folding and persistent reopening buttons.
- Replace modal details with a docked inspector. Close with × or Escape; other
  planner controls stay interactive. Keep native section rows and handlers in
  their original form. Narrow windows use inline details.
- Browse complete, already-rendered course results through a local course index.
  Show labelled section cards and reveal rooms/instructors on demand. Retain
  native statuses, selection controls, messages and action rows. Edit search
  restores the original fields. Unknown/incomplete results stay native.
- Preserve UCLA top navigation, term chooser and plan menus; expose the other
  three native modules under Tools (3). Original layout restores all six sections.
- Add native identity/restoration/redraw tests and production-browser checks at
  seven widths, including keyboard/pointer resizing and no-request previews.
  Live verification remains blocked; this build needs a manual native-page check.
- Preserve the pre-redesign source/build as GitHub release v0.13.0 before creating
  the separate planner-redesign branch. CI covers both development branches.

## 0.13.0 — 2026-10-01 (local build)

- Add consistent local pane folding. Closing a primary pane reclaims its
  column; a persistent named button reopens it. Secondary module shortcuts
  open their content as well as locating it. Keyboard activation and focus
  return work without invoking native postbacks.
- Preserve native collapse buttons and handlers for Original layout, with
  local capture only on the exact known title/body shape. Keep pane choices
  in memory across native redraws; unfamiliar shapes remain native.
- Restore original section status text and icons. Retire the compact status
  tooltip and aggregate course-status badges; native statuses remain in Details.
- Keep the original term chooser and plan actions in place. Measure the
  workspace's original flow position so it does not cover UCLA's top navigation.
  If the header leaves too little room, use the page flow instead of covering it.
- Position Other sections below its own button, so the popup cannot cover
  the control needed to close it. Retain all six original sections.
- Verify native navigation/status identity, local folding, keyboard reopening,
  short-window local scrolling, redraws and restoration on fictional fixtures.
  Live browser inspection was rejected by automatic approval review even after
  exact-page user authorization; manual verification remains necessary.

## 0.12.2 — 2026-10-01 (local build)

- Close course details by clicking outside, pressing Escape or using the visible
  × button. Show a short dismissal hint; return focus without scrolling the page.
- Consume outside clicks before they can activate a page action underneath.
  Keep the original native details row interactive and in its original form.
- Remove the backdrop and dismissal listener during restoration and native
  redraws. Check all dismissal paths in unit and production browser tests.
- Run CI on the planner-improvements branch as well as main.

## 0.12.1 — 2026-10-01 (local build)

- Widen the default desktop search column (minimum 520px). Expand search uses
  the existing workspace width on the same page; Restore columns or Escape
  returns the schedule and class list. Keep original fields/results/handlers.
- Give known nine-column native section results a readable minimum width,
  with local horizontal scrolling in the column and room in expanded search.
- Rename the top disclosure to Other sections (3) & actions and add named
  shortcuts to Plan Optimizer, study list outside this plan and Personal Entries.
  Original layout restores all six native sections. Escape closes the disclosure.
- Verify fictional section results, all six sections, control identity,
  native course disclosure, expansion/focus, restoration and responsive bounds.
- No new request, query storage or enrollment action; native search loads remain.

## 0.12.0 — 2026-10-01 (local build)

- Arrange the original MyUCLA schedule, compact class list and course search
  together in one desktop workspace, through the existing Chrome extension.
  Long lists scroll within their panel; no new page or external service.
- Open each class's original section table in place through Details, with
  Escape/close and focus return. Keep seat/conflict summaries visible on cards.
- Validate the first header row rather than counting the first row of every
  tbody. Live tables use a header group plus one group per section. Compact
  cards show course codes and statuses; full titles are in Details.
- Reset native title-cell and list margins inside the workspace, and retain
  column headings when opening any class's details. Keep these native shapes
  in the fictional regression fixture.
- Put native plan actions and secondary tools in a disclosure. Keep the native
  term chooser and notices accessible. Original layout restores the stacked
  sections, and disabling tidy restores their original presentation.
- Preserve original form controls, table ancestry and native handlers. No
  catalog prefetch, extra MyUCLA requests, query storage or enrollment changes.
- Remount after native panel redraws and scroll long lists during local dragging.
  Narrow windows use a stacked fallback. Verify restoration, native identity,
  drawer bounds and calendar geometry with unit and isolated browser checks.

## 0.11.1 — 2026-10-01 (local build)

- Fix search controls failing to appear when MyUCLA offers recorded online
  classes instead of CUTF seminars. Validate each shortcut's exact public
  option mapping, rather than requiring one entire option list and order.
  Unknown options stay available through the original native dropdown.
- Group secondary search types into Course details, Requirements, Programs
  and Format. Show only choices that the native dropdown currently offers.
- Keep desktop autocomplete fields on one row, shorten their visible labels,
  and explain that required dropdown suggestions enable Search classes.
- Preserve native autocomplete, submitter and mode handlers; add no automatic
  searches, query storage or network requests. Restore the original layout
  when the tidy switch is disabled.


## 0.11.0 — 2026-10-01 (local build)

- Add visible Subject / Instructor / GE search choices and keep the full native
  search dropdown under More searches. Each choice forwards one user action to
  MyUCLA's existing mode-change handler; no query is submitted automatically.
- Label the original autocomplete inputs using their current native labels.
  Present the original Go submit input as Search classes while preserving its
  identity, form association, disabled state, and submission behavior.
- Give the optional tidy layout quieter section headers, consistent spacing,
  neutral card borders and system typography. All sections stay accessible.
- Restore search nodes and attributes when the tidy switch is turned off;
  reattach after search-only partial redraws. Unfamiliar search shapes stay native.
- Check source contracts, native submission, redraws and restoration, with
  responsive browser verification at 1920, 1440, 960 and 390px.

## 0.10.5 — 2026-10-01 (local build)

- Shorten each section's existing Status column to Enrolled, Closed,
  Open with seats left, or Waitlist with places filled. Lecture and discussion
  rows keep their own statuses. Waitlist capacity is never called a position.
- Keep the original status nodes and wording in a hover/keyboard-focus tooltip.
  Escape dismisses it; the optional tidy switch restores the original cells.
- Leave unfamiliar wording, invalid counts, interactive notices, and enrollment
  action rows native. Existing filters and enrolled-unit readers still use the
  original status text. No requests or stored status data are added.
- Verify status meanings and restoration in 138 tests, plus hover/focus,
  keyboard dismissal and layout at four browser viewport widths.

## 0.10.4 — 2026-10-01 (local build)

- Keep native calendar widths, heights and border meanings. Text padding is
  applied inside each line so percentage-width boxes and collision lanes stay
  inside their day. Short meetings use smaller text so all three lines fit.
- Align the supported nine-column section tables across course cards using
  reversible colgroups, including when repeated headers are hidden.
- Put Move to top and Add or edit note inside each course's ellipsis menu;
  keep drag, position and collapse directly accessible.
- Fold recognized final-exam location advisories behind Location details.
  Preserve the original text and leave unfamiliar exam content unchanged.
- Display the build version in the popup to distinguish updated builds from
  an older unpacked installation.
- Add browser geometry checks at 1920, 1440, 960 and 780px, using fictional
  percentage-width meetings with solid/double borders and overlapping lanes.

## 0.10.3 — 2026-08-23

**The extension has a face.** Until now Chrome drew the default grey puzzle
piece in the toolbar, while the install guide told students to "click the
extension icon". That is a bad instruction when every unpacked extension looks
identical.

- The mark is the product in one picture: a short list with its first row
  picked out in UCLA gold, on a UCLA blue rounded square.
- Four sizes, drawn separately rather than scaled from one master.
  `scripts/make-icons.mjs` recomputes the geometry per size and snaps every
  edge to a whole pixel, because a 16px icon downscaled from 128 comes out as
  grey mush in the toolbar. Re-run it to change the mark.
- Wired into the manifest twice, as `icons` for the extensions page and the
  Web Store, and as `action.default_icon` for the toolbar button.
- The install guide shows the icon inline where it tells you to click it, and
  the site finally has a favicon.

## 0.10.2 — 2026-08-23

Copy and packaging only. No behaviour changed.

- The extension's own description no longer promises what it will not do. It
  now says what saving actually does: it replays your arrangement through
  MyUCLA's own up and down buttons. The old line ended "never enrolls for
  you", which is true and reads like a disclaimer on a bottle.
- The install guide gained a recorded demo, and its screenshot of the
  extension card was retaken to match the new description.
- `harness/verify-install.mjs` walks the published install steps end to end:
  it zips `dist` the way the release workflow does, unzips it, side-loads the
  unpacked folder into a clean Chrome profile, and checks that the card
  appears without errors and that all seventeen classes get their controls.

## 0.10.1 — 2026-08-23

**0.10.0 changed too much at once, and it is now off by default.**

Everything 0.10.0 did to MyUCLA's own markup was a defensible individual call
and a bad call taken together. Students know this page. Reshaping the class
list, the card titles and the weekly grid in one release means relearning a
familiar tool in the middle of enrollment week, and a page you have to relearn
is worse than a page that is slightly untidy. Reported plainly by the student
using it, which is the only test that counts.

- The Class Planner looks exactly as it did in 0.9.1 again: MyUCLA's own two
  paragraphs per card, its own per-class column headers, its own weekly grid.
- The 0.10.0 work is kept behind one switch in the popup, **Tidy up MyUCLA's
  own layout**, off by default. Flipping it restores the page instantly rather
  than waiting for a reload, in either direction.
- Nothing about the extension's own controls changed. Reordering, the landing
  chip, the bottom save bar and the drag auto-scroll are all still on.

The **Reload page** button on a failed save stays, because that was a bug fix
rather than a change of appearance.

Lesson recorded in `HANDOFF.md`: our own injected controls are ours to design,
but MyUCLA's markup is the students' habit, and changing it is opt-in.

## 0.10.0 — 2026-08-23

The first version aimed at MyUCLA's own presentation rather than at our own
controls. Three findings from a full product read of the live page, written up
in `docs/UX_AUDIT.md`.

**The class list repeated its column header sixteen times.** Every class prints
its own `Change / Section / Status / Info / Days / Time / Location / Units /
Instructor` row: 144 header cells for nine distinct words, measured on a real
sixteen-class plan.

- Only the first class the student can actually see keeps its header, and that
  one is now a small uppercase caption rather than a grey band.
- Removing them exposed a second problem: each class is its own `<table>`, so
  every card sized its columns from its own content and the Time column moved
  by up to eighty pixels from one class to the next. All nine-column tables now
  share one fixed grid, so the list finally reads as one table.
- The shared grid is applied only to the exact nine-column shape in the
  contract. Anything else keeps MyUCLA's automatic layout.

**A class was split across the one string students actually use.** MyUCLA
prints `Class 15: Management` and `170 - Real Estate Finance and Investments` as
two paragraphs, so the identity a student scans for, searches for, and types
into the enrollment page is cut in half with the title wedged between the
pieces.

- One line now leads with `MANAGEMENT 170`, title beside it.
- MyUCLA's paragraphs are hidden, never rewritten, so the adapter still reads
  the official label and everything is reversible.
- Parsing is fail-closed: unless both paragraphs match exactly, the card is left
  exactly as MyUCLA drew it.
- Cards lost roughly a third of their height, which also means fewer moves send
  a card off screen.

**MyUCLA's weekly grid was illegible where the week is hardest.** Each meeting
is an absolutely positioned box at `overflow: hidden`, 14px text in a box as
short as 48px, three lines separated by `<br>`. Long room names wrapped and were
cut in half by the bottom edge.

- Each run becomes one line that ends in an ellipsis instead of a cut, the
  course code is bold, and the full string moves to the `title` attribute so a
  30px-wide column still tells you what it is on hover.
- The conflict marker moves to the corner instead of sitting mid-sentence.
- MyUCLA's `<br>` and `.hide-above-small` responsive pair is left intact and
  the new layout applies only above their breakpoint.

**Corrections**

- `saveChanges` never fell back to `NavigationReorderCoordinator`, though
  `README.md` and `HANDOFF.md` both said it did. The claim is gone. When the
  offscreen frame cannot be trusted nothing is written, the arrangement is kept,
  and the error now carries a **Reload page** button instead of telling the
  student to reload and leaving them to find it.
- A BruinWalk extension is already injecting instructor ratings into this class
  list, so a rating integration of our own is off the roadmap.

## 0.9.1 — 2026-08-22

**A long drag was impossible.** Reported from the real page: grab a class near
the bottom of a 16-class plan, drag toward the top, and the page does not
follow. The pointer cannot leave the window, so the card stops at the top edge
and #15 can never reach #1. Dragging only ever worked within one screenful.

- Hold near the top or bottom edge and the page now scrolls to you, ramping up
  quadratically over the last 110px so a nudge creeps and a hard press moves.
- Drag distance is now measured in document space, not viewport space.
  Previously the card was positioned from `clientY`, which is measured against
  a viewport that was itself moving, so any scroll during a drag would have
  slid the card out from under the cursor.
- The lifted card gets a shadow and paints above MyUCLA's section bar, so it
  reads as picked up.
- Nothing is dimmed during a drag any more. A drag from #14 to #1 pushes
  thirteen cards, and fading all of them to make one stand out cost more than
  it bought.

Verified in the harness: from index 13, holding at the top edge scrolls 2,243px
and the card lands at index 0.

## 0.9.0 — 2026-08-22

First version written after actually looking at the live page rather than at a
fixture. Three findings drove almost every change in it.

**Finding 1: the injected UI looked bolted on because it was.** Every Class
Planner section has a `#2C5E91` title bar with a 7px radius, and MyUCLA already
parks that section's actions on the right of it — `Find a Class and Enroll`
sits there on the search section. Our toolbar was a bare row floating on white
above the list.

- The toolbar now mounts inside MyUCLA's own `Class Plan` title bar
  (`#plannerSectionClip`), right-aligned, in the page's own idiom. If that bar
  is ever missing the old placement is still there as a fallback.
- Controls on that bar get the inverse treatment: white outlines on blue, and
  UCLA gold reserved for the one action waiting on the student.

**Finding 2: the per-class controls were a second row of icons.**
`td.linkPanelRight` is ~300px wide and MyUCLA's colour swatch plus up/down
arrows use only ~73px of it, so there was never a reason to wrap.

- Our controls now sit on the same line as the native ones, separated by a
  hairline so it stays obvious which buttons belong to the page:
  `[colour] ↑ ↓ │ ≡ ⌃⌃ #3▾ ◇ ⌄`.
- The position control was a bare number, which reads as a label. It now shows
  `#3` with a caret, and its dropdown carries a `Move to position` group
  heading so the verb is stated once.

**Finding 3: a class card is a quarter of the screen.** A real 17-class plan is
~5,800px tall with ~200px cards. "Move to #2" from #13 sends the card two
thousand pixels away, and the old build simply let it vanish with no trace —
which is why it felt like everything jumped to the top no matter what you
picked.

- The page is never scrolled for the student. An anchor card is pinned so the
  rows that shifted above them do not drag the view.
- The card is no longer dragged across a distance nobody can follow; the
  neighbours animate closing the gap instead.
- The card that landed flashes pale yellow.
- When it lands off screen, a chip slides in at the edge it left through:
  `↑ ANTHRO 7 → #2  [Show me] [Undo]`, gone after seven seconds. Following it
  is the student's choice, not ours.

**Save had to follow the student.** With the toolbar in the section header,
Save was a full screen above someone rearranging class 14 of 17. Unsaved
changes, the restore-a-draft offer, and save progress now live in a bar pinned
to the bottom of the window, which is also where they belong on their own
merits.

**Everything is English**, and the popup was rewritten around one question a
student would actually ask: what does this thing do? It now leads with what the
extension adds, and explains the keep-alive switch in terms of the thing that
bites — MyUCLA counts clicks as presence, and reading is not clicking.

**Removed**

- The `Better MyUCLA · N classes · N units · N conflicts` header line. The
  conflict information is on the cards where it is useful, and the rest was
  noise in a header. Only a `1 of 3` count survives, shown only while a filter
  is actually hiding classes.
- Compact mode, and the persisted `compact` view-state field with it.

**Added: a UI harness.** `harness/` drives the built extension against an
invented Class Planner that satisfies the real DOM contract, under headless
Chromium. Layout, motion, and "does move-to-#N land on #N" can now be checked
without an account and without touching a real plan.

**Not built, after checking:** a weekly grid. MyUCLA already ships one on this
page, with Study List / Plan / Alternates toggles and a grid/agenda switch.

## 0.8.0 — 2026-08-20

**Conflicts, corrected twice and now actually useful.** 0.6.1 stopped counting a
layout wrapper as a conflict, but over-corrected: time conflicts carry no class,
no aria-label and no distinct icon. MyUCLA keeps the real answer inside the
popover payload behind each warning triangle:

```html
<div class="popover_section_title warning light">Warning: Time Conflicts</div>
<ul class='bulleted_list'><li>DESMA 10</li><li>ENGR 170</li></ul>
```

- Conflicts are now read from that payload, split into time and final-exam.
- Each card shows which courses it actually clashes with, so answering "what
  does this collide with" no longer costs one popover click per course.
- The toolbar count (`N 门有冲突`) is finally truthful.

**Session: presence, not a heartbeat.** On the Class Planner `keepAlive` is
empty — there is no MyUCLA heartbeat — and `Timeout.js` only extends on
`mousedown keydown click`. Scrolling through a plan for fifteen minutes counts
as absent, and signs the student out. With the student's explicit request:

- Scrolling, wheel, mouse movement, keys and touch now count as presence.
- Never on a timer, never while the tab is hidden or the window unfocused,
  never more than once a minute, and it stops after a cap (default 60 minutes;
  30 / 60 / 120 / off in the popup).
- It calls MyUCLA's own `ExtendSession`; the extension builds no requests.
- Walk away and the session still expires on its original schedule. The ~4 hour
  absolute cap is untouched, and auto re-login remains out of scope — that needs
  credentials and Duo, which this project never touches.

The popup gained the keep-alive switch and its cap.

## 0.7.0 — 2026-08-20

- **已选上 N 学分** in the toolbar, summed only from sections MyUCLA has already
  marked `Enrolled`, with the Units column located by header rather than by
  position. This is the number a study-list limit applies to; a plan-wide total
  is not, since nobody enrols in their whole plan.
- **An interrupted arrangement can be recovered.** Unsaved rearrangements are
  kept locally (course identifiers only, 24-hour expiry) and offered back after
  a timeout, a stray navigation, or a re-login — but only while MyUCLA's own
  order is still the one the draft was built on. Stale drafts are dropped
  silently.
- A link to the Registrar's enrollment-pass and study-list-limit page in the
  overflow menu.

Deliberately not built — see the notes in `HANDOFF.md`:

- Hard-coded "22 units" / petition dates. The Registrar states the second-pass
  cap is "the maximum units allowed by their College or school study-list
  limit", and excess-unit petitions open *with* second pass rather than on a
  separate date. There is no single correct number or date to display.
- GE requirement tags. The data is not on the Class Planner page, GE credit is
  college-specific, and getting it wrong costs a student a graduation
  requirement. The existing per-course note field covers the same need at zero
  risk.
- An automatic session keep-alive. See `docs/MYUCLA_CONTRACT.md`.

## 0.6.2 — 2026-08-20

- **The numbers snapped back the moment you pressed save.** `saveChanges` called
  `restoreLabels()` and cleared the pending state up front, so MyUCLA's original
  `Class N:` numbering returned while the list still showed the student's
  arrangement — the page disagreed with itself for the whole save. The
  arrangement, its renumbering and its position chips now stay exactly as the
  student left them until the reload replaces the page.
- **"后台页面顺序与当前页面不一致" now self-heals.** The visible page can be
  behind the server (a stale tab, or an earlier run that landed after we stopped
  watching). The arrangement is a complete order, so as long as the offscreen
  frame holds the same set of courses it is still exactly achievable: the engine
  starts from whatever the server really has and re-plans. It only refuses when
  the course set itself differs, which a refresh genuinely is the fix for.
- A postback arriving mid-save no longer reverts what the student is watching.

## 0.6.1 — 2026-08-20

Diagnosed from the live page: the Class Planner sits inside the
`ctl00_main_wrapper` ASP.NET **UpdatePanel**, so a colour change or an official
ordering click can come back as an async partial postback that replaces the
panel's contents without any navigation. Three reported problems were all this.

- **The extension vanished after changing a colour.** The MutationObserver was
  attached to the course `<table>`, which the postback discards, so it never
  fired again and nothing was ever rebuilt. It now watches `document.body` and
  re-injects, guarded by a cheap check so unrelated page activity is ignored.
- **Dragging appeared unable to reorder, then showed a red timeout.** The
  offscreen engine waited for an iframe `load` event that a partial postback
  never fires, so every step timed out after 15s. It now waits for the expected
  order to appear in the frame, which covers navigation and partial postbacks.
- **Unsaved arrangements were silently lost** on a postback (`beforeunload` does
  not fire for these). The controller now compares the re-rendered order against
  the saved baseline: same order means the arrangement is restored, a different
  order means MyUCLA moved things itself and the student is told.

Also fixed:

- **Every course was reported as conflicting.** `div.final_exam_info
  .exam_conflict` wraps the "Final Exam:" line on all 17 cards — it is layout,
  not state. Conflicts now count only MyUCLA's explicit conflict control, which
  on the test plan means 2 rather than 17.
- MyUCLA prints `Class N:` into each title; those numbers now follow an unsaved
  arrangement and are restored on save or discard.
- The collapse chevron pointed the wrong way (up while already collapsed).
- A postback during a drag could strand the drag outline on a card.
- The toolbar rebuild no longer drops an active search filter.
- Plans of 8 or more courses now open collapsed the first time, then remember
  whatever the student chooses.

## 0.6.0 — 2026-08-20

Reordering is now batched. Dragging, `置顶`, the position chip and `Alt + ↑/↓`
only rearrange the visible list; nothing reaches MyUCLA until the student clicks
one save that states how many changes and roughly how long it will take.

- One confirmation, one background run, one reload per save session instead of
  per move. The drag handle no longer greys out after a single drag.
- `撤销` restores the order MyUCLA still has, so trying an arrangement is free.
- A `beforeunload` guard fires only while there are unsaved moves.
- `nextStepTowardOrder` / `countStepsToOrder` plan a whole target permutation
  and recompute after every round trip, so a run self-corrects rather than
  replaying a stale script.
- The wait is phrased in seconds, not native click counts.

UI:

- Removed the blue panel behind the toolbar. It is now a plain control row with
  a hairline under it; the only emphasised element is the unsaved-changes pill.
- Collapsed cards keep their seat status on the title line (`有空位`, `候补`,
  `已满`, `部分有位`, `已选上`, plus `· 冲突`), so collapsing costs nothing.
- Compact mode and per-course collapse now persist per term/Plan, because our
  own post-save reload used to throw them away.

Removed:

- The always-on session countdown chip. MyUCLA already opens its own
  "Session Ending Soon" dialog, any click silently extends the idle timer, and a
  permanent clock mostly taught a wrong mental model. Remaining time now appears
  only inside the unsaved-changes pill, and only under 20 minutes, where it
  actually predicts losing work.

## 0.5.0 — 2026-08-20

Fixes found by running 0.4.x on the real page:

- **Stray horizontal rules.** MyUCLA puts a `tbody.course_divider` between every
  course. Our row spacing spread those out into floating lines. They are now
  hidden while the card treatment is on.
- **Card styling silently dropped.** The design tokens were declared only on our
  own elements, and the official course table is a sibling, not a descendant, so
  every `var()` in the card rules was invalid at computed-value time — no border,
  no white fill, no radius. Tokens are now declared on `.pl-plan-root` too.
- **Position chips went stale** after an optimistic drag; they now follow the
  displayed order.

Perceived-cost work:

- Replaced the spinner pill with a 2px page-load style hairline at the top edge.
  Saving order is plumbing; it should read as the page working, not as a task
  the student has to supervise.
- The reload after a sync now holds the plan area back for a beat and fades it
  in, so it settles instead of flashing. The stylesheet reveals it on its own if
  the script never runs.
- The confirmation shrank to a single small pill (`LING 1 → 第 2 位`), with the
  step count kept in its tooltip rather than shouted in the bar.

New:

- A session countdown chip in the toolbar. MyUCLA logs students out on a timer
  and they usually find out by being bounced to the login page mid-task; the
  chip turns amber under 10 minutes and red under 3 so they can refresh first.
  A page-world bridge reads only MyUCLA's own two timeout counters and forwards
  them; it calls nothing, extends nothing, and sends nothing off the page.

## 0.4.1 — 2026-08-20

- Matched the injected UI to the live Class Planner design system: ProximaNova,
  `#0055A6` / `#2C5E91` blues, `#E6F1F7` panel fill, 7px radius, and MyUCLA's own
  `icon-*` font for every control glyph.
- Gave each official course `<tbody>` a real card outline, following the page's
  actual three-row / `rowspan=2` cell layout.
- Raised control specificity over the page's Bootstrap base rules
  (`select{width:220px}`, `input{width:206px}`, `input[type=search]` content-box).
- Dropped the blocking sync overlay for a small corner progress pill.
- Drag now commits optimistically: the card stays where it was dropped and the
  list slides (FLIP) while the background sync runs, then one reload confirms.
- Replaced the popup's demo launcher with a single on/off switch; the content
  script starts and disposes live when the switch changes.
- Confirmed on the live page that a same-origin offscreen `ClassPlan.aspx` frame
  is readable and matches the visible plan, and that MyUCLA has no move-to-index
  command — `!0` is a constant suffix on every command, not a distance.

## 0.4.0 — 2026-08-20

- Added a background sync engine: the multi-step native reorder now runs inside an
  offscreen same-origin Class Planner frame, so the visible page reloads **once**
  at the end instead of once per adjacent swap.
- Kept every safety property of the old flow: exact page contract, exact native
  button allowlist, one move per full frame load, full expected-order check after
  each load, user confirmation, and cancel.
- Falls back to the original per-navigation flow when the offscreen frame cannot
  be trusted (blocked frame, different plan/term, or order mismatch).
- Restores scroll position and shows a short result message after the final reload.
- Rebuilt the injected UI: single compact toolbar, chip counters, icon-only card
  controls, and an overflow menu for rarely used actions.
- Replaced the confusing `主选 / 保底` tag placeholder with a hidden-by-default
  note field explained in plain language.
- Replaced the `置顶 / 位置 / 移动` button cluster with a position chip that moves
  the course when changed, plus a dedicated top button.
- Replaced HTML5 drag-and-drop with pointer dragging: neighbours slide out of the
  way in real time and `Esc` cancels.
- Gave each official course row a card treatment with spacing, rounded corners,
  and drag/hover states.

## 0.3.2 — 2026-08-20

- Replaced the large blocking reorder `window.confirm` with a compact inline confirmation bar.
- Kept explicit confirmation before any native MyUCLA ordering operation.
- Added controller coverage for opening and cancelling the inline confirmation.

## 0.3.1 — 2026-08-19

- Simplified the toolbar to product name, course/conflict count, search, compact mode, and one collapse toggle.
- Removed the status-filter dropdown and per-course status badges from the real-page UI.
- Reduced each course control row to drag, top, target position, move, collapse, and a small tag field.
- Cached verified course snapshots instead of repeating the full DOM contract during search and view changes.
- Replaced full course-card cloning with direct text-node reading below the header row.
- Ignored extension-owned DOM mutations to prevent unnecessary reconciliation loops.
- Added regression checks ensuring search neither clones cards nor re-runs the full contract.

## 0.3.0 — 2026-08-19

- Renamed the product UI to Better MyUCLA.
- Added plan search across rendered course/instructor text and local tags.
- Added Open, Waitlist, Enrolled, full/Closed, tagged, and conflict filters.
- Added plan status summary using only already-rendered MyUCLA information.
- Added per-course collapse, collapse/expand all, compact mode, and reset view.
- Redesigned the real-page toolbar and per-course sorting controls.
- Added read-only plan-insight tests and real-controller UI integration tests.
- Increased the verified suite to 42 passing tests across 9 files.

## 0.2.0 — 2026-08-19

- Added the exact MyUCLA Class Planner URL permission.
- Added the strict real-page DOM adapter and native sorting-button allowlist.
- Added server-persisted top, target-position, drag, and keyboard ordering.
- Added safe resume across MyUCLA full-page navigation with write-ahead order checks.
- Added local tags while preserving the official MyUCLA color picker.
- Verified native ordering behavior and restored the original live-page order.
- Added the privacy statement and sanitized MyUCLA DOM contract.

## 0.1.0 — 2026-08-19

- Created the local fixture prototype.
- Implemented adjacent-move planning, safety checks, annotations, demo UI, and initial tests.
- Kept real MyUCLA access disabled pending page verification.

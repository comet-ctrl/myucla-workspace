> Historical design notes. See [current product direction](PRODUCT_ROADMAP.md) and [HANDOFF](../HANDOFF.md) for the current project.

# Planner workspace direction — 0.17.0

The approved design keeps named navigation on the left, a selected workspace in
the center and the original weekly schedule on the right. It is implemented only
inside the existing extension and exact MyUCLA Class Planner page. Tidy is opt-in.

## Stable navigation and context

My classes, Find classes, Optimizer, Study list and Personal entries are direct
navigation destinations. Information & help exposes the entire original sidebar;
Original layout restores every native module. Secondary modules are opaque native
sections: retain all their content and handlers, including native conditional
hidden states. Do not rebuild an optimizer or enrollment interface.

Keep UCLA's masthead/account/navigation unchanged. It scrolls away normally;
the existing compact-header preference survives terms and reloads. The native
term chooser stays in its original parent/form. A compact Plan actions disclosure
contains the original menu, preserving each button's immediate parent and handler.
Do not invent another load-plan selector. Urgent native notices remain visible.

At widths >=1280px navigation is approximately 168px wide. Below that it becomes
horizontal. The right schedule defaults to 38% of available deck width, clamped
between 420 and 640px, and has a keyboard/pointer divider. Below 1100px a persistent
Schedule/workspace switch preserves each view's position and selections. Desktop
navigation and context stay in view; long lists, details and calendar scroll locally.

## My classes and details

Each class shows its name and passive per-section summaries of the original
section label, status, days and time. Never infer one aggregate course status from
differing lecture/discussion statuses. Summaries are ephemeral, not stored.

Selecting a class docks its native third-row details beside the list. The row
remains in its original course tbody; no native controls are cloned. A stable
slot defines the visual reading area. Preserve form association, native hidden
action rows, status markup and exact ordering-button contract. Rooms, instructors
and final-exam information remain available through labeled disclosures. Class
actions keeps the original color/order controls and extension notes/tools.

Module switches retain the selected class where it remains valid. Details closes
with an explicit button or Escape and returns focus. Quarter or DOM replacement
must discard disconnected references, never revive obsolete native controls.
Only explicit user actions may adjust local pane scroll; resizing must not jump
the document. All print/restoration paths restore the native row layout.

## Search and course previews

The original Search by selector and query inputs remain visible in their native
positions. Every offered mode is directly available, including unknown native
options. No redundant mode shortcuts or Edit search disclosure. Required field
labels and native disabled submit state remain authoritative; never read or store
query values, synthesize autocomplete choices, or submit on the user's behalf.

Complete already-loaded results use a local course index and selected native
section preview. A single result omits the redundant index. Index width is about
210px when the main area has enough space; smaller previews retain labeled cards.
Preserve original help, status text/icons, selection controls and action rows.
A trailing global native action container may dock at the preview's lower edge
without changing its parent, controls, disabled state or native visibility.
Unknown/incomplete result structures retain the native presentation.

Index filtering, selection review and scrolling are local. Filters must never
submit the native form. Preserve same-result state through row redraws, while
new result sets reset invalid selections. Subject/course searches still require
UCLA's native loading flow; no all-courses API, prefetch or prerequisite checker.

At phone widths the stacked native search fields and result list may exceed the
available height. Allow the Find panel itself to scroll locally, with a usable
minimum section-preview height, instead of collapsing the preview to zero.
Desktop results keep the search fields in place while the result areas scroll.

## Visual system and compatibility

Use readable 14px body text, 36–40px controls, restrained blue selection accents,
quiet separators and compact context bars. Avoid stacked headers, permanent
secondary action rows and nested decorative cards. Keep original calendar box
geometry, colors, enrollment/waitlist border conventions and native controls.

Original-layout restoration, Tidy disable, print, empty/future quarters and native
partial redraws are required behavior. In-page module/width/scroll choices add no
persistent storage, permission or network request. The existing notes, reorder
confirmation, Save/Undo/Stop and recovery mechanisms remain intact.

## Validation

Typecheck, 228 unit tests and the production build pass. Production Chrome
fixtures pass at 2048, 1440, 1366, 1536, 1280, 1200, 1100, 960 and 390px, plus
long-result, single-course, introduction, native redraw and future-quarter cases.
Checks cover original module controls/handlers, keyboard and touch access, local
scrolling, Details, selection preservation, native identity/status/calendar
geometry, print, full restoration and quarter lifecycle. Fictional desktop and
phone screenshots were visually inspected.

v0.17.0 is installed with all 17 files hash-verified and a verified v0.16.0 backup.
After the user signed in and reloaded, the real 2048x927 Class Planner passed
bounded structural and interaction checks: all modules, public search, native
forms, Details and help dismissal/focus, plan-menu availability, resizing and
Original layout restoration. No plan or enrollment action was performed. The
page is left on Find classes. Only fictional screenshots are retained; quarter
changes and printing were checked in fixtures rather than the real account.

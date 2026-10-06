# Privacy

MyUCLA Workspace is an unofficial, browser-only enhancement for the MyUCLA Class
Planner. It has no server, no account, no analytics, and no telemetry.

## What page it can touch

The extension requests exactly one page:

```
https://be.my.ucla.edu/ClassPlanner/ClassPlan.aspx
```

On that page it reads only what MyUCLA has already rendered: the term code, the
plan's numeric id, each class's numeric id and display name, the current order,
the seat / waitlist / conflict text already on screen, and the structure and
enabled state of MyUCLA's own ordering buttons.

With the optional tidy layout enabled it also reads the class-search dropdown's
mode and public options, input labels, and control structure. It does not read
or store the text you type into the search fields. Search modes remain in the
original dropdown, with its native change handler; the Search classes
control is the original native submit input, with its native disabled state.
Public search offerings may vary by term. Every native option remains available;
the extension does not create a second set of mode actions.
The required-selection hint reads only whether the original Go input is disabled.
The extension does not submit searches automatically or make extra requests.

It does not read or store passwords, cookies, tokens, your UID, grades, DARS, or
anything about Duo, and it does not visit any other MyUCLA page.

## What is stored, and where

Everything below lives in this browser only.

- **Your notes.** Up to 24 characters per class, in `chrome.storage.local`, keyed
  by term, plan, and class id.
- **View preferences.** Which classes you collapsed, and whether the optional
  "tidy up MyUCLA's own layout" switch is on. Only class identifiers, never any
  page content.
- **Compact header.** One boolean in `chrome.storage.local` remembers your
  Compact header / Show header choice across terms and reloads. It contains no
  account, term, course or page content.
- **Appearance.** `plannerLift.appearance.v1` stores only `system`, `light` or
  `dark`. System follows the browser's `prefers-color-scheme` setting. This
  preference is local and contains no course, account or page data.
- **Workspace layout (0.18.4 development).** A versioned preference in
  `chrome.storage.local` remembers public module identifiers, panel placement,
  floating coordinates and sizes, closed panels, divider sizes and navigation
  choices and local primary-pane folding. It contains no course or plan identifiers, search text, native input
  values, account information or page content. It stays in this browser profile;
  **Default layout** resets this arrangement.
- **An unsaved arrangement.** While you have rearranged a plan but not saved it,
  the order is kept so a timeout or a stray navigation does not cost you the
  work. Class identifiers only. It expires after 24 hours and is deleted as soon
  as it is saved, discarded, or found to be stale.
- **One random operation id** in the page's `sessionStorage`, so a reordering run
  only ever continues in the tab that started it.

There is no `fetch`, no `XHR`, no WebSocket, and no polling for open seats. The
extension never constructs a network request of its own.

## What you control

The floating-panel layout saves only the display preferences listed above in
v0.18.4 development. The published v0.18.2 keeps these in page memory only.
The shaded docking preview uses element bounds only. Dragging a blank header,
grip or navigation tab changes presentation within the same native form;
header buttons and Help keep their native behavior. Saving layout uses the
existing storage permission, with no network request or external window.
Explicitly opening a collapsed
module uses the same validated native disclosure as the existing navigation; restoring
or resizing the layout does not open a module or replay its actions.

Multiple expanded course details and their scroll position remain in memory.
The extension retains their existing course identifiers only through updates
within the same plan, and clears them on plan/term changes. Native enrollment
menus and subsequent content remain under MyUCLA's control; restoring the
display never submits or repeats their actions.

The optional workspace rearranges the original sections within the same MyUCLA
form. It reads only the course titles/exam text already allowed on this page,
for an ephemeral details heading; that heading is never stored or sent.
The original section table remains under its original course card. Original
layout restores section placement, and turning tidy off restores presentation.
Unknown section structures keep the native layout.

Pane folding changes only local presentation. In v0.18.4, local primary-pane
folding, workspace widths and navigation preferences are saved using public
section identifiers as described above. A saved choice never overrides a
natively closed body or triggers a request to expand it.
Development v0.19 adds public tab order, group membership, open/closed state
and the selected tab in each group under `plannerLift.workspace.v2`. It reads
the earlier v1 preference when needed and leaves that key intact for rollback.
Neither preference contains course names, course IDs, search inputs, native
selections, account identifiers or enrollment data.
In development v0.19.3, the same v2 preference may also contain one of five
allowlisted layout preset identifiers. It stores no new page data. Applying a
preset rearranges existing panels and preserves native selections; it never
submits a search, opens a native disclosure or changes a plan. Manual resizing
or moving tabs clears the preset and retains the custom arrangement.
Primary section-toggle clicks fold an already loaded pane locally
inside the validated workspace. If UCLA has natively collapsed Calendar, Class
Plan or Search, explicit expansion forwards its exact original disclosure once;
mounting never opens it. Their original handlers return with Original
layout. Selecting Optimizer, Study list or Personal entries may explicitly open
its known collapsed native disclosure, using UCLA's exact existing button and
postback. It is never loaded automatically on
mount, redraw or module restoration; no optimizer calculation or plan-edit
control is invoked. Header spacing reads element bounds only. UCLA navigation and the term
chooser keep their original placement. The complete plan action menu is placed
inside a disclosure; its controls keep their original parent and form, and are
never copied.

Final exam week is an ephemeral local panel built from the already rendered exam
lines. Its overflow entry, dismissal and keyboard focus add no stored data or
network request. Existing native Help popups are positioned inside their module;
their contents are not copied or stored. The existing draft recovery offer uses
the same storage and expiry; making its parent bar visible adds no new draft.

- Every action that could change the order MyUCLA has stored asks first, states
  how many steps it will take, and can be stopped part-way.
- **Delete all my notes** in the overflow menu removes only what this extension
  saved. It does not touch MyUCLA's own colours, plans, or order.
- The switch in the popup turns the whole thing off; the page then looks exactly
  as MyUCLA made it.
- Uninstalling stops it entirely, and the browser's extension settings clear its
  local data.

## The page-world bridge

To show how long a MyUCLA session has left, the extension injects one small
script that runs in the page's own JavaScript context. It does two things and
nothing else.

**It reads two numbers.** MyUCLA already maintains two global variables holding
the minutes remaining. The bridge range-checks them and forwards them over a
same-origin `postMessage`. The extension side accepts a message only from the
same window and origin, carrying this extension's own channel marker, and takes
only two bounded integers from it.

**It can count reading as presence.** On by default, switchable off in the popup.
MyUCLA's own `Timeout.js` extends your session on `mousedown`, `keydown` and
`click`, but not on scrolling, so reading your plan for fifteen minutes signs you
out. When the tab is visible **and** focused, scrolling or moving the mouse calls
MyUCLA's own `ExtendSession(false)`, at most once a minute, stopping after a cap
you choose (60 minutes by default). The request is MyUCLA's, not ours.

It reads no other page variable and no page content, never shortens a session,
never bypasses sign-in or Duo, and sends nothing anywhere outside MyUCLA. Walk
away and the session still expires on its original schedule; MyUCLA's roughly
four-hour hard limit is untouched.

## Local course previews (0.14.0)

The course browser reads only public headings and the structural shape of course
results already rendered by MyUCLA. It formats existing section cells in place;
native status text/icons, checkboxes, actions and form association are preserved.
The selected public heading/id exists only in memory for the current page and is
never logged, stored or sent. Search input values are neither read nor cached by
this presentation. There is no new network API, background load or catalog cache.
Unknown or incomplete results remain native. Details docking measures element
bounds only and never copies a native control. Rooms/instructors remain visible
in their original cells, with no separate disclosure required (0.17.6).

In 0.14.6 the separate extension-owned Filter courses field reads its own text
only to filter those loaded public headings in memory. It has no form name,
never submits, and is neither logged nor stored. The original MyUCLA search
input values remain unread. Expand Browse and local filter/disclosure/focus
choices introduce no saved preference. Notes, collapsed state and draft offers
reload under the existing term/plan key after a switch; a stale asynchronous
response cannot apply another plan's data, and its persisted draft is preserved.

The 0.14.7 selection reminder reads only the checked boolean of native
checkbox/radio controls in validated section-selection cells. If a selected
section is in another course preview, a local count/disclosure lets you return
to it. No checkbox value, query text or personal information is read or stored;
reviewing does not change the selection or invoke a native action.

In 0.15.0, Plan and Find classes switch only the visibility of existing native
sections. The view choice and class-list width are held in memory, with no new
storage or requests. Switching preserves the original query fields without
reading their values. Class Details opens inside its original card; status
contents, form controls and native actions are not copied or rewritten.

In 0.16.0, Class actions locally reveals the existing order/color controls and
extension tools inside their original class cell. Opening or closing it changes
presentation and focus only. No new page data is read or stored, and no native
action or request is triggered. Original layout restores all controls.

In 0.17.0, named module navigation and the calendar divider change local display
only. My classes summarizes the already-rendered section label, status, days and
time as ephemeral read-only text; no course-wide status is inferred. Selected
details keep their native course-row parent. Original module bodies, sidebar
widgets and plan-action controls remain intact. Module choice, sizing, selection
and scroll positions live only in page memory. No new permissions, storage,
server access or catalog requests are introduced.

In 0.17.6, recognized native Plan Actions panels receive bounded positioning
inside the same workspace. Their native buttons and fields remain in the same
parents and form. Presentation does not read saved plan names or form values,
or trigger save, rename, delete, new-plan, load or print actions. Dismissal may
forward a verified original close-only button or the original Load menu toggle.

## Compact introduction (0.14.3)

The extension checks the known planner introduction's public heading and DOM
structure. It wraps existing introductory text/links in a local disclosure and
styles the original term selector without moving it from its native parent/form.
Term notices and native alerts stay visible. Links & help changes the visibility
of the original sidebar widgets; it does not read, copy, summarize, log or store
their contents. All widget controls retain their native parents and handlers.
Document scrolling lets the unchanged UCLA banner scroll away. Scroll handling
reads element bounds only and sends no requests. These choices are local to the
page; no new storage, permissions or data collection is added.

Compact header / Show header changes only the document scroll position and
reads the existing public heading's bounds. Only the explicit boolean choice
is stored locally. In 0.19.4, top-edge hover or keyboard focus temporarily reveals
the unchanged native header without changing that preference. Pointer/focus
ancestry and native menu visibility attributes keep the header open while used;
menu text is not read or stored. Short, bounded transition/dismissal timers and
lifecycle events send no requests and do not poll. Show header pins it open;
disabling Tidy removes the behavior and all owned controls/listeners.
The same public introduction can be compacted on an empty/future quarter without
reading its course contents or enabling course actions. The existing mutation
observer watches native redraws; it does not fetch or retain another page.

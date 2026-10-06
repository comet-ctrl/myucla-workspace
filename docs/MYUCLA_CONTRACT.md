# MyUCLA Class Planner 脱敏页面合约

## Centered header hint (current local follow-up)

Course details are toggled by the recorded course heading (role=button,
keyboard Enter/Space) and noninteractive content in its first row. There is no
separate Details button. Native controls, tool editors, dragging and text
selection must not toggle details. Restore heading attributes/listeners exactly.
When the original header is visible, workspace clearance measures rendered
native surfaces in bounded open shadow roots, including menus that extend past
the header box. Native structure, handlers and text remain untouched. Existing
mutation events and ResizeObserver update geometry without polling or requests;
short windows retain a flow gap instead of overlapping the menu or term chooser.

The compact header uses an extension-owned centered 80px hint rather than a
full-width hover activation strip. Hover exposes an arrow only; explicit click
reveals the original header and keeps it open until the visible upward arrow
is clicked or Escape is pressed. Pointer departure, outside clicks and blur
must not dismiss an explicitly opened header. Reserve a 32px owned close-control
gap below the native surfaces. Preserve temporary native keyboard access,
and bound root scroll during explicit opening to the travel required by
oversized native surfaces; local pane scrolling remains independent.
Saved-expanded views also retain the upward close arrow and bounded root
travel; their arrow saves the existing compact boolean. Compact root alignment
is fixed at the public heading offset. Workspace background covers the bottom
actionbar reserve while content retains internal spacing.
reduced motion and cleanup. Hover never scrolls or
writes preferences. No native content, controls, requests or permissions change.

## Appearance (0.19.1)

System, Light and Dark change presentation only. Apply the appearance attribute
only while a known enhanced planner workspace or introduction is active;
Original layout and disabling the extension restore the previous attribute.
Do not restyle UCLA's masthead/navigation, invert the page, rewrite status text
or native icon markup, move native controls, or change calendar event geometry
and course colors. Dark overrides are screen-only so printing remains light.
Persist only the validated appearance enum using the existing storage permission.
React to native redraw, preference changes and system-color changes without
polling, replaying actions or reading additional page/account data.

## Grouped workspace (0.19 development)

In 0.19.3, an extension-owned Settings dialog offers five visual presets using
the same one/two-group model. Apply presets as a pure group transformation;
never activate a native control, replace a node, or change input values. Move
floating native panels by presentation only. Keep optional closed tabs closed;
split presets reveal Schedule and supply a browsing fallback if needed. Save
only the public preset enum in the existing layout record; ratios respect
readable-width floors and compact fallback. Manual geometry changes clear the
preset, while a cancelled resize restores it. Remove Settings on restoration
and keep it out of print. UCLA's navigation and native form remain intact.

The six recognized primary panels may share main/left/right tab groups, with
one active native panel per group and at most two visible docked groups. Owned
tab strips select, close and arrange the original panels without moving native
controls or course rows out of their existing parents. Inactive and closed are
distinct states. An independently floating Details projection remains usable
while its Classes tab is inactive; docked Details is concealed with Classes.

Drop targets explicitly identify merge versus split and the destination dock.
The preview and committed layout use the same reducer; unsupported or cramped
splits are rejected. Cancellation restores membership, selection and geometry.
In 0.19.2 the left/right split destination is a visual position, not a permanent
claim on a group identifier. When only one residual docked group remains after
removing the dragged tab, it can move to the opposite edge as a whole. Preserve
its closed siblings, order and active choice. Keep split targets below the tab
strip, which remains available for grouping/reordering, and never advertise a
split while the responsive layout can display only one pane.
Native redraw restoration never replays an action. V2 storage contains only
allowlisted public layout fields and retains legacy v1 storage for rollback.
Grouped pane bounds fit the visible viewport. A native Help popup directly
under a recognized title may receive bounded viewport positioning and flip
above the title when needed. Keep its parent, visibility and handlers intact;
restore prior presentation properties on dismissal or Original layout.
An owned navigation row may jump between multiple open course details. It
scrolls only the existing local stack; native tables, actions and section
statuses stay under their original course parents. Course selection and focused
jump continuity are ephemeral across recognized same-context redraws. Context
changes clear them. Calendar refinements must preserve native event bounds,
inline styles, colors, visibility and all original control identities.

## Compact panel controls (0.18.6 development)

Apply navigation collapse before measuring any dock or projected Details bounds.
The extension's navigation has an explicit scoped shadow reset; UCLA's original
navigation remains untouched. For one expanded course, omit only the redundant
group close control. Keep the course close and its focus return; multiple open
courses retain independent close controls and a labeled group close.

The recognized calendar display menu remains under its original #gridDiv and
native form. Where the measured title/control gap fits, position that same menu
beside the title. Smaller or unfamiliar structures retain normal menu flow.
Keep native IDs, handlers, values, selections and ancestry unchanged; scrolling
and resizing only recalculate presentation. Original layout and print restore
the menu's flow, and removal cleans up extension classes and geometry.

## Occupied panes fill available space (0.18.5 development)

An inactive or hidden main workspace does not reserve an empty column beside
docked panels. One edge panel fills the deck; two edges share its width with one
divider. Active Information or a main module still receives space. Reopening a
module restores room using remembered widths, without replacing them with the
temporary automatic size. Drop previews and committed placements share the same
occupancy calculation. Keep the main DOM ancestor present for floating native
panels and projected Details; hide only the empty placeholder. No controls move
parents and no native actions run as a result of filling space.

## Remembered workspace (0.18.4 development)

The user explicitly requested persistent layout. Store a versioned, strictly
validated preference containing only public module identifiers, panel placement,
floating bounds, hidden flags, divider widths and navigation choices. Never
include course/plan/term identifiers, native values, search text or page content.
Apply saved presentation only to freshly recognized modules. Restoration must
not click or replay native disclosures, searches, plan actions or enrollment.
Unknown or malformed preferences fall back safely. Native course details remain
ephemeral and cannot be restored from this layout preference.

Default layout resets the extension's workspace arrangement, including closed
panels, custom sizes and navigation, and saves the reset. It does not change the
compact-header preference or any native plan state. Original layout still
restores UCLA's presentation. Drag positions are transient until committed;
cancellation cannot save an intermediate position. During movement, panels
follow the pointer, then floating bounds are clamped on release so they remain
reachable. No additional permissions or requests are introduced.

## Flexible panels (0.18.2 prerelease)

Dragging an owned grip or navigation button, or a blank native header area,
arranges the existing native sections by CSS coordinates only. Sections remain
under their current workspace parents;
course rows, native controls, IDs, handlers and form association are unchanged.
Floating means an in-page panel in the same document, not another browser window.
The owned details frame supplies viewport bounds; native third rows remain
under their original TBODY and use the existing clipped projection.

Docking supports left, right and main placements only. Generous side regions
and the main panel's header accept drops; a shaded preview covers the full
destination area. There is no bottom dock. Hit regions and destination bounds
are captured before the panel leaves its dock so targets stay stable during
the gesture. Header dragging starts only from blank, noninteractive content;
native buttons, links, fields and Help popups retain their ordinary behavior.

Layout gestures never submit a plan or enrollment action. Explicit dragging or
floating of a collapsed module may forward its already validated native
disclosure, under the same exact contracts as named module navigation.
Displaced panels, snapshot restoration, reset and viewport resizing never
forward disclosures. Opaque title checks ignore only extension-owned grips,
and still require the exact native children, handler and form.

Only public panel identifiers and presentation geometry exist in the in-memory
snapshot, including whether a panel is hidden. Hiding changes presentation only;
native controls, values and open course records remain in their original nodes.
Reopening is explicit through navigation or a course's Details button. During
dragging the actual panel follows the pointer; cancellation restores geometry,
placement and stacking. A snapshot during dragging uses the committed layout.
Same-context redraws attach these settings to fresh recognized nodes; context
exit resets layout and old course references. Original layout removes all grips,
resize handles, positioning, listeners and docking previews. Print restores flow.

## Multiple details and native redraw continuity (0.17.11)

Each expanded My classes course retains its own native third row and section
table under the original course TBODY. Owned spacers describe a shared scroll
stack; presentation coordinates align native rows beside the course list.
Independent Close and Escape return focus to the corresponding Details button.
Native action menus and workflow content remain inside their original parents,
with unchanged handlers and form association. Print removes docking/clipping.

Retain only validated course IDs across an automatic same-context reconciliation,
then attach presentation to the fresh native nodes. Never reinsert stale nodes
or invoke a native action while restoring details. The controller restores the
workspace on leaving the validated term/plan context before activating the next
one, so matching course IDs cannot carry expansion into another plan.

Bounded live structural inspection observed a native section action menu as
button.link.actionMenu and tr.mobilemenupanel > td[colspan=10] >
div.message.enrl-plan-actions.touchpanelmenu. The course's third-row TD also
contains a sibling div.planClass. No final enrollment command was invoked.
Fictional tests model these structures; they do not assert backend enrollment.

## Schedule sizing and per-section status colors (0.17.10)

The schedule retains its default proportions but can grow past the old 640px
cap. Its maximum is deck width minus a 420px browsing area and 12px divider.
The owned Widen/Restore width control changes only layout, keeps the previous
custom width in memory and is removed on restoration. Divider bounds and End
follow available width; narrow full-width Schedule and native Grid size controls
are unchanged. Resizing never invokes native schedule or plan actions.

Class-list summaries use the existing strict status parser only for color.
Original text/counts stay intact; each section is independent. Open/Enrolled
is green, Waitlist amber, Closed red, unknown or contradictory wording neutral.
Native status nodes/icons are untouched. Summary text separates native BRs with
spaces and excludes explicitly hidden rows/content. No new stored data or requests.

## Course list and details hierarchy (0.17.9)

My classes retains the original course nodes in a wider local list. The docked
detail TD has a readable maximum width; its table and native controls remain in
their original ancestry. At wide detail widths, primary headings align with the
section values. Plain Location/Instructor THs are visually clipped (accessible
content retained), because each section already has a local caption. If either
heading contains an interactive descendant, it stays visible. Native room and
instructor data, help, status markup, hidden states and control identity remain
authoritative. Change links/buttons get boundaries through scoped CSS only.

Pointer dragging in the workspace uses the direct #panelPlan scroll container
under the recognized .pl-workspace-plan when it contains the handle and supports
scrolling. This is local display movement only; save and native reorder behavior
remain unchanged. Browser verification must compare scroll position before and
after dragging: an already scrolled list is not proof of autoscrolling.

## Control audit and native disclosure boundaries (0.17.7)

Final exam week is one extension-owned overflow action. Its nonmodal dialog is
appended to the body, never inside the plan's native table or calendar. It uses
only currently rendered exam lines, adds no storage/request, and closes on stale
course/root replacement or context exit. More uses an owned native popover.

Study list title `#plannerSectionEnip` contains a native link, `#slneTip` help,
and `#ctl00_MainContent_toggleNotplan`; Personal title `#plannerSectionPer`
contains `#ctl00_MainContent_helpPersonal` and `#ctl00_MainContent_togglePersonal`.
Each section has exactly the original title and body (`#panelNotplan` or
`#panelPersonal`). The original toggle has no type attribute, contains the native
plus/minus icon and label, and belongs to the same POST `#aspnetForm`.
The observed closed-state handlers are exactly:

```
shrink('panelNotplan'); __doPostBack('ctl00$MainContent$toggleNotplan','')
shrink('panelPersonal'); __doPostBack('ctl00$MainContent$togglePersonal','')
```

Only explicit module navigation may forward the validated original expand
button. Do not infer a handler from label text, expand unknown structures, or
invoke it during mount/redraw. Native closed state, disabled state, same form,
exact IDs, structure and handler must all match. Pending requests are deduplicated.

The same explicit-only rule applies when native Calendar/Class Plan/Search was
collapsed before workspace mount. `#ctl00_MainContent_toggleGrid` calls
`shrink('gridDiv'); __doPostBack('ctl00$MainContent$toggleGrid','')`;
the Plan/Search counterparts target `panelPlan`/`panelSearch` and
`togglePlan`/`toggleSearch`. Preserve the nested grid's native closed state and
Grid/Agenda choices. Owned expansion forwards only the validated closed heading,
with pending feedback, rather than forcing hidden content visible. Unknown
primary contracts restore native presentation. Ordinary local folds stay local.

Native Help creates a direct-title `.popover.clickover.fade.bottom.in` whose
376px width/negative left placement was clipped by the workspace. Scoped CSS
bounds that same node inside the module; original visibility and handlers win.
Section rows and headings must retain native inline `display:none`, `hidden`
and `.hidden` states, including printing. Never use a grid override to revive them.

The 0.17.5 Optimizer opening observation is historical, not a backend guarantee:
the 0.17.7 audit of installed 0.17.6 saw the native heading remain collapsed in
both workspace and Original layout. Keep this live result explicit until a fresh
loaded build verifies otherwise. See `CONTROL_AUDIT.md` for the coverage boundary.

## Plan Actions and always-visible section metadata (0.17.6)

This supersedes earlier room/instructor disclosures: those original fields and
their native help controls stay visible during selection and in My classes
Details. Native hidden attributes/classes and inline hidden states still win.
No field or control is copied, moved or submitted by this presentation.

Live inspection found seven native Plan Actions buttons inside the anonymous
`.plannerTopMenuLinks`. They retain `#aspnetForm` and their original handlers.
The current empty plan natively hides Rename/New/Save a Copy/Delete/Print; preserve
those visibility choices. Load and About are available. Do not inspect plan names
or field values, or invoke a saved-plan mutation while checking presentation.

Load toggles a direct wrapper child `.mobileloadmenupanel.touchpanelmenu.noprint`
containing `div.message > ul`. About opens direct `#AboutDragger.message.info`
(a header and content div); Rename and Save a Copy share direct
`#SaveDragger.message.info` (a header and three native rows). These static panels
were incorrectly becoming additional workspace grid children. Present recognized
panels in place with bounded overlays; native visibility and controls remain
authoritative. Preserve direct `#ResponseMessageDragger` and its original close
buttons. Never activate a submit/save/delete/load/print action automatically.

The About close button hides only About and focuses `#aboutMenuEntry`; Save and
Response have native hide-only close controls. Load has no close button and its
original `#loadMenuEntry` toggles the panel. Extension dismissal may forward only
the verified native close/toggle, never an action that saves or loads a plan.
Keep an anonymous replacement menu through redraws and Original-layout restore.

Search classes is still the original `#ctl00_MainContent_cs_goButton` input,
including its name, `Go` value, form and disabled state. Scoped CSS suppresses
the conflicting native gradient without changing whether it can submit.

## Optimizer disclosure and section details (0.17.5)

Live inspection confirmed Optimizer is initially collapsed: `#panelOptimizer.hidden`
contains native controls, and `#classOptimizerTitle` contains the original
`button#ctl00_MainContent_toggleOptimizer.planSectionToggle.link`, an
`i.icon-plus-sign` and a label. Its exact handler is
`shrink('panelOptimizer'); __doPostBack('ctl00$MainContent$toggleOptimizer','')`.
An explicit native click opens the panel after UCLA's partial postback, removing
`hidden` and changing the icon to `icon-minus-sign`. No optimizer calculation or
plan-edit action was invoked during inspection.

An explicit choice of Optimizer in workspace navigation may invoke that exact
validated original expansion control once. Do not load it on mount, redraw,
implicit module restoration or polling. Keep the native heading available and
explain pending loading; never force a conditional panel visible or substitute
native controls. Unknown control structures retain native behavior.

Plan Details previously retained native gray cell backgrounds, centered day
cells and a three-line floated status icon while its grid used three tall rows.
Mark original plan TH cells for alignment and use compact columns at wide pane
widths, labeled rows below that. Scope native-style resets to validated marked
cells; preserve status HTML, icons, controls, hidden states, ancestry, disclosure,
printing and restoration. Do not apply them to opaque Study list rows.

## Empty plan with populated Study list (0.17.4)

Live verification after sign-in showed the same empty `#panelPlan` alongside
`#panelNotplan #div_landing > table` containing Study list course rows.
The root ID and course-row class are reused outside the editable plan. Empty-plan
recognition must scope its absence checks to `#panelPlan`; it must not reject or
read course contents from another native module. The existing editable adapter
already scopes its root to `#panelPlan` and remains unchanged. Study list stays
an intact native module with no extension course tools or storage activation.

## Native New Plan empty state (0.17.3)

An explicitly requested live click on `#newPlanMenuEntry` caused a native redraw
into an empty plan, with no dialog. All six original planner modules remained,
but `#div_landing` and its course table were absent. The strict course-action
adapter must continue rejecting that state. Layout recognition is independent
and must never enable reorder, save, annotations or course-context storage.

The recorded empty marker is
`section.classPlanner_ClassesInPlanSection > #panelPlan`, containing exactly a
`div.classPlanner_SectionData` and an empty table. The data div contains a
`div.no_data_text` with no element children, followed by the two original hidden
inputs `ctl00_MainContent_planClassListView_clCommandField` and
`ctl00_MainContent_planClassListView_clCommandFieldTracker`. Both inputs remain
in the original POST `#aspnetForm` targeting ClassPlan.aspx. Do not inspect their
values. No course rows may coexist with this marker. Unknown shapes stay native.

New Plan hides the original Rename/New/Save a Copy/Delete/Print buttons; Load
and About remain visible. Preserve those native visibility choices. The empty
workspace must preserve native search, calendar, module and plan controls,
recover after partial redraws, and restore everything when Tidy is disabled.
Revalidate the empty shape after mutations and when reopening the workspace.

## Native result-row presentation (0.17.2)

Validated result rows also carry `.row-fluid` clearfix boxes and legacy span
styles. Remove their generated grid items; normalize only the marked cells'
minimum height and text alignment. Native status markup/colors stay intact;
the lock icon's three-line floating box becomes an inline icon through CSS.

Rooms & instructors now gates both optional data fields (6/8) and their original
header help controls. Expanding it exposes all of them in their original parents;
the optional headings align with their fields instead of stacking at the right.
This supersedes the 0.15.1 requirement to keep optional help visible while closed.
Primary help remains visible. Native inline hidden states and hidden attributes
or classes win over the expanded presentation; print exposes optional content.
No control is replaced, no field value is read, and no native action is invoked.

## Native search layout compatibility (0.17.1)

The validated search row retains native `.row` clearfix pseudo-elements,
percentage-width `.panel-5`/`.panel-7`/`.panel-10` wrappers and inputs with inline
96% widths. Reset those dimensions only inside `.ClassSearchWidget.pl-search-widget`.
Remove the row's generated clearfix boxes so they cannot occupy grid columns.
Native mode updates set `.searchFieldPanel` to inline `display:block`; override
only that visible value. Preserve inline `display:none`, hidden attributes and
native hidden classes, including below the 600px container breakpoint.
The Search By wrapper includes a colon text node between its label and select;
block flow keeps the label/colon together without moving or replacing controls.

## Persistent calendar workspace (0.17.0)

This supersedes the Plan/Find and inline-Details layouts below. Named modules
occupy the main workspace beside the original calendar. Preserve every original
section body, control parent/form and handler. Dock native course third rows only
through presentation; they must remain under their original course tbody. Native
status text/icons are unchanged; ephemeral section/status/days/time summaries
must not infer a course-wide status. The original plan menu may be wrapped in an
unowned disclosure; its buttons retain their immediate parent and handlers.

Read-only live structure confirmed on October 3: Optimizer contains
#classOptimizerTitle, #HelpOptimizerDiv.message.info and #panelOptimizer.hidden.
Preserve the native conditional hidden state; do not force the optimizer panel
open when selecting its module. Study list contains #plannerSectionEnip and
#panelNotplan; Personal entries contains #plannerSectionPer and #panelPersonal.
Host these modules intact, including unrecorded native descendants.

The original Search by selector stays visible in its original parent. No mode
shortcut forwarding or Edit search disclosure remains. Keep the exact existing
form/field/submitter validation; mounting sends no native change or submit.
All native options survive, including term-specific unknown choices. Only a
trailing global result-action container outside course entries/bodies receives
optional sticky presentation; do not change its visibility or native controls.
Bound the result grid only when the widget's direct children match the recorded
controls/header/results and owned presentation nodes (plus hidden inputs or
scripts). An unfamiliar sibling restores scrollable native fallback. Cleanup of
the Search classes wrapper must preserve a live native Go replacement inserted
by partial redraw, rather than removing it with the old presentation wrapper.

Desktop module navigation never hides the calendar. Narrow Schedule switching,
module selection and divider sizing are in memory only. Restore and print reveal
all native sections and remove docking, navigation and disclosure presentation.
No navigation/masthead changes, expanded permissions, requests or new storage.

## Class actions and workspace scale (0.16.0)

An owned Class actions button follows Details inside the original linkPanelRight
cell. Its disclosure changes a local class on that cell; OrderingButtons and
the owned real-tools group stay under their original parent. No native control
or handler is moved, copied or invoked. Closing returns focus, Find closes the
disclosure before hiding Plan, and restoration removes its buttons/classes.
Class-list sizing is now 360px by default with 300–480px bounds, retaining the
420px schedule reserve when space permits. Changes remain in memory only.

Theme only the validated workspace/introduction and known planner controls.
Never apply global framework/reset styles to UCLA navigation. Course browsing
is constrained to a readable maximum width; calendar boxes keep their geometry,
native colors and state borders. Read-only structural inspection confirmed the
weekday row as #gridDiv tr.primary.light.headerBar.classPlanner, with six TDs;
the toolbar remains .classPlanner_SectionMenu.plannerMenuLinks with native SPAN
children. This structural record contains no course/account contents.

## Visual hierarchy refinement (0.15.1)

Prepend only the owned Details button inside the existing linkPanelRight cell.
Native order/color controls keep their parent, identity and handlers. The button
reports aria-expanded and remains first in both visual and keyboard order.

Each validated result header receives pl-section-result-heading and indexed
pl-section-help-field cells without changing native cell contents. At an actual
preview width of at least 640px, native captions align with rows and stay sticky
inside that preview. Repeated row captions are visually clipped, never removed
from accessibility. Narrow cards keep those captions and native header help.
Optional location/instructor fields retain their own labels; native help for
them remains accessible even when the values are folded. Restoration removes
only owned classes/labels and restores prior data-pl-field attributes.
Unknown shapes fail closed under the existing exact header contract.

## Plan and Find classes presentation (0.15.0)

This supersedes the three-pane and floating Details presentation below. Owned
Plan / Find classes buttons change local task classes on the existing workspace
host/deck. Plan shows Classes and Schedule; Find shows the original search section.
The existing native section nodes, fields, values and handlers stay in the form.
Neither a task switch nor a remount submits or dispatches native search events.
Task choice survives partial redraws in memory only. Original layout restores all
six sections at their original anchors. Unknown structures remain native.

Details stays inline inside the selected course's original third row at all
widths. Only the owned heading/disclosures move; original controls never do.
Find closes Details before hiding the Plan section. Close/Escape restores focus.
Explicitly opening Details minimally scrolls the nearest actual Plan scroller
to reveal its heading and close control; document scroll and later resize remain
unchanged. Tools holds the two plan-pane reopen buttons, the three secondary modules and
Original layout. The only splitter resizes Classes between 260 and 440px while
reserving Schedule space. Print reveals all sections regardless of selected task.
Before printing, open only the owned Tools disclosure, saving its previous choice
once; after printing or disposal, restore that choice and remove listeners on
disposal. This handles closed-details suppression on Chrome 120 without native actions.
No changes to permissions, native statuses, stored data or network behavior.

## Class search presentation (2026-10-01, structural inspection only)

- Section: `section.classPlanner_ClassSearchSection`, title `#classSearchTitle`.
- Widget: `#panelSearch > .ClassSearchWidget`; controls `.ClassSearchControls`.
- Native mode: `.searchType select#ctl00_MainContent_cs_searchBy.searchBy`.
  Its change handler triggers the existing native postback. Only an explicit
  user shortcut click dispatches that change; mounting does not change the mode.
- Offerings vary by term: a second live list has `onlinerecorded` in place of
  `cutf`. Require unique option values and exact common value/label mappings;
  do not require a fixed total or order. Every injected action checks its
  exact approved value/label, enabled state and current control contract again
  on click. Unrecognized core controls or common mappings leave search native.
  Grouped secondary choices contain only recognized options actually offered.
  The complete native dropdown remains intact and is visible under More when
  any option is unknown. Never create a shortcut for an unknown option.
- Three `.searchFields > input.ClassSearchBox` text inputs have IDs
  `searchTier0`, `searchTier1`, `searchTier2`. Their aria-label/placeholder and
  inline visibility change after a mode switch. Labels can briefly be empty
  during native initialization; observe only those input attributes to update
  presentation, without reading query values or making requests. Shortened
  visible labels preserve the original wording as their title. Native Go's
  disabled state updates a selection hint: typed text alone may not enable
  search until a required autocomplete suggestion has been selected.
- Native submit: `.goPanel input#ctl00_MainContent_cs_goButton.csGoButton`,
  `type=submit`, `value=Go`. All controls belong to the original POST form on
  the exact Class Planner path. Foreign form overrides reject the presentation.
- Preserve original input/select nodes, names, placeholders, values and handlers.
  The submit caption is a pointer-transparent owned span over the original input;
  no replacement button or automatic submit is used. Its temporary aria-label
  is restored when disabling tidy.
- Navigation, More-search and submit wrappers are deliberately NOT marked owned because they
  contain native nodes. Unwrap them before the general owned-node cleanup.
- Search-only redraws may replace `#panelSearch` without replacing the plan
  table. Reconcile on changed search widget/control identity or public options
  as well. Restore the mode panel at its original comment anchor before
  removing a wrapper that contains it.
- Optional calm section styling requires `.classPlannerWrapper` containing the
  known class-plan panel. No section is hidden or moved by the page theme.

验证日期：2026-08-19。本文只记录实现需要的结构，不包含课程名称、用户标识、凭证或请求内容。

## 页面边界

- Origin：`https://be.my.ucla.edu`
- Path：`/ClassPlanner/ClassPlan.aspx`
- 表单：`#aspnetForm`，`POST` 回同一路径
- 列表：`#ctl00_MainContent_classPlanPanel #panelPlan #div_landing > table`
- 直属课程卡：`:scope > tbody.courseItem`
- 学期选择器：`#ctl00_MainContent_termSessionChooser_TermChooser`
- Plan 字段：`#ctl00_MainContent_planIDField`

课程卡使用 `Class<数字> courseItem itemClass`（首卡另有 `firstClass`），扩展只接受唯一、受限长度的数字课程标识。

每张课程卡是一个 `<tbody>`，固定三行：

1. `td.SubjectAreaName_ClassName` + `td.linkPanelRight[rowspan=2]`
2. 标题下方的单个 `td`
3. 跨两列的 `td[colspan=2]`，内含 `table.coursetable`

注入样式的卡片描边必须按这三行的具体单元格来画，不能假设每行都有两个单元格。

页面自带 Bootstrap 基础样式（`select{width:220px}`、`input{width:206px}`、表单控件固定 height/padding、
`input[type=search]{box-sizing:content-box}`）。注入控件用元素名提高特异性压过这些规则，不用 `!important`。

页面同时提供 `iwe_icon_fonts.css` 图标字体，官方排序箭头用的就是 `icon-circle-arrow-up/down`。
注入控件复用同一套 `icon-*` 类名（`icon-reorder`、`icon-double-angle-up`、`icon-tag`、
`icon-chevron-down`、`icon-ellipsis-horizontal`），以保持与官网一致的观感。

## 排序按钮白名单

每张课程卡只允许：

- 上移：`button.link.moveupClass`，ID 为 `muClass<课程数字>`
- 下移：`button.link.movedownClass`，ID 为 `mdClass<课程数字>`
- 英文 title 和 aria-label 必须与方向精确对应
- inline `onclick` 必须是已验证的 `courseListAction(...)` 格式，并引用同一课程数字
- 按钮必须属于 `#aspnetForm`，且不能自带 `formaction`、`formmethod` 或 `formenctype`

首张卡的上移与末张卡的下移通过 `visibility: hidden` 隐藏。执行前扩展会再次确认目标按钮可见且未禁用。

## 排序命令格式

`courseListAction(...)` 最终只是 `__doPostBack(sourceID, commandContent)`。页面上出现过的
command 形如 `moveupClass|<课程数字>!0`、`movedownClass|<课程数字>!0`、
`colorchange|<课程数字>!<颜色>!0`、`toggleAlternates|<课程数字>!0`，以及
`Remove Class From Plan|<科目>!<课号>!<课程数字>!0` 等。

结尾的 `!0` 出现在**所有**命令上（包括本身没有位置概念的 colorchange），因此它不是"移动几位"的参数。
官网没有"移动到第 N 位"的命令，只有与相邻课程交换。要移动 N 位就必须发生 N 次回发。

## UpdatePanel（2026-08-20 修正）

页面初始化脚本中：

```js
Sys.WebForms.PageRequestManager._initialize('ctl00$scriptManager1', 'aspnetForm',
  ['tctl00$main_wrapper',''], [], [], 90, 'ctl00');
```

`ctl00_main_wrapper` 是注册过的 **UpdatePanel**，整张课程表在它内部。因此
`courseListAction` 触发的排序、改颜色等操作**可能是异步局部回发**：服务器只返回
增量，MS AJAX 直接替换该 panel 的内容，**不触发 `load`、不发生页面导航**。

对实现的硬性要求：

- 注入 UI 必须挂在 panel 之外的稳定节点上观察（本项目观察 `document.body`），
  否则 MutationObserver 会随着旧节点一起失效，插件在一次改颜色后就再也不回来。
- 等待一步排序完成时**不能只等 `load` 事件**，必须轮询 DOM 直到出现预期顺序，
  这样整页导航和局部回发两种形态都能处理。
- 局部回发会用服务器顺序覆盖本地未保存的排序，且**不触发 `beforeunload`**。

## 冲突标记（2026-08-20 修正）

`div.final_exam_info.exam_conflict` 是**布局容器，出现在每一张课程卡上**，不是冲突
状态。以它判断冲突会把 17 门课全部误报为冲突。真实冲突只在 MyUCLA 渲染出显式控件
时存在：`[aria-label='Exam Conflict Info']` / `[title='Exam Conflict Info']`，时间
冲突同理。

## 已验证行为

1. 点击一次原生排序按钮触发表单提交（在 UpdatePanel 下可能表现为局部回发）。
2. 提交后只有目标课程与相邻课程交换。
3. 普通刷新后新顺序仍然存在，因此顺序已由 MyUCLA 保存，不是扩展只改页面显示。
4. 用反方向按钮复原并再次刷新，验证前的顺序已恢复。

## 离屏 frame（2026-08-20 只读验证）

在已登录页面上以只读方式建立一个同源 `ClassPlan.aspx` iframe：

- 未被 X-Frame-Options / CSP 阻止，`contentDocument` 可读；
- frame 内的课程数量、学期、Plan ID 与可见页面完全一致；
- frame 内每张卡都带有通过白名单校验的原生上移/下移按钮。

因此多步排序可以在离屏 frame 内逐步完成，可见页面只在最后刷新一次。
本次验证没有点击任何按钮，也没有改变任何顺序。

## 更新策略

任何必需选择器、按钮属性、课程唯一性、表单路径、学期/Plan 格式或预期完整顺序不匹配时，扩展停止操作并清理待办状态。重新适配官网更新前不得放宽到模糊按钮匹配。

## 冲突标记（2026-08-20 再次修正）

第一次修正（只认 `[aria-label='Exam Conflict Info']`）修过头了：**时间冲突没有任何
class 或 aria-label 标记**，因此会被完全漏掉。

真实结构：冲突信息在 `a.uit-clickover-bottom` 的 `data-content` 里，是一段
MyUCLA 自己写的 popover HTML：

```html
<div class="popover_section_title warning light">Warning: Time Conflicts</div>
<ul class='bulleted_list'><li>DESMA 10</li><li>ENGR 170</li></ul>
```

标题为 `Warning: Time Conflict(s)` 或 `Final Exam Conflict`，`<li>` 就是冲突对手的
课程代号。判定必须按 `data-content` 的文本，不能按 class、aria-label 或图标——
`icon-warning-sign` 同样用在 `Additional Information` 之类的普通提示上。

注意：同一份 plan 内 `tip-*` 这些 id 会重复，不可作为唯一键。

## 周历方块的边框就是选课状态（2026-08-27 只读验证）

`#gridDiv .planneritembox` 的 inline style 里，`border` 的样式表示这门课属于哪一类。
**这不是推断，是 MyUCLA 自己在控件的帮助气泡里写的**（`div.classPlanner_SectionMenu`
里那三个 `uit-clickover-bottom` 按钮的 `data-content`）：

| 边框 | MyUCLA 的原话 |
| --- | --- |
| `double 3px` | enrolled/waitlisted classes appear with a double border |
| `solid 1px` | Planned classes appear with a solid border |
| `dashed 1px` | Alternates appear with a dashed border |

注意 `double` 是 **enrolled 或 waitlisted**，不是只有 enrolled。在一份 7 门课、
20 个方块的真实 plan 上逐个核对与上表一致，但那份 plan 里没有 waitlist 的课，
因此 waitlist 这一半只有 MyUCLA 的原话为证，尚未在真实页面上见过。

同一门课的所有方块颜色一致（`background-color` / `color` / 边框色三个值成套），
因此颜色可以在**周历内部**把同一门课的方块归为一组。但它不能用来对应到下面的
课程卡：卡片上没有任何元素带这个颜色，`.colorswatch` 这个选择器在真实页面上不
存在（返回空集）。

对实现的意义：注入 UI 要表达「已选上 / 还在计划 / 备选」时，这三种边框是**页面
自己已经在用的记号**，学生在周历上已经在读它了。不要另发明一套，也不要用同一个
记号表示别的意思。

样例（脱敏，只保留结构与颜色）：

```html
<div style="background-color: #F9F9EC !important; color: #605F20;
            border: double 3px #CECD6B; top: 48px; left: 0%;
            width: calc(100% - 7px); height: 35px;"
     class="planneritembox smallitem">MGMT 170<br class="hide-small"><span
     class="hide-above-small"> </span>Lec 1<br class="hide-small"><span
     class="hide-above-small"> </span>Entrepreneurs Hall C314</div>
```

方块本身**没有 id，也没有任何 data 属性**，三行文字依次是课程代号、section、地点。

Layout sizing check (2026-10-01, numeric DOM measurements only): day columns
and meeting blocks use content-box sizing. Full-day blocks use
`calc(100% - 3px)` for solid borders or `calc(100% - 7px)` for double borders;
collisions use the same deductions with 50% widths and 0%/50% positions.
Adding outer horizontal padding makes these boxes spill into the next lane.
Keep native inline geometry and apply text insets to owned inner line spans.

## 周历上方的三个显示开关（2026-08-27 只读验证）

容器是 `div.classPlanner_SectionMenu.plannerMenuLinks.checkboxStateHolder`，
当前状态写在容器自己的 class 上：`studylistChecked`、`planChecked`、
`alternatesChecked`。

每个开关是一个 `span#<name>ShowHide`，里面两段：

1. `<span>` 包一个 `uit-clickover-bottom link` 按钮，按钮文字就是标签（`Study List`
   / `Plan` / `Alternates`），`onclick="return false"` —— 它只负责弹帮助气泡。
2. `<span class="show<name> icontoggle gridsizeicons">`，里面**两个绝对定位的按钮
   叠在一起**：`icon-check-empty` 与 `icon-check`。显示哪一个由容器上的状态 class
   决定，点击则同时改状态 class 并发 `triggerPostback('<n>|+' / '<n>|-')`。

也就是说这些「复选框」**不是 `input[type=checkbox]`**，是两个叠放的按钮加一次回发。
注入自己的开关时可以沿用同一套结构和图标，但**不得调用 `triggerPostback`**，
也不得复用它们的 id。

## 课程卡的 section 表（2026-08-27 只读验证）

`tbody.courseItem` 第三行里的 `table.coursetable` 是九列：

```
Change | Section | Status | Info | Days | Time | Location | Units | Instructor
```

`Section` 与 `Location` 两列的写法和周历方块的第二、三行**逐字一致**（`Act 1` /
`Entrepreneurs Hall C314`），而周历方块的课程代号用缩写（`MGMT 170`），
卡片标题用全称（`Management 170`）——**课号部分两边相同，只有学科名不同**。

表格最后一行是 Plan Actions / Enrollment Actions，其中包含 **Enroll 按钮**。任何
注入行为都不得触碰这一行。

Status-cell structure check (2026-10-01, element structure only): the third
cell uses an empty `i.icon-ok` or `i.icon-unlock`, text, and an optional `br`
before capacity text. The compact view also supports the previously recorded
empty span icons. Only known static status text is folded. Interactive notices
and unfamiliar markup remain native. The original nodes must remain readable
by source readers and be restored on disabling the tidy layout. A waitlist
"Taken" count means filled capacity, not a student's position in the queue.

## 会话超时：只补在场信号，不做后台心跳

`IWE/js/Timeout.js` 的事实：

- 空闲超时由服务器下发，本次观测为 15 分钟；绝对上限 `maxTimeoutMinutes` 为 239 分钟。
- `$(document).on("mousedown keydown click", ...)` 会在任何一次交互后调用
  `ExtendSession()`（内部 60 秒节流），因此**正在操作的用户不会撞到空闲超时**。
- `if (keepAlive) setInterval(ExtendSession, 2 * 60000, true)` —— 是否常驻心跳由页面决定。
- MyUCLA 自带 `#divFeatureTimeout` / `#divMaxTimeout` 两个警告框。

补充观测（2026-08-20，Class Planner 页）：`keepAlive` 为空字符串，即**本页没有
常驻心跳**，只有交互能续期。而 `Timeout.js` 监听的是 `mousedown keydown click`，
**不含 scroll 与 mousemove**——因此一个正在滚动阅读计划的学生会被判定为"不在"。

本扩展在用户明确要求并知情的前提下实现 **presence-based keep-alive**，边界如下：

- 只由真实输入事件触发：`scroll` `wheel` `mousemove` `keydown` `pointerdown`
  `touchstart`；**没有任何定时器**。
- 必须 `visibilityState === "visible"` 且 `document.hasFocus()`。切走或失焦即停。
- 自身节流 60 秒一次，且调用的是页面自己的 `ExtendSession(false)`（它另有 60 秒节流
  和自己的 CSRF token）。扩展不构造任何请求。
- 有硬上限（默认 60 分钟，可设 30 / 60 / 120 / 不限），超过后彻底停止。
- 默认开启，可在扩展弹窗关闭。

因此人一旦离开，会话仍按原本的时间线过期。

**仍然不做**：后台定时心跳、自动重新登录。绝对上限（约 239 分钟）无法续期，
重新登录需要凭据和 Duo，本项目从不接触这两样。
## Optional one-page workspace (0.12.0)

Mount only when `#ctl00_MainContent_classPlanPanel` is directly inside
`.classPlannerWrapper` in `form#aspnetForm`, with one direct section/title pair
for Calendar (`classPlanner_CalendarSection` / `plannerSectionCal`), Plan
(`classPlanner_ClassesInPlanSection` / `plannerSectionClip`) and Search
(`classPlanner_ClassSearchSection` / `classSearchTitle`). Move the whole native
sections with restoration anchors, preserving the form and descendants.
Native-containing containers must not carry `data-planner-lift-owned`.

The Details view requires the recorded three-row course-card/nine-column
section-table shape. Its native third row stays inside its original tbody; CSS
positions it over an owned, read-only heading. Never clone controls or rewrite
native handlers. All move-button contracts continue to apply. Escape closes and
restores focus. Partial panel replacement drops old anchors and remounts without
reinserting stale native nodes. No additional query, polling or submit is added.

Live coursetables contain a COLGROUP, a header TBODY and one TBODY per section;
each section has its normal row and a hidden controls row. Inspect the first
actual TR for its nine columns, never `tr:first-child` across all row groups.
If any card's details shape becomes unfamiliar, restore the stacked layout so
native information cannot be hidden behind a missing Details button.

Workspace search sizing (0.12.1): the native result row shape is
`.ClassSearchList .row-fluid.class-info.table-width2`, with `.span1` through
`.span9` cells. Only that known row class gets a readable minimum width.
Expand search is a local CSS mode on the existing deck, with no native node
cloning or submission. The original result controls and course disclosure stay
in their form. Other sections remain native inside the top disclosure, with
owned scroll shortcuts; Original layout restores all six section placements.

Details dismissal (0.12.2): an owned backdrop provides an outside-click target.
A capture listener consumes clicks outside both the owned heading and the
original third row before they can invoke native page actions. Clicks inside
the original row are untouched. Escape and the accessible × button also close;
focus returns without scrolling. Restore removes the listener and backdrop.

## Local pane folding and native navigation (0.13.0)

Local folding requires a known section with an identified direct title and one
direct DIV body (exactly two element children). Unfamiliar primary shapes keep
the native stacked layout; unfamiliar secondary shapes keep their native
controls. Never invoke a native postback merely to open or close a pane.

An owned chevron controls presentation classes on the original section/body.
Capture only clicks on a direct `button.planSectionToggle` in that title, to
avoid applying both the native and local toggles. Keep the button attributes and
handler unchanged. Do not intercept other title actions or body controls.
The original body's inline style/hidden attribute stays unchanged; workspace
CSS reveals or folds only that validated body. Restore removes classes,
controls and listeners. Pane choices survive redraws in memory only.

Primary panes have persistent named buttons outside the deck; closed panes take
no column space. Secondary shortcuts unfold before scrolling/focusing. An
in-flow owned position marker reserves the original space above the wrapper;
the term chooser, plan menus and all external navigation keep their native
placements. Insufficient vertical room selects a flow fallback. Other sections
is positioned below its summary using geometric measurements.

Native section statuses are no longer folded or summarized. Existing compact
wrappers are unwrapped as migration cleanup; icons, text and node identity must
remain unchanged while tidy is enabled. No aggregate status badge is inserted.

## Resizable workspace and course browser (0.14.0)

This replaces the rigid columns, full-width search mode and modal details.
Primary order is Classes, Schedule, Browse. Owned dividers resize side columns
locally, via pointer or keyboard. Width clamps reserve schedule room; no stored
preference or native request is added. All original navigation placement and
folding contracts above still apply.

Dock details in the Browse pane. The original third row remains under its
original tbody; only its CSS coordinates change. Section-card formatting requires
an exact nine-TH header: Change, Section, Status, Info, Days, Time, Location, Units,
Instructor. Mark only nine-TD data rows with unit colspans/rowspans; hidden action
rows remain untouched. Append owned labels after existing children, preserving
first-child controls and native status innerHTML. Never label or rewrite status
content. Close/Escape restores focus; other planner controls remain interactive.
On narrow windows move only the owned heading inline, never a native table.

Course previews require exactly one direct .ClassSearchList beneath the existing
.ClassSearchWidget in section.classPlanner_ClassSearchSection > #panelSearch.
Each direct .CourseListEntry must have CourseListEntry_M<digits>, a direct
.class-title > h3.head > a, and exactly one matching #container_course_M<digits>
either directly in the entry or as a direct sibling in .ClassSearchList.
Every recorded .row-fluid.class-info.table-width2 row must have exactly nine
.span1 through .span9 cells, with at least one header (Select then the eight labels above)
and at least one data_row. Incomplete/unknown sets remain native in their entirety.
Headers also accept the exact native Day(s), Time in Pacific Time and
Instructor(s) labels, normalizing whitespace only. Every header must match.
Native help buttons remain accessible in their original header cells. Body
selection handles the sibling and nested shapes independently of their headings.
Only headings are copied as read-only index button text; section cells and actions
remain in place. Selection never invokes a native course link or query. Retain
all controls, messages and action rows. Only the selected native result entry is
visible; Rooms & instructors changes local cell visibility. Edit search reveals
the original fields. Added/replaced rows, cells, entries or headings reconcile;
restoration removes owned labels/classes/index and preserves native hidden states.

## Native BODY scrolling (0.14.2)

The live native layout can constrain BODY while content outside the fixed planner
extends below it. Native postbacks or focus can scroll BODY even when its overflow
is hidden; window.scrollY and document.scrollingElement.scrollTop can both remain
zero. This makes the workspace's position marker negative and hides navigation.
Desktop workspace CSS uses overflow:clip on BODY so it is not a scroll container.
Pane scrolling stays local. Narrow/flow layouts retain overflow:auto. Do not
move or clone UCLA navigation to compensate for this scroll behavior.

Authorized live v0.14.2 verification after reload confirmed overflow:clip and
BODY scrollTop zero through native subject/course selection, search and section
expansion. The original header and term chooser stay on screen and the workspace
position marker stays stable. Only structural measurements were retained.

## Compact introduction and intentional document scrolling (0.14.3)

This supersedes the desktop overflow:clip rule above. The user explicitly wants
UCLA's unchanged banner to scroll away. HTML is the document scroll container;
BODY has visible overflow and cannot scroll independently. A passive root-scroll
listener reads the marker's viewport position (without adding window.scrollY),
updates workspace/Details bounds, and reserves a stable full-height owned spacer.
Narrow and short-window flow fallbacks retain normal document flow. Remove the
spacer/listener/CSS state on restoration. Never style or move UCLA's masthead/menu.

Compact only the exact section#layoutContentArea containing direct h2#titleText
with public text Class Planner, #div_page_title_section2 > div#page_title_text,
and layout-columnwrapper.col-2MR > main-content#main-content + right-sidebar.
The term container must be main-content's direct #ctl00_MainContent_termSessionChooser
with div.term_display + div.term and exactly one native select with the recorded
term chooser ID, directly under div.term and associated with form#aspnetForm.
Unknown shapes leave the introduction native.

The native term container, selector and sidebar keep their parents/handlers.
An owned Term label identifies the existing selector. Only the duplicate static
term display is visually hidden. Native introductory text/links are wrapped in
an unowned details container with an owned summary. Preserve native replacement
children when unwrapping; never resurrect disconnected text. Static, control-free
direct notice DIVs get compact spacing and remain visible; #AlertDiv is untouched.
Links & help toggles a CSS class on the original sidebar; no widget content is
read or copied. Its close control/Escape returns focus. Containers with native
descendants must not be marked extension-owned. Restoration removes only owned
controls/classes and restores the original text placement and sidebar styles.

## Explicit header compaction (0.14.4)

The owned Compact header / Show header button mounts only with the validated
introduction. Its type is button, never submit. An explicit click scrolls the
root document until the existing title is 12px from the viewport top, retaining
the native term chooser and notices. Show header returns to scrollTop zero.
The button follows manual root scrolling and retains focus without scrolling.
It does not inspect, style, hide, move or clone UCLA masthead/menu nodes, invoke
native handlers, submit a form, store state or introduce requests. Original
layout and Tidy restoration remove the owned control.

## Persistent compaction (0.14.5)

The explicit choice is a single local boolean, `plannerLift.header.v1.compact`.
The controller reads it before mounting. Intro remounts retain the choice;
root-scroll, load/pageshow, resize and visibility/focus events reapply the
minimum document scroll position while compact. There are no network queries.
Scrolling deeper is unaffected. Show header releases the minimum and saves false.
Since 0.19.4, focus inside the original `layout-headerwrap` reveals the header
temporarily without saving false. Only ancestry/bounds and native visibility
attributes are inspected, never menu text. Preference writes are ordered, and failures
are reported in the control tooltip. Remove all listeners on restoration.
Native masthead/menu/term nodes, styles, handlers and forms remain unchanged.

In 0.19.4 an owned top-edge button mounts only for one recognized native
`layout-headerwrap`. Hover, click and native-menu focus smoothly reveal the
header; reduced-motion users receive an instant change. Leave uses a bounded
280ms grace period and respects native focus/expanded menus and held gestures.
Escape or an outside click returns to compact view. Outside dismissal waits
until the native target's click handler runs so it cannot move that target
between pointerdown and pointerup.
Escape suppresses layout-generated hover reentry until the pointer deliberately
leaves the edge; explicit click and keyboard access remain available immediately.
Native header web components are inspected through bounded open shadow roots
for presentation state only. No text or field values are read; discovered root
observers are disconnected on restoration.
A scrollend handler plus one 800ms fallback suppress compact reapplication
during the transition. Original layout removes the sensor, root state classes,
observers, listeners and timers. Screen-only CSS hides only the root scrollbar;
the document and panel scroll areas remain usable, and print stays native.
Workspace geometry writes pause during print. Native print events and print
media changes schedule one screen relayout afterward; restoration cancels that
frame and removes listeners without changing layout preferences.

Dark calendar hour rows precede transparent full-height `.timebox` columns.
Preserve that layering: an opaque day column hides native hourly rules. Only
grid surface/line colors change; event geometry, fills and native grid-size
controls remain authoritative. Notice links retain native transparent inline
presentation, with readable theme colors and unchanged native handlers.

Bootstrap presentation only on the exact origin/path, including empty/future
quarters. The validated introduction may mount its owned toolbar in normal flow
without a course table. Its root-scroll CSS keeps BODY non-scrollable and gives
the introduction enough flow height to scroll the original masthead away. All
future-plan content stays native. This does not relax inspectContract or mount
course controls when it fails. Observe the existing BODY for native replacement;
initialize course tools only after the original adapter contract passes, then
restore presentation-only mode if a later quarter has no editable table.

## Browser presentation and lifecycle review (0.14.6)

Expand Browse is an owned button on the validated search title. It changes the
existing deck's CSS columns/visibility only. Restore panes, Escape and named pane
buttons restore access; no native section handler is invoked. The original-layout
return button is reattached only inside the known wrapper/form after redraw.

An unnamed owned search input filters only the already-copied public result
headings. Enter is prevented from submitting the native form. Arrow keys and
Home/End select visible owned index buttons; aria-controls points to the existing
native course body. An owned preview heading repeats that course label. Retain
local filter/disclosure/scroll/focus only when root, entry, body and heading
identities and heading text still match; new results reset these local choices.
Restore removes all owned nodes and preserves the native class-attribute state.
Print reveals all loaded bodies and optional room/instructor cells without
viewport clipping. No native query input is read and no extra request is sent.

Controller startup/redraw/save continuations are generation- and disposal-guarded.
Every term/plan transition clears obsolete in-memory course state and reloads
the existing keyed notes/view/draft records. Ignore stale asynchronous results;
preserve prior-context persisted drafts. Recheck the strict native contract and
active context before any local move/tag/save. Invalid/future contexts remove
obsolete course/save UI and allow only independently validated introduction
presentation. The native adapter and permissions remain unchanged.

## Interaction follow-up (0.14.7)

Expand Browse closes the owned inspector before hiding Classes, since native
details must stay inside their course row. Single-course results omit only the
owned duplicate index/filter/count. Original notices remain visible with reduced
spacing. Preserve both list and preview scroll on a same-result row redraw.

Read only checked booleans on checkbox/radio inputs in validated data rows'
first selection cell. When another preview hides those selections, an owned
disclosure shows a count and per-course review buttons. Review clears only the
owned filter, shows that native course body and focuses its checked input; it
never changes selection state, reads input values or invokes a native action.
The reminder is removed on restoration and omitted from print, which already
shows every course. Additional interactive controls in a .class-title make the
result shape unknown; restore the native layout so those controls remain usable.

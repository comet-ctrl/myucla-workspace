import type { CourseSnapshot } from "../adapters/planner-adapter";
import { CourseBrowserPresentation } from "./course-browser";
import { SectionCards } from "./section-cards";
import { PlannerIntroduction } from "./planner-introduction";
import { formatSectionStatus } from "./section-status";
import { saveLayoutSettings } from "../storage/settings";
import { PanelLayoutController, type PanelPlacement, type PanelDock, type PanelBox, type PanelDockTarget, type PanelDropOperation, type PanelDropTarget, type PanelLayoutChangeReason } from "./panel-layout";
import { normalizeWorkspaceLayout, type WorkspaceLayoutPreference, type WorkspaceModule } from "../storage/workspace-layout";
import {createDefaultGroups,normalizeWorkspaceGroups,migrateLegacyGroups,selectWorkspaceTab,closeWorkspaceTab,mergeWorkspaceTab,floatWorkspaceTab,splitWorkspaceTab,openGroupTabs,activeGroupTab,readableGroupWidths,minimumGroupWidth,isWorkspacePanelId,WORKSPACE_DOCKS,WORKSPACE_PANEL_IDS,type WorkspaceGroups,type WorkspacePanelId} from "./workspace-groups";
import { WORKSPACE_PRESETS, applyWorkspacePreset, type WorkspacePresetId } from "./workspace-presets";
import { WorkspaceSettings } from "./workspace-settings";

const OWNED = "data-planner-lift-owned";
const PANEL = "ctl00_MainContent_classPlanPanel";
const PRIMARY = [
  ["classPlanner_ClassesInPlanSection", "plannerSectionClip", "pl-workspace-plan", "My classes"],
  ["classPlanner_CalendarSection", "plannerSectionCal", "pl-workspace-calendar", "Schedule"],
  ["classPlanner_ClassSearchSection", "classSearchTitle", "pl-workspace-search", "Find classes"]
] as const;
const SECONDARY = [
  ["classPlanner_ClassOptimizerSection", "Plan Optimizer"],
  ["classPlanner_EnrolledNotInPlanSection", "Study list outside this plan"],
  ["classPlanner_PersonalTimeBlocksSection", "Personal Entries"]
] as const;
function hasUnknownSection(panel:HTMLElement):boolean {
  const known=[...PRIMARY.map(([name])=>name),...SECONDARY.map(([name])=>name)];
  return [...panel.children].some(node=>node.tagName==="SECTION"&&!known.some(name=>node.classList.contains(name)));
}
/** Separate read-only contract for the native New plan result. This never
 * makes an empty plan eligible for the adapter's editable/reorder contract. */
export function isKnownEmptyPlanner(doc:Document):boolean {
  const location=doc.defaultView?.location;
  if(!location||location.origin!=="https://be.my.ucla.edu"||location.pathname!=="/ClassPlanner/ClassPlan.aspx")return false;
  const form=doc.getElementById("aspnetForm"),panel=doc.getElementById(PANEL),body=doc.getElementById("panelPlan");
  if(["aspnetForm",PANEL,"panelPlan"].some(id=>doc.querySelectorAll(`#${id}`).length!==1))return false;
  if(!(form instanceof HTMLFormElement)||form.method.toLowerCase()!=="post"||!panel||!body||panel.closest("form")!==form)return false;
  try {const action=new URL(form.action,location.href);if(action.origin!==location.origin||action.pathname!==location.pathname)return false;}catch{return false;}
  const parent=panel.parentElement,host=parent?.matches(".pl-workspace-shell")?parent.parentElement:parent;
  // Study list may contain its own landing table and course rows. Only the
  // current plan's body must be empty; other modules remain opaque/native.
  if(!host?.classList.contains("classPlannerWrapper")||hasUnknownSection(panel)||body.querySelector("#div_landing, tbody.courseItem"))return false;
  const sections=[...panel.querySelectorAll<HTMLElement>(":scope > section, :scope > .pl-workspace-deck > section, :scope > .pl-workspace-deck > .pl-workspace-main > section")];
  const shapes=[
    [PRIMARY[0][0],PRIMARY[0][1],"panelPlan"],
    [PRIMARY[1][0],PRIMARY[1][1],"ctl00_MainContent_panelGrid"],
    [PRIMARY[2][0],PRIMARY[2][1],"panelSearch"],
    [SECONDARY[0][0],"classOptimizerTitle","panelOptimizer"],
    [SECONDARY[1][0],"plannerSectionEnip","panelNotplan"],
    [SECONDARY[2][0],"plannerSectionPer","panelPersonal"]
  ];
  if(sections.length!==shapes.length||shapes.some(([cls,titleId,bodyId],index)=>{
    const matches=sections.filter(section=>section.classList.contains(cls));if(matches.length!==1)return true;
    const children=[...matches[0].children].filter(node=>!node.hasAttribute(OWNED));
    const title=children[0],content=children[children.length-1];
    return title?.id!==titleId||!title.classList.contains("classPlanner_SectionTitle")||content?.id!==bodyId||content.tagName!=="DIV"||
      (index<3&&children.length!==2)||(index>=3&&children.length<2);
  }))return false;
  const children=[...body.children];
  if(children.length!==2||!children[0].matches("div.classPlanner_SectionData")||children[1].tagName!=="TABLE"||children[1].children.length||children[1].textContent?.trim())return false;
  const data=[...children[0].children];
  if(data.length!==3||!data[0].matches("div.no_data_text")||data[0].children.length||!data[0].textContent?.trim())return false;
  return ["ctl00_MainContent_planClassListView_clCommandField","ctl00_MainContent_planClassListView_clCommandFieldTracker"].every((id,index)=>{
    const input=data[index+1];return input instanceof HTMLInputElement&&input.id===id&&input.type==="hidden"&&input.form===form&&doc.querySelectorAll(`#${id}`).length===1;
  });
}
type Module = WorkspaceModule;
const MODULE_LABELS: Record<Module,string> = {classes:"My classes",find:"Find classes",optimizer:"Optimizer",study:"Study list",personal:"Personal entries",information:"Information & help"};
interface Placement { node: HTMLElement; anchor: Comment; menu?: boolean; }
interface PlanSurface {
  node: HTMLElement; close: HTMLButtonElement | null; hadStyle: boolean; visible: boolean;
}
interface ClassActions {
  button: HTMLButtonElement; nativeTools: Element | null; ownedTools: Element | null;
  key: (event: KeyboardEvent) => void;
}
interface OpenDetails {
  card: HTMLElement; table: HTMLTableElement; row: HTMLElement; destination: HTMLElement;
  preview: HTMLElement; close: HTMLButtonElement; spacer: HTMLElement; trigger: HTMLElement | null; jump: HTMLButtonElement;
  cards: SectionCards; hadStyle: boolean; observer: ResizeObserver | null;
  wheel: (event: WheelEvent) => void; focus: (event: FocusEvent) => void;
  pointer: () => void;
  key: (event: KeyboardEvent) => void;
  touchStart: (event: TouchEvent) => void; touchMove: (event: TouchEvent) => void; touchEnd: () => void;
}
interface PendingModuleOpen {
  pane: Pane; button: HTMLButtonElement; status: HTMLElement;
  target: HTMLElement; navigation: HTMLButtonElement; observer: MutationObserver;
}
const OPTIMIZER_TOGGLE = "ctl00_MainContent_toggleOptimizer";
const OPTIMIZER_OPEN = "shrink('panelOptimizer'); __doPostBack('ctl00$MainContent$toggleOptimizer','')";
const SECONDARY_DISCLOSURES = {
  study: {toggle:"ctl00_MainContent_toggleNotplan",title:"plannerSectionEnip",body:"panelNotplan",label:"In Study List but Not In Current Plan",help:"button#slneTip.uit-clickover-bottom.planSectionHelpTip.link",count:3},
  personal: {toggle:"ctl00_MainContent_togglePersonal",title:"plannerSectionPer",body:"panelPersonal",label:"Personal Entries",help:"button#ctl00_MainContent_helpPersonal.uit-clickover-bottom.planSectionHelpTip.link",count:2}
} as const;
const PRIMARY_DISCLOSURES = {
  plannerSectionClip:{toggle:"ctl00_MainContent_togglePlan",body:"panelPlan",target:"panelPlan",label:"Class Plan",children:1},
  plannerSectionCal:{toggle:"ctl00_MainContent_toggleGrid",body:"ctl00_MainContent_panelGrid",target:"gridDiv",label:"Weekly Schedule",children:1},
  classSearchTitle:{toggle:"ctl00_MainContent_toggleSearch",body:"panelSearch",target:"panelSearch",label:"Search for Class and Add to Plan",children:3}
} as const;
interface Pane {
  section: HTMLElement; title: HTMLElement; body: HTMLElement; label: string;
  toggle: HTMLButtonElement | null; reopen: HTMLButtonElement | null; collapsed: boolean; module: Module | null; opaque: boolean;
  bodyHadClass: boolean; titleHadStyle: boolean; sectionHadStyle: boolean; click: (event: MouseEvent) => void;
}
interface Workspace {
  doc: Document; host: HTMLElement; panel: HTMLElement; deck: HTMLElement;
  top: HTMLElement; extras: HTMLDetailsElement; menu: HTMLElement | null; placements: Placement[];
  preview: HTMLElement; head: HTMLElement; content: HTMLElement; close: HTMLButtonElement;
  panes: Pane[]; splitters: HTMLElement[]; empty: HTMLElement; widenSchedule: HTMLButtonElement;
  shell: HTMLElement; main: HTMLElement; navMain: HTMLElement; navFooter: HTMLElement; slot: HTMLElement;
  moduleButtons: Map<Module,HTMLButtonElement>; mobileMain: HTMLButtonElement; mobileSchedule: HTMLButtonElement;
  scheduleNav: HTMLButtonElement;
  position: HTMLElement; scrollRoom: HTMLElement; hostHadStyle: boolean;
  resize: () => void; key: (event: KeyboardEvent) => void;
  detailsScroll: () => void;
  calendarScroll: () => void;
  layout: PanelLayoutController; detailsFrame: HTMLElement; detailIndex: HTMLElement; navigation: HTMLElement;
  navToggle: HTMLButtonElement; navDivider: HTMLElement; navEnd: (event?: Event) => void; navMove: (event: PointerEvent) => void;
  groupStrips: Map<PanelDock,HTMLElement>; groupTabs: Map<WorkspacePanelId,{wrap:HTMLElement;button:HTMLButtonElement;close:HTMLButtonElement}>;
  move: (event: PointerEvent) => void; end: (event?: Event) => void;
  beforePrint: () => void; afterPrint: () => void; printing: () => boolean; stopPrint: () => void;
  actionObserver: MutationObserver; actionClick: (event: MouseEvent) => void;
  helpObserver: MutationObserver;
}
function officialText(node: Element): string {
  if (node.matches("[hidden],.hidden") || (node as HTMLElement).style?.display === "none") return "";
  const copy = node.cloneNode(true) as Element;
  copy.querySelectorAll(`[${OWNED}],script,input,textarea,[hidden],.hidden`).forEach(n => n.remove());
  copy.querySelectorAll<HTMLElement>("[style]").forEach(n => { if (n.style.display === "none") n.remove(); });
  copy.querySelectorAll("br").forEach(n => n.replaceWith(copy.ownerDocument.createTextNode(" ")));
  return (copy.textContent || "").replace(/\s+/g, " ").trim().slice(0, 500);
}
function hasKnownDetails(card: HTMLElement): boolean {
  const rows = [...card.children];
  const tables = card.querySelectorAll(":scope > tr:nth-child(3) table.coursetable");
  const header = tables[0]?.querySelector("tr");
  return rows.length === 3 && rows.every(row => row.tagName === "TR") && tables.length === 1 && header?.children.length === 9;
}
function sectionSummary(table: HTMLTableElement): string[][] {
  return [...table.rows].filter(row=>row.cells.length===9&&[...row.cells].every(cell=>cell.tagName==="TD"&&cell.colSpan===1&&cell.rowSpan===1)&&row.style.display!=="none"&&!row.hidden&&!row.classList.contains("hidden"))
    .map(row=>[1,4,5,2].map(index=>officialText(row.cells[index])));
}

/** A resizable presentation of the existing planner. Native forms stay intact. */
export class PlannerWorkspace {
  private state: Workspace | null = null;
  private selected: HTMLElement | null = null;
  private openDetails = new Map<HTMLElement,OpenDetails>();
  private positioningDetails = false;
  private actionControls = new Map<HTMLElement, ClassActions>();
  private actionsHost: HTMLElement | null = null;
  private pendingModuleOpen: PendingModuleOpen | null = null;
  private forwardingPrimary: HTMLButtonElement | null = null;
  private planSurfaces = new Map<HTMLElement,PlanSurface>();
  private activePlanSurface: HTMLElement | null = null;
  private pendingPlanAction: string | null = null;
  private planSurfaceTrigger = new Map<HTMLElement,string>();
  private useOriginal = false;
  private returnButton: HTMLButtonElement | null = null;
  private latestCourses: readonly CourseSnapshot[] = [];
  private paneChoices = new Map<string, boolean>();
  private scheduleWidth: number | null = null;
  private scheduleExpanded = false;
  private module: Module = "classes";
  private previousModule: Module = "classes";
  private showSchedule = false;
  private mainModule: Module = "classes";
  private navigationCollapsed = false;
  private updatingLayout = false;
  private savedLayout: WorkspaceLayoutPreference | null = null;
  private saveQueued = false;
  private dragPresentation = "";
  private groups:WorkspaceGroups=createDefaultGroups();
  private settings: WorkspaceSettings | null = null;
  private layoutPreset: WorkspacePresetId | null = null;
  private gestureChoices: {module:Module;mainModule:Module;showSchedule:boolean;choices:Map<string,boolean>;collapsed:Map<Pane,boolean>;groups:WorkspaceGroups} | null = null;
  private dockSizes: Partial<Record<"left"|"right",number>> = {};
  private dockDrag: {edge:"left"|"right";id:number;x:number;size:number;splitTotal?:number}|null = null;
  private planHeaderHeight = 60;
  private headerHelp=new Map<HTMLElement,{hadStyle:boolean;hadClass:boolean;properties:{name:string;value:string;priority:string}[]}>();
  private summaries = new Map<HTMLElement,{node:HTMLElement;table:HTMLTableElement;signature:string}>();
  private courseTargets = new Map<HTMLElement,()=>void>();
  private drag: {start:number; width:number; pointerId:number} | null = null;
  private browser = new CourseBrowserPresentation();
  private introduction: PlannerIntroduction;
  private introductionOnly: {doc: Document; toolbar: HTMLElement; resize: () => void; key: (event: KeyboardEvent) => void} | null = null;

  constructor(onHeaderChange: (compact: boolean) => void | Promise<void> = () => {},
    private readonly onLayoutChange: (layout: WorkspaceLayoutPreference) => void | Promise<void> = () => {}) {
    this.introduction = new PlannerIntroduction(onHeaderChange);
  }

  /** Called once before mounting; restoration never activates a native control. */
  setSavedLayout(value: WorkspaceLayoutPreference | null): void {
    if (this.state) return;
    this.savedLayout = normalizeWorkspaceLayout(value);
    if (!this.savedLayout) return;
    const saved = this.savedLayout;
    this.groups=normalizeWorkspaceGroups(saved.groups)||migrateLegacyGroups(saved);
    this.layoutPreset = saved.layoutPreset;
    this.module = saved.module; this.mainModule = saved.mainModule;
    this.navigationCollapsed = saved.navigationCollapsed;
    this.scheduleWidth = saved.scheduleWidth; this.scheduleExpanded = saved.scheduleExpanded;
    this.dockSizes = {...saved.dockSizes};
    this.paneChoices = new Map(saved.collapsedPanes.map(id => [id, true]));
  }

  private rememberLayout(): void {
    const s = this.state;
    if (!s || this.updatingLayout || s.layout.isInteracting()) return;
    const panels = s.layout.snapshot().panels;
    for (const saved of this.savedLayout?.panels || []) if (!panels.some(panel => panel.id === saved.id)) panels.push(saved);
    const preference = normalizeWorkspaceLayout({
      version: 2, panels, groups:this.groups, layoutPreset:this.layoutPreset, module: this.module, mainModule: this.mainModule,
      navigationCollapsed: this.navigationCollapsed, scheduleWidth: this.scheduleWidth,
      scheduleExpanded: this.scheduleExpanded, dockSizes: this.dockSizes,
      collapsedPanes: [...this.paneChoices].filter(([,collapsed]) => collapsed).map(([id]) => id)
    });
    if (!preference || JSON.stringify(preference) === JSON.stringify(this.savedLayout)) return;
    this.savedLayout = preference;
    if (this.saveQueued) return;
    this.saveQueued = true;
    // Coalesce one interaction's reveal/dock/module callbacks, without a timer
    // that could lose the user's last drop when they immediately leave the page.
    queueMicrotask(() => {
      this.saveQueued = false;
      if (this.savedLayout) void Promise.resolve(this.onLayoutChange(this.savedLayout)).catch(() => {});
    });
  }

  private resetLayoutChoices(): void {
    this.savedLayout = null;
    this.groups=createDefaultGroups();
    this.layoutPreset=null;
    this.gestureChoices = null;
    this.module = this.mainModule = this.previousModule = "classes";
    this.navigationCollapsed = this.showSchedule = this.scheduleExpanded = false;
    this.scheduleWidth = null; this.dockSizes = {}; this.paneChoices.clear(); this.dragPresentation = "";
    for (const pane of this.state?.panes || []) if (!pane.opaque) {
      pane.collapsed = this.primaryTarget(pane.title, pane.body)?.classList.contains("hidden") === true;
    }
  }

  private captureGestureChoices(): void {
    if (!this.state?.layout.isInteracting() || this.gestureChoices) return;
    this.gestureChoices = {module:this.module,mainModule:this.mainModule,showSchedule:this.showSchedule,
      choices:new Map(this.paneChoices),collapsed:new Map(this.state.panes.map(pane=>[pane,pane.collapsed])),groups:normalizeWorkspaceGroups(this.groups)!};
  }

  private activePreset(state = this.groups) {
    const preset = WORKSPACE_PRESETS.find(item => item.id === this.layoutPreset);
    if (!preset) return null;
    const browsing = preset.id === "single" ? "main" : preset.id === "schedule-left" ? "right" : "left";
    const schedule = preset.id === "single" ? "main" : preset.id === "schedule-left" ? "left" : "right";
    // A stale preference must not override a user-created grouping.
    return WORKSPACE_PANEL_IDS.every(id => state.panels[id].placement === (id === "schedule" ? schedule : browsing)) ? preset : null;
  }

  private applyLayoutPreset(id: WorkspacePresetId): void {
    const s = this.state;
    if (!s) return;
    s.layout.cancelActiveDrag(); s.navEnd(); s.end();
    const preferred = this.showSchedule ? "schedule" : this.module === "information" ? this.previousModule : this.module;
    const result = applyWorkspacePreset(this.groups, id, isWorkspacePanelId(preferred) ? preferred : undefined);
    if (!result) return;
    this.groups = result.state; this.layoutPreset = id;
    this.scheduleExpanded = false; this.scheduleWidth = null; this.dockSizes = {};
    this.showSchedule = result.active === "schedule";
    if (result.active !== "schedule") this.module = this.mainModule = this.previousModule = result.active;
    else if (this.module === "information") this.module = this.mainModule;
    this.updatingLayout = true;
    try {
      this.syncGroupsToPanels();
      // Return any floating details to their original course presentation.
      // Docking never expands a native body or changes its controls/selections.
      s.layout.dockPanel("details", "main", false);
    } finally { this.updatingLayout = false; }
    this.updatePanes(); this.rememberLayout();
  }

  /** Manual sizing starts at the visible preset widths, without a jump. */
  private releasePresetSizing(): void {
    if (!this.layoutPreset || !this.state) return;
    const geometry = this.dockGeometry();
    this.layoutPreset = null;
    if (geometry.wide) {
      for (const dock of ["left", "right"] as const) if (geometry.boxes[dock].width) this.dockSizes[dock] = geometry.boxes[dock].width;
    }
  }

  private restoreGestureChoices(): void {
    const saved=this.gestureChoices;if(!saved)return;
    this.module=saved.module;this.mainModule=saved.mainModule;this.showSchedule=saved.showSchedule;this.paneChoices=saved.choices;
    this.groups=saved.groups;
    for(const [pane,collapsed] of saved.collapsed)pane.collapsed=collapsed;
    this.gestureChoices=null;
  }

  setHeaderCompact(compact: boolean): void {
    this.introduction.setHeaderCompact(compact); this.state?.resize(); this.introductionOnly?.resize();
  }

  needsReconcile(doc: Document): boolean {
    if (this.useOriginal) return !!this.returnButton && !this.returnButton.isConnected;
    if (this.introductionOnly) return !this.introductionOnly.toolbar.isConnected || this.introduction.needsRefresh(doc);
    const s = this.state;
    return !!s && (doc.getElementById(PANEL) !== s.panel || !s.deck.isConnected || this.currentPlanMenu(s)!==s.menu || hasUnknownSection(s.panel) || (!this.latestCourses.length&&!isKnownEmptyPlanner(doc)) ||
      s.panes.some(p => !p.section.isConnected || p.body.parentElement !== p.section || p.title.parentElement !== p.section) ||
      [...this.openDetails.values()].some(detail=>!detail.card.isConnected||detail.card.querySelector("table.coursetable")!==detail.table||detail.cards.needsRefresh()) ||
      this.latestCourses.some(c => {
        const host=c.node.querySelector<HTMLElement>(":scope > tr:first-child > td.linkPanelRight"),actions=host&&this.actionControls.get(host);
        return !hasKnownDetails(c.node)||!host||!actions||actions.button.parentElement!==host||
          actions.nativeTools!==host.querySelector(".OrderingButtons")||actions.ownedTools!==host.querySelector(":scope > [data-pl-real-tools]")||
          this.summaryChanged(c.node);
      }) || this.browser.needsReconcile(doc) || this.introduction.needsRefresh(doc));
  }

  reconcile(doc: Document, courses: readonly CourseSnapshot[]): void {
    if (this.introductionOnly) this.restore();
    // A partial postback may arrive while a pointer is down. Cancel every
    // presentation gesture before capturing module choices and geometry, even
    // when the native update leaves the workspace shell mounted.
    this.state?.layout.cancelActiveDrag(); this.state?.navEnd(); this.state?.end();
    this.restoreGestureChoices();
    // This snapshot exists only through this reconciliation. The controller
    // explicitly restores the workspace before a term/plan context change.
    const expanded=[...this.openDetails.values()].map(detail=>({id:this.latestCourses.find(course=>course.node===detail.card)?.id,examOpen:detail.preview.querySelector("details")?.open||false}));
    const selectedDetail=this.latestCourses.find(course=>course.node===this.selected)?.id;
    const focusedDetail=this.latestCourses.find(course=>this.openDetails.get(course.node)?.jump===doc.activeElement)?.id;
    const detailScroll=this.state?.slot.scrollTop||0,activeModule=this.module,mainModule=this.mainModule;
    const layoutSnapshot=this.state?.layout.snapshot()||this.savedLayout,navigationCollapsed=this.navigationCollapsed;
    const active=doc.activeElement;
    const nativeFocus=active instanceof HTMLElement&&active.matches("input,select,textarea,button,a,[tabindex]")&&!active.closest(`[${OWNED}]`)&&courses.some(course=>course.node.contains(active))?active:null;
    this.latestCourses = courses;
    if (this.useOriginal) { this.ensureReturnButton(doc); return; }
    if(!courses.length&&!isKnownEmptyPlanner(doc)){this.restore();return;}
    const currentRoot=doc.querySelector(`#${PANEL} #panelPlan #div_landing > table`);
    if(courses.some(course=>!doc.contains(course.node)||course.node.parentElement!==currentRoot)){this.restore();return;}
    const panel=doc.getElementById(PANEL);
    // An unfamiliar module has no reliable navigation destination. Keep the
    // complete native layout accessible instead of trapping it outside the deck.
    if(panel&&hasUnknownSection(panel)){this.restore();return;}
    if (courses.some(course => !hasKnownDetails(course.node))) { this.restore(); return; }
    const old = this.state;
    const view = doc.defaultView;
    let redrawScroll: {left: number; top: number} | null = null;
    if (old && (doc.getElementById(PANEL) !== old.panel || !old.deck.isConnected || this.currentPlanMenu(old)!==old.menu || old.panes.some(p => !p.section.isConnected || p.body.parentElement !== p.section || p.title.parentElement !== p.section))) {
      // Removing the old flow spacer can briefly shrink the document enough for
      // the browser to clamp its scroll. Preserve it only for automatic remounts.
      if (view) redrawScroll = {left: view.scrollX, top: view.scrollY};
      this.restore();
    }
    for(const detail of this.openDetails.values())if(!courses.some(course=>course.node===detail.card)||detail.card.querySelector("table.coursetable")!==detail.table||detail.cards.needsRefresh())this.closeDetail(detail,false);
    if (!this.state && !this.useOriginal) this.mount(doc);
    if (!this.state) return;
    this.state.host.classList.toggle("pl-workspace-empty-plan",courses.length===0);
    const emptyMessage=courses.length?"Select a class to see its sections and details.":"No classes in this plan yet. Use Find classes to browse courses.";
    if(this.state.empty.textContent!==emptyMessage)this.state.empty.textContent=emptyMessage;
    if (this.introduction.needsRefresh(doc)) this.introduction.restore();
    this.introduction.mount(doc,this.state.top,this.state.resize,{navigation:this.state.navFooter,onInformation:()=>this.selectModule("information",true),onCloseInformation:()=>{this.selectModule(this.previousModule);doc.querySelector<HTMLButtonElement>(".pl-intro-info")?.focus({preventScroll:true});}});
    this.browser.reconcile(doc);
    for(const host of this.actionControls.keys())if(!courses.some(course=>course.node.contains(host)))this.removeActions(host);
    for(const [card,cleanup]of this.courseTargets)if(!courses.some(course=>course.node===card)){cleanup();this.courseTargets.delete(card);}
    for (const course of courses) {
      const host = course.node.querySelector<HTMLElement>(":scope > tr:first-child > td.linkPanelRight");
      if (!host) continue;
      let button=course.node.querySelector<HTMLElement>("[data-pl-workspace-details]");
      if(!button){
        this.courseTargets.get(course.node)?.();this.courseTargets.delete(course.node);
        button=course.node.querySelector<HTMLElement>(":scope > tr:first-child > td.SubjectAreaName_ClassName > p");
        if(!button)continue;
        const details=button, attributes=["role","tabindex","aria-label","aria-expanded","data-pl-workspace-details"].map(name=>[name,details.getAttribute(name)] as const);
        details.setAttribute("role","button");details.tabIndex=0;details.dataset.plWorkspaceDetails="true";
        details.setAttribute("aria-label",`Details for ${course.label}`);details.setAttribute("aria-expanded","false");
        const click=(event:MouseEvent)=>{
          const target=event.target instanceof Element?event.target:null;
          if(event.defaultPrevented||event.button!==0||!target||target.closest('button,a,input,select,textarea,summary,[contenteditable],.pl-grip,[data-pl-real-tools]')||target.closest('tr')!==course.node.firstElementChild)return;
          if(doc.getSelection()?.toString())return;
          this.openPreview(course,details);
        };
        const key=(event:KeyboardEvent)=>{if(event.target===details&&(event.key==="Enter"||event.key===" ")){event.preventDefault();this.openPreview(course,details);}};
        course.node.addEventListener("click",click);details.addEventListener("keydown",key);
        this.courseTargets.set(course.node,()=>{course.node.removeEventListener("click",click);details.removeEventListener("keydown",key);for(const [name,value]of attributes){if(value===null)details.removeAttribute(name);else details.setAttribute(name,value);}});
      }
      // Both owned entry points precede the unchanged native control groups.
      this.ensureActions(course,host,button);
      this.ensureSummary(course);
    }
    for(const [card,summary] of this.summaries)if(!courses.some(course=>course.node===card)){summary.node.remove();this.summaries.delete(card);}
    for(const saved of expanded){
      const course=courses.find(course=>course.id===saved.id);
      if(course&&!this.openDetails.has(course.node)){
        this.openPreview(course,course.node.querySelector<HTMLElement>("[data-pl-workspace-details]"),false);
        const disclosure=this.openDetails.get(course.node)?.preview.querySelector("details");if(disclosure)disclosure.open=saved.examOpen;
      }
    }
    if(expanded.length){
      const ordered=expanded.map(saved=>courses.find(course=>course.id===saved.id)).map(course=>course&&this.openDetails.get(course.node)).filter((detail):detail is OpenDetails=>!!detail);
      for(const detail of this.openDetails.values())if(!ordered.includes(detail))ordered.push(detail);
      this.openDetails=new Map(ordered.map(detail=>[detail.card,detail]));
      // Only extension placeholders move. Native course/section ancestry stays put.
      for(const detail of ordered)this.state.slot.append(detail.spacer);
    }
    const restoredSelection=courses.find(course=>course.id===selectedDetail);
    if(restoredSelection&&this.openDetails.has(restoredSelection.node))this.selected=restoredSelection.node;
    this.module=activeModule;this.mainModule=mainModule;this.navigationCollapsed=navigationCollapsed;
    if(layoutSnapshot&&old!==this.state){this.updatingLayout=true;try{this.state.layout.restoreSnapshot(layoutSnapshot);}finally{this.updatingLayout=false;}}
    this.syncGroupsToPanels();
    this.state.slot.scrollTop=detailScroll;
    this.state.resize();
    // Moving a newly rendered native section into the workspace can blur its
    // focused field. Restore only that exact still-connected native node.
    if(nativeFocus?.isConnected&&doc.activeElement!==nativeFocus)nativeFocus.focus({preventScroll:true});
    if(focusedDetail&&!this.state.detailIndex.hidden){
      const course=courses.find(course=>course.id===focusedDetail),jump=course&&this.openDetails.get(course.node)?.jump;
      if(jump?.isConnected&&doc.activeElement!==jump)jump.focus({preventScroll:true});
    }
    if (view && redrawScroll && (view.scrollX !== redrawScroll.left || view.scrollY !== redrawScroll.top)) {
      view.scrollTo({...redrawScroll, behavior: "instant"});
      // Height is restored now; saved compaction still supplies its minimum.
      this.state.resize();
    }
  }

  private ensureActions(course:CourseSnapshot,host:HTMLElement,details:HTMLElement):void {
    const previous=this.actionControls.get(host),nativeTools=host.querySelector(".OrderingButtons"),ownedTools=host.querySelector(":scope > [data-pl-real-tools]");
    const restoreFocus=this.actionsHost===host&&host.contains(host.ownerDocument.activeElement);
    if(previous&&(previous.button.parentElement!==host||previous.nativeTools!==nativeTools||previous.ownedTools!==ownedTools))this.removeActions(host);
    if(this.actionControls.has(host))return;
    const button=host.ownerDocument.createElement("button");button.type="button";button.className="pl-workspace-actions-button";
    button.setAttribute(OWNED,"true");button.dataset.plWorkspaceActions="true";button.textContent="Course tools";
    button.setAttribute("aria-label",`Course tools for ${course.label}`);button.setAttribute("aria-expanded","false");
    // Blurring a note can insert its saved badge above this button. Keep that
    // layout change after click dispatch, rather than between mouse down/up.
    button.addEventListener("mousedown",event=>{if(event.button===0)event.preventDefault();});
    button.addEventListener("click",()=>{
      if(this.actionsHost===host){this.closeActions();return;}
      this.introduction.closeInfo(false);this.closeActions(false);
      if(this.state)this.state.extras.open=false;
      this.actionsHost=host;host.classList.add("pl-course-actions-open");button.setAttribute("aria-expanded","true");button.focus({preventScroll:true});
      this.revealInPlan(host,button.getBoundingClientRect().top,host.getBoundingClientRect().bottom);
    });
    const key=(event:KeyboardEvent)=>{
      if(event.key!=="Escape"||event.defaultPrevented||this.actionsHost!==host)return;
      const target=event.target instanceof Element?event.target:null;
      const menu=target?.closest<HTMLDetailsElement>("details[data-pl-course-menu][open]");
      if(menu&&ownedTools?.contains(menu)){
        // Close the inner owned More disclosure before hiding its outer actions.
        menu.open=false;menu.querySelector<HTMLElement>("summary")?.focus({preventScroll:true});event.preventDefault();
      }
    };
    host.addEventListener("keydown",key,true);host.prepend(button);
    this.actionControls.set(host,{button,nativeTools,ownedTools,key});
    if(restoreFocus)button.focus({preventScroll:true});
  }

  private closeActions(focus=true):void {
    const host=this.actionsHost;if(!host)return;this.actionsHost=null;
    const actions=this.actionControls.get(host);
    host.querySelectorAll<HTMLDetailsElement>("[data-pl-real-tools] details[data-pl-course-menu][open]").forEach(menu=>{menu.open=false;});
    host.classList.remove("pl-course-actions-open");actions?.button.setAttribute("aria-expanded","false");
    if(focus&&actions?.button.isConnected)actions.button.focus({preventScroll:true});
  }

  private removeActions(host:HTMLElement):void {
    if(this.actionsHost===host)this.closeActions(false);
    const actions=this.actionControls.get(host);if(!actions)return;
    host.removeEventListener("keydown",actions.key,true);actions.button.remove();host.classList.remove("pl-course-actions-open");this.actionControls.delete(host);
  }

  /** Presentation can survive an empty/future quarter without enabling reorder. */
  reconcileIntroductionOnly(doc: Document): void {
    if (this.useOriginal) return;
    if (this.state || this.needsReconcile(doc)) this.restore();
    if (this.introductionOnly) { this.introductionOnly.resize(); return; }
    const title = doc.getElementById("titleText"), description = doc.getElementById("div_page_title_section2");
    if (!title || description?.parentElement !== title.parentElement) return;
    const toolbar = doc.createElement("div");
    toolbar.className = "pl-workspace-top pl-intro-toolbar"; toolbar.setAttribute(OWNED, "true");
    description.after(toolbar);
    const resize = () => { this.introduction.positionHeader(); this.introduction.positionInfo(); };
    if (!this.introduction.mount(doc, toolbar, resize)) { toolbar.remove(); return; }
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented && this.introduction.closeInfo()) event.preventDefault();
    };
    this.introductionOnly = {doc, toolbar, resize, key};
    doc.documentElement.classList.add("pl-intro-page");
    for (const event of ["resize", "scroll", "focus", "pageshow", "load"]) doc.defaultView?.addEventListener(event, resize);
    doc.addEventListener("visibilitychange", resize); doc.addEventListener("keydown", key); resize();
  }

  openCourse(course: CourseSnapshot, trigger?: HTMLElement): boolean {
    if (!this.state || !course.node.querySelector("[data-pl-workspace-details]")) return false;
    this.openPreview(course, trigger || null); return true;
  }

  private ensureReturnButton(doc: Document): void {
    const host=doc.getElementById(PANEL)?.parentElement;
    if(!host?.classList.contains("classPlannerWrapper")||!host.closest("form#aspnetForm"))return;
    if(this.returnButton?.parentElement===host)return;
    this.returnButton?.remove();
    const back=doc.createElement("button");back.type="button";back.className="pl-workspace-return";
    back.setAttribute(OWNED,"true");back.textContent="Open planner workspace";
    host.prepend(back);this.returnButton=back;
    back.addEventListener("click",()=>{
      this.useOriginal=false;back.remove();this.returnButton=null;this.reconcile(doc,this.latestCourses);
      void saveLayoutSettings({tidy:true}).catch(()=>{
        this.restore();this.useOriginal=true;this.ensureReturnButton(doc);
        if(this.returnButton)this.returnButton.textContent="Preference could not be saved. Open planner workspace";
      });
    });
  }

  private mount(doc: Document): void {
    const panel=doc.getElementById(PANEL),host=panel?.parentElement;
    if(!panel||!host?.classList.contains("classPlannerWrapper")||!host.closest("form#aspnetForm")||hasUnknownSection(panel))return;
    const primary=PRIMARY.map(([cls,title])=>[...panel.children].filter(node=>node.matches(`section.${cls}`)&&node.querySelector(`:scope > #${title}.classPlanner_SectionTitle`)));
    const known=(section:Element)=>section.children.length===2&&section.children[0].matches(".classPlanner_SectionTitle")&&section.children[1].tagName==="DIV";
    if(primary.some(matches=>matches.length!==1||!known(matches[0])))return;
    // A native collapsed section may need its original postback to populate it.
    // Recognize that state before our presentation can reveal its outer body.
    if(primary.some(([section])=>{
      const title=section.children[0] as HTMLElement,body=section.children[1] as HTMLElement,target=this.primaryTarget(title,body);
      return target?.classList.contains("hidden")&&!this.primaryExpansion(title,body);
    }))return;
    const secondary=SECONDARY.map(([cls])=>[...panel.children].filter(node=>node.matches(`section.${cls}`)));
    // Secondary bodies are opaque. Optimizer may include a help block before
    // a conditionally hidden panel; its native visibility must remain native.
    if(secondary.some(matches=>matches.length>1||matches.some(node=>!node.firstElementChild?.matches(".classPlanner_SectionTitle")||node.children.length<2)))return;
    const owned=<T extends HTMLElement>(node:T,cls:string):T=>{node.className=cls;node.setAttribute(OWNED,"true");return node;};
    const placements:Placement[]=[];
    const place=(node:HTMLElement,destination:HTMLElement,menu=false)=>{const anchor=doc.createComment("planner-lift-workspace-position");node.before(anchor);placements.push({node,anchor,menu});destination.append(node);};
    const top=doc.createElement("div");top.className="pl-workspace-top";panel.before(top);
    const shell=doc.createElement("div");shell.className="pl-workspace-shell";panel.before(shell);
    const navigation=owned(doc.createElement("nav"),"pl-workspace-nav");navigation.setAttribute("aria-label","Planner modules");shell.append(navigation);
    const navMain=owned(doc.createElement("div"),"pl-workspace-nav-main"),navFooter=owned(doc.createElement("div"),"pl-workspace-nav-footer");navigation.append(navMain,navFooter);
    const navToggle=owned(doc.createElement("button"),"pl-navigation-toggle");navToggle.type="button";navigation.prepend(navToggle);
    navToggle.addEventListener("click",()=>{this.navigationCollapsed=!this.navigationCollapsed;this.updatePanes();this.rememberLayout();});
    const navDivider=owned(doc.createElement("div"),"pl-navigation-divider");navDivider.tabIndex=0;navDivider.setAttribute("role","separator");navDivider.setAttribute("aria-label","Resize navigation");navDivider.setAttribute("aria-orientation","vertical");navigation.append(navDivider);
    let navDrag:{id:number;x:number;collapsed:boolean}|null=null;
    navDivider.addEventListener("pointerdown",event=>{if(event.button!==0)return;event.preventDefault();navDrag={id:event.pointerId,x:event.clientX,collapsed:this.navigationCollapsed};});
    const navMove=(event:PointerEvent)=>{if(!navDrag||event.pointerId!==navDrag.id)return;const delta=event.clientX-navDrag.x;if(Math.abs(delta)>24){this.navigationCollapsed=delta<0;this.updatePanes();}};
    const navEnd=(event?:Event)=>{if(!navDrag)return;if(event?.type!=="pointerup")this.navigationCollapsed=navDrag.collapsed;navDrag=null;this.updatePanes();if(event?.type==="pointerup")this.rememberLayout();};
    navDivider.addEventListener("keydown",event=>{if(["ArrowLeft","Home","ArrowRight","End","Enter"].includes(event.key)){event.preventDefault();this.navigationCollapsed=event.key==="Enter"?!this.navigationCollapsed:["ArrowLeft","Home"].includes(event.key);this.updatePanes();this.rememberLayout();}});
    doc.addEventListener("pointermove",navMove);doc.addEventListener("pointerup",navEnd);doc.addEventListener("pointercancel",navEnd);doc.defaultView?.addEventListener("blur",navEnd);
    const deck=doc.createElement("div");deck.className="pl-workspace-deck";panel.append(deck);
    const groupStrips=new Map<PanelDock,HTMLElement>(),groupTabs=new Map<WorkspacePanelId,{wrap:HTMLElement;button:HTMLButtonElement;close:HTMLButtonElement}>();
    for(const dock of WORKSPACE_DOCKS){const strip=owned(doc.createElement("div"),"pl-workspace-group-strip");strip.dataset.plGroup=dock;strip.setAttribute("role","tablist");strip.setAttribute("aria-label",`${dock} workspace tabs`);deck.append(strip);groupStrips.set(dock,strip);}
    const main=doc.createElement("div");main.className="pl-workspace-main";deck.append(main);
    const panes:Pane[]=[],moduleButtons=new Map<Module,HTMLButtonElement>();
    const add=(section:HTMLElement,label:string,module:Module|null,opaque=false):Pane=>{
      const title=section.children[0] as HTMLElement,body=section.lastElementChild as HTMLElement;
      const pane:Pane={section,title,body,label,module,opaque,toggle:null,reopen:null,collapsed:this.paneChoices.get(title.id)??false,bodyHadClass:body.hasAttribute("class"),titleHadStyle:title.hasAttribute("style"),sectionHadStyle:section.hasAttribute("style"),click:()=>{}};
      if(!opaque&&this.primaryTarget(title,body)?.classList.contains("hidden"))pane.collapsed=true;
      title.classList.add("pl-pane-title");
      if(!opaque){
        body.classList.add("pl-pane-body");
        const toggle=owned(doc.createElement("button"),"pl-pane-toggle");toggle.type="button";if(body.id)toggle.setAttribute("aria-controls",body.id);title.append(toggle);pane.toggle=toggle;
        toggle.addEventListener("click",()=>this.setPaneCollapsed(pane,!pane.collapsed,true));
        pane.click=event=>{
          const native=event.target instanceof Element?event.target.closest<HTMLButtonElement>("button.planSectionToggle"):null;
          if(native?.parentElement!==title)return;
          if(this.forwardingPrimary===native)return;
          const expansion=this.primaryExpansion(title,body);
          if(expansion?.button===native){
            if(this.pendingModuleOpen){event.preventDefault();event.stopImmediatePropagation();return;}
            pane.collapsed=false;this.paneChoices.set(title.id,false);this.beginPrimaryOpen(pane,expansion,false);this.updatePanes();this.rememberLayout();return;
          }
          event.preventDefault();event.stopImmediatePropagation();this.setPaneCollapsed(pane,!pane.collapsed,true);
        };
        title.addEventListener("click",pane.click,true);
      }
      panes.push(pane);return pane;
    };
    primary.forEach((matches,i)=>{
      const section=matches[0] as HTMLElement;section.classList.add(PRIMARY[i][2]);
      add(section,PRIMARY[i][3],i===0?"classes":i===2?"find":null);place(section,i===1?deck:main);
    });
    const widenSchedule=owned(doc.createElement("button"),"pl-workspace-schedule-widen");widenSchedule.type="button";
    if(panes[1].body.id)widenSchedule.setAttribute("aria-controls",panes[1].body.id);
    panes[1].toggle!.before(widenSchedule);
    widenSchedule.addEventListener("click",()=>{this.releasePresetSizing();this.scheduleExpanded=!this.scheduleExpanded;this.updatePanes();this.rememberLayout();});
    secondary.forEach((matches,i)=>{if(matches[0]){const section=matches[0] as HTMLElement;add(section,SECONDARY[i][1],(["optimizer","study","personal"] as Module[])[i],true);place(section,main);}});
    const detailsFrame=owned(doc.createElement("div"),"pl-workspace-details-frame");panes[0].section.append(detailsFrame);
    const detailsHandle=owned(doc.createElement("button"),"pl-panel-details-handle");detailsHandle.type="button";detailsHandle.textContent="Class details";detailsHandle.dataset.plPanelHandle="details";detailsFrame.append(detailsHandle);
    const detailsClose=owned(doc.createElement("button"),"pl-panel-close");detailsClose.type="button";detailsClose.textContent="×";detailsClose.dataset.plPanelClose="details";detailsClose.setAttribute("aria-label","Close class details panel");detailsClose.title="Close panel — reopen with a course's Details button";detailsClose.addEventListener("click",()=>this.state?.layout.hidePanel("details"));detailsFrame.append(detailsClose);
    const detailIndex=owned(doc.createElement("nav"),"pl-workspace-detail-index");detailIndex.setAttribute("aria-label","Open class details");detailIndex.hidden=true;detailsFrame.append(detailIndex);
    const slot=owned(doc.createElement("div"),"pl-workspace-details-slot");detailsFrame.append(slot);
    const empty=owned(doc.createElement("p"),"pl-workspace-empty");empty.textContent="Select a class to see its sections and details.";slot.append(empty);
    const infoPlaceholder=owned(doc.createElement("div"),"pl-workspace-information-placeholder");infoPlaceholder.textContent="Information & help";main.append(infoPlaceholder);
    const dockPlaceholder=owned(doc.createElement("div"),"pl-workspace-dock-placeholder");dockPlaceholder.textContent="Open a section from navigation, or drag a panel here to dock it.";main.append(dockPlaceholder);
    for(const module of ["classes","find","optimizer","study","personal"] as Module[]){
      const button=doc.createElement("button");button.type="button";button.dataset.plModule=module;button.textContent=MODULE_LABELS[module];
      const pane=panes.find(p=>p.module===module);button.disabled=!pane;if(pane){pane.reopen=button;if(pane.body.id)button.setAttribute("aria-controls",pane.body.id);}
      button.addEventListener("click",()=>this.selectModule(module,true,true));
      navMain.append(button);moduleButtons.set(module,button);
    }
    const scheduleNav=owned(doc.createElement("button"),"pl-schedule-launcher");scheduleNav.type="button";scheduleNav.textContent="Schedule";scheduleNav.dataset.plModule="schedule";scheduleNav.setAttribute("aria-controls",panes[1].body.id);navMain.append(scheduleNav);
    const revealSchedule=()=>{const state=this.state;if(!state)return;this.groups=selectWorkspaceTab(this.groups,"schedule");this.syncGroupsToPanels();this.showSchedule=true;this.setPaneCollapsed(panes[1],false);state.layout.bringToFront("schedule");this.updatePanes();this.rememberLayout();};
    scheduleNav.addEventListener("click",revealSchedule);
    navMain.addEventListener("keydown",event=>{
      if(event.altKey||!["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
      const choices=[...moduleButtons.values(),scheduleNav].filter(button=>!button.disabled),index=choices.indexOf(event.target as HTMLButtonElement);if(index<0)return;
      const next=event.key==="Home"?0:event.key==="End"?choices.length-1:(index+(["ArrowUp","ArrowLeft"].includes(event.key)?-1:1)+choices.length)%choices.length;
      event.preventDefault();choices[next].click();choices[next].focus({preventScroll:true});
    });
    const layoutSettings=owned(doc.createElement("details"),"pl-workspace-layout-settings");
    const layoutSummary=doc.createElement("summary");layoutSummary.textContent="Layout settings";layoutSummary.title="Layout settings";layoutSummary.setAttribute("aria-label","Layout settings");layoutSettings.append(layoutSummary);navFooter.append(layoutSettings);
    const layoutOptions=doc.createElement("div");layoutOptions.className="pl-workspace-layout-options";if(typeof layoutOptions.showPopover==="function")layoutOptions.setAttribute("popover","auto");layoutSettings.append(layoutOptions);
    layoutOptions.addEventListener("toggle",event=>{if((event as ToggleEvent).newState==="closed")layoutSettings.open=false;});
    layoutSettings.addEventListener("toggle",()=>{if(!layoutSettings.open){if(layoutOptions.matches(":popover-open"))layoutOptions.hidePopover();return;}const rect=layoutSummary.getBoundingClientRect(),width=Math.min(180,doc.documentElement.clientWidth-16);layoutOptions.style.width=`${width}px`;layoutOptions.style.left=`${Math.max(8,Math.min(rect.left,doc.documentElement.clientWidth-width-8))}px`;layoutOptions.style.top=`${Math.max(8,Math.min(rect.bottom+4,(doc.defaultView?.innerHeight??600)-110))}px`;if(layoutOptions.hasAttribute("popover"))layoutOptions.showPopover();});
    layoutSettings.addEventListener("keydown",event=>{if(event.key==="Escape"&&layoutSettings.open){event.preventDefault();event.stopPropagation();layoutSettings.open=false;layoutSummary.focus({preventScroll:true});}});
    const defaultLayout=owned(doc.createElement("button"),"pl-workspace-default");defaultLayout.type="button";defaultLayout.textContent="Default layout";defaultLayout.title="Reset panel positions, sizes and navigation; your classes stay unchanged.";layoutOptions.append(defaultLayout);
    defaultLayout.addEventListener("click",()=>{this.state?.layout.reset();defaultLayout.focus({preventScroll:true});});
    const original=owned(doc.createElement("button"),"pl-workspace-original");original.type="button";original.textContent="Original layout";layoutOptions.append(original);
    original.addEventListener("click",()=>{
      this.restore();this.useOriginal=true;this.ensureReturnButton(doc);
      void saveLayoutSettings({tidy:false}).catch(()=>{
        if(this.returnButton)this.returnButton.textContent="Layout restored; preference could not be saved. Open planner workspace";
      });
    });
    const tabs=owned(doc.createElement("div"),"pl-workspace-mobile-tabs");top.append(tabs);
    const mobileMain=doc.createElement("button"),mobileSchedule=doc.createElement("button");
    mobileMain.type=mobileSchedule.type="button";mobileMain.dataset.plMobileView="main";mobileSchedule.dataset.plMobileView="schedule";
    mobileSchedule.className="pl-workspace-schedule-toggle";mobileSchedule.textContent="Schedule";tabs.append(mobileMain,mobileSchedule);
    mobileMain.addEventListener("click",()=>{this.selectModule(this.module,false,true);mobileMain.focus({preventScroll:true});});
    mobileSchedule.addEventListener("click",()=>{revealSchedule();mobileSchedule.focus({preventScroll:true});});
    const extras=doc.createElement("details");extras.className="pl-workspace-plan-actions";top.append(extras);
    const summary=owned(doc.createElement("summary"),"");summary.textContent="Plan actions";extras.append(summary);
    const menu=host.querySelector<HTMLElement>(":scope > .plannerTopMenuLinks");if(menu)place(menu,extras,true);else extras.hidden=true;
    place(panel,shell);
    let sizingBefore:{scheduleWidth:number|null;scheduleExpanded:boolean;dockSizes:Partial<Record<"left"|"right",number>>;layoutPreset:WorkspacePresetId|null}|null=null;
    const beginSizing=()=>{sizingBefore={scheduleWidth:this.scheduleWidth,scheduleExpanded:this.scheduleExpanded,dockSizes:{...this.dockSizes},layoutPreset:this.layoutPreset};this.releasePresetSizing();};
    const splitter=owned(doc.createElement("div"),"pl-workspace-splitter");splitter.tabIndex=0;splitter.setAttribute("role","separator");splitter.setAttribute("aria-orientation","vertical");splitter.setAttribute("aria-label","Resize schedule");
    splitter.title="Drag to resize schedule. Arrow keys adjust; double-click resets.";main.after(splitter);
    splitter.addEventListener("pointerdown",event=>{if(event.button!==0)return;event.preventDefault();splitter.focus();beginSizing();this.drag={start:event.clientX,width:this.currentScheduleWidth(),pointerId:event.pointerId};deck.classList.add("pl-workspace-resizing");});
    splitter.addEventListener("dblclick",()=>{this.releasePresetSizing();this.scheduleExpanded=false;this.scheduleWidth=null;this.updatePanes();this.rememberLayout();});
    splitter.addEventListener("keydown",event=>{if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;event.preventDefault();this.releasePresetSizing();const current=this.currentScheduleWidth();this.scheduleExpanded=false;this.scheduleWidth=event.key==="Home"?420:event.key==="End"?this.maximumScheduleWidth():current+(event.key==="ArrowLeft"?1:-1)*(event.shiftKey?40:16);this.scheduleWidth=this.currentScheduleWidth();this.updatePanes();this.rememberLayout();});
    const dockSplitters=(["left","right"] as const).map(edge=>{
      const handle=owned(doc.createElement("div"),"pl-dock-divider");handle.dataset.plDockDivider=edge;handle.tabIndex=0;handle.setAttribute("role","separator");handle.setAttribute("aria-label",`Resize ${edge} panel`);handle.setAttribute("aria-orientation","vertical");handle.title="Drag to resize. Arrow keys adjust; double-click resets.";deck.append(handle);
      handle.addEventListener("pointerdown",event=>{if(event.button!==0)return;event.preventDefault();beginSizing();const geometry=this.dockGeometry();this.dockDrag={edge,id:event.pointerId,x:event.clientX,size:Number(handle.getAttribute("aria-valuenow")||300),...(geometry.fillSides&&geometry.left&&geometry.right?{splitTotal:geometry.leftSize+geometry.rightSize}:{})};});
      handle.addEventListener("dblclick",()=>{this.releasePresetSizing();const geometry=this.dockGeometry();if(geometry.fillSides&&geometry.left&&geometry.right)this.dockSizes={};else delete this.dockSizes[edge];this.updatePanes();this.rememberLayout();});
      handle.addEventListener("keydown",event=>{const positive=edge==="left"?"ArrowRight":"ArrowLeft",negative=edge==="left"?"ArrowLeft":"ArrowRight";if(![positive,negative,"Home","End"].includes(event.key))return;event.preventDefault();const current=Number(handle.getAttribute("aria-valuenow")||300);this.resizeDock(edge,event.key==="Home"?200:event.key==="End"?Number(handle.getAttribute("aria-valuemax")):current+(event.key===positive?1:-1)*(event.shiftKey?40:16));this.updatePanes();this.rememberLayout();});return handle;
    });
    const position=owned(doc.createElement("div"),"pl-workspace-position");host.before(position);
    const scrollRoom=owned(doc.createElement("div"),"pl-workspace-scroll-room");host.after(scrollRoom);
    const preview=owned(doc.createElement("aside"),"pl-workspace-preview");preview.hidden=true;preview.setAttribute("role","region");preview.setAttribute("aria-label","Selected class details");
    const head=doc.createElement("div");head.className="pl-workspace-preview-head";
    const content=doc.createElement("div");content.className="pl-workspace-preview-content";
    const close=doc.createElement("button");close.type="button";close.className="pl-workspace-preview-close";close.textContent="×";close.setAttribute("aria-label","Close details");close.addEventListener("click",()=>{const detail=[...this.openDetails.values()].find(detail=>detail.preview===preview);if(detail)this.closeDetail(detail);});
    preview.append(close,head,content);slot.append(preview);
    slot.setAttribute("role","region");slot.setAttribute("aria-label","Open class details");slot.tabIndex=0;
    const detailsScroll=()=>this.positionPreview();slot.addEventListener("scroll",detailsScroll,{passive:true});
    const calendarScroll=()=>this.positionCalendarTools();panes[1].section.addEventListener("scroll",calendarScroll,{passive:true});
    const view=doc.defaultView,printMedia=view?.matchMedia?.("print")||null;
    let printActive=false,printFrame:number|null=null;
    const printing=()=>printActive||printMedia?.matches===true;
    const resize=()=>{if(printing())return;this.introduction.positionHeader();this.positionWorkspace();this.updatePanes();this.introduction.positionInfo();this.positionPlanActions();};
    const key=(event:KeyboardEvent)=>{
      if(event.key!=="Escape"||event.defaultPrevented)return;
      if(navDrag||this.drag||this.dockDrag){navEnd();end();event.preventDefault();return;}
      const target=event.target;
      // Unrecorded native dialogs own their keys; don't dismiss background UI.
      const dialog=target instanceof Element?target.closest('[role="dialog"],dialog[open],.ui-dialog'):null;
      if(dialog&&dialog!==this.activePlanSurface)return;
      if(this.activePlanSurface){if(this.dismissPlanSurface(this.activePlanSurface))event.preventDefault();return;}
      if(target instanceof Element&&target.matches("input.ClassSearchBox")&&panes[2].body.contains(target)&&[...doc.querySelectorAll<HTMLElement>(".ui-autocomplete")].some(menu=>!menu.hidden&&menu.children.length>0&&doc.defaultView?.getComputedStyle(menu).display!=="none"&&doc.defaultView?.getComputedStyle(menu).visibility!=="hidden"))return;
      if(extras.open){extras.open=false;summary.focus();event.preventDefault();}
      else if(this.actionsHost){this.closeActions();event.preventDefault();}
      else if(this.module==="information"){this.selectModule(this.previousModule);doc.querySelector<HTMLButtonElement>(".pl-intro-info")?.focus({preventScroll:true});event.preventDefault();}
      else if(this.showSchedule&&doc.defaultView!.innerWidth<1100){this.showSchedule=false;this.updatePanes();mobileSchedule.focus({preventScroll:true});event.preventDefault();}
      else if(this.selected&&!this.state?.layout.isHidden("details")&&((this.module==="classes"&&!this.state?.layout.isHidden("classes"))||detailsFrame.classList.contains("pl-floating-panel"))){
        const detail=[...this.openDetails.values()].find(detail=>target instanceof Node&&detail.card.contains(target))||this.openDetails.get(this.selected);
        if(detail)this.closeDetail(detail);event.preventDefault();
      }
    };
    const move=(event:PointerEvent)=>{if(this.dockDrag&&this.dockDrag.id===event.pointerId){const d=this.dockDrag;this.resizeDock(d.edge,d.size+(d.edge==="left"?event.clientX-d.x:d.x-event.clientX),d.splitTotal);this.updatePanes();}else if(this.drag&&event.pointerId===this.drag.pointerId){this.scheduleExpanded=false;this.scheduleWidth=this.drag.width+this.drag.start-event.clientX;this.updatePanes();}};
    const end=(event?:Event)=>{
      if(!sizingBefore)return;
      if(event?.type!=="pointerup"){this.scheduleWidth=sizingBefore.scheduleWidth;this.scheduleExpanded=sizingBefore.scheduleExpanded;this.dockSizes=sizingBefore.dockSizes;this.layoutPreset=sizingBefore.layoutPreset;}
      else {
        if(this.drag)this.scheduleWidth=this.currentScheduleWidth();
        if(this.dockDrag)this.resizeDock(this.dockDrag.edge,this.dockSizes[this.dockDrag.edge]||200,this.dockDrag.splitTotal);
      }
      sizingBefore=null;this.drag=null;this.dockDrag=null;deck.classList.remove("pl-workspace-resizing");this.updatePanes();if(event?.type==="pointerup")this.rememberLayout();
    };
    let before:boolean|null=null;
    const beforePrint=()=>{printActive=true;if(before===null)before=extras.open;extras.open=true;};
    const afterPrint=()=>{
      printActive=false;if(before!==null){extras.open=before;before=null;}
      // Print switches the deck to document flow. Measure only after screen CSS
      // is active again, so fixed panels cannot retain the print page's bounds.
      if(!view||this.state?.host!==host||printFrame!==null)return;
      printFrame=view.requestAnimationFrame(()=>{printFrame=null;if(this.state?.host===host&&!printing())resize();});
    };
    const printChanged=()=>{if(printMedia?.matches)beforePrint();else afterPrint();};
    const stopPrint=()=>{printMedia?.removeEventListener("change",printChanged);if(printFrame!==null)view?.cancelAnimationFrame(printFrame);printFrame=null;};
    const hostHadStyle=host.hasAttribute("style");
    const syncNoticeCount=()=>host.style.setProperty("--pl-notice-count",String(host.querySelectorAll(":scope > .classPlanner_Messages").length));
    syncNoticeCount();
    const actionObserver=new MutationObserver(()=>{syncNoticeCount();this.syncPlanSurfaces();});
    const helpObserver=new MutationObserver(()=>this.positionHeaderHelp());
    const actionClick=(event:MouseEvent)=>{
      const target=event.target instanceof Element?event.target:null;
      const entry=target?.closest<HTMLButtonElement>("button");
      if(entry?.parentElement===this.currentPlanMenu(this.state!))this.pendingPlanAction=["renamePlan","savePlanAsMenuEntry","loadMenuEntry","aboutMenuEntry"].includes(entry.id)?entry.id:null;
      this.syncPlanSurfaces();
      this.positionHeaderHelp();
      if(!this.activePlanSurface&&target&&!extras.contains(target)&&!target.closest('.pl-plan-action-surface,[role="dialog"],dialog[open],.ui-dialog'))extras.open=false;
    };
    const layout=new PanelLayoutController(doc,deck,(id,placement,reason,operation)=>this.panelLayoutChanged(id,placement,reason,operation));
    this.state={doc,host,panel,deck,top,extras,menu,placements,preview,head,content,close,panes,splitters:[splitter,...dockSplitters],empty,widenSchedule,shell,main,navMain,navFooter,slot,moduleButtons,mobileMain,mobileSchedule,scheduleNav,position,scrollRoom,hostHadStyle,resize,key,detailsScroll,calendarScroll,move,end,beforePrint,afterPrint,printing,stopPrint,actionObserver,actionClick,helpObserver,layout,detailsFrame,detailIndex,navigation,navToggle,navDivider,navMove,navEnd,groupStrips,groupTabs};
    this.settings = new WorkspaceSettings(doc, navFooter, {
      onPreset: id => this.applyLayoutPreset(id),
      onDefault: () => this.state?.layout.reset()
    });
    for(const pane of panes){
      const id=pane.module||"schedule",handle=owned(doc.createElement("button"),"pl-panel-grip");handle.type="button";handle.textContent="⠿";handle.dataset.plPanelHandle=id;handle.setAttribute("aria-label",`Move ${pane.label}`);pane.title.prepend(handle);
      layout.addPanel({id,label:pane.module?MODULE_LABELS[pane.module]:"Weekly schedule",element:pane.section,handle,defaultDock:id==="schedule"?"right":"main",allowedDocks:["main","left","right"],getDropTargets:()=>this.groupDropTargets(id as WorkspacePanelId),canDrop:operation=>this.groupDropAllowed(id as WorkspacePanelId,operation),onActivate:()=>{this.captureGestureChoices();if(pane.module)this.selectModule(pane.module,false,true);else {this.groups=selectWorkspaceTab(this.groups,"schedule");this.setPaneCollapsed(pane,false);}}});
      layout.addHandle(id,pane.title);
      const proxy=pane.module&&moduleButtons.get(pane.module);if(proxy){proxy.title=`${MODULE_LABELS[pane.module!]} — drag to arrange`;proxy.dataset.plPanelHandle=id;layout.addHandle(id,proxy);}
      const closePanel=owned(doc.createElement("button"),"pl-panel-close");closePanel.type="button";closePanel.textContent="×";closePanel.dataset.plPanelClose=id;closePanel.setAttribute("aria-label",`Close ${pane.module?MODULE_LABELS[pane.module]:"Weekly schedule"} panel`);closePanel.title="Close panel — reopen from navigation";closePanel.addEventListener("click",()=>layout.hidePanel(id));pane.title.append(closePanel);
      const wrap=owned(doc.createElement("div"),"pl-workspace-group-tab-wrap"),tab=owned(doc.createElement("button"),"pl-workspace-group-tab"),closeTab=owned(doc.createElement("button"),"pl-workspace-group-tab-close");
      tab.type=closeTab.type="button";tab.dataset.plTab=id;tab.textContent=pane.label;tab.id=`pl-workspace-tab-${id}`;tab.setAttribute("role","tab");if(pane.body.id)tab.setAttribute("aria-controls",pane.body.id);
      closeTab.textContent="×";closeTab.setAttribute("aria-label",`Close ${pane.label} tab`);closeTab.title=`Close ${pane.label}; reopen from navigation`;
      closeTab.dataset.plTabClose=id;
      tab.addEventListener("click",()=>{if(pane.module)this.selectModule(pane.module,false,true);else revealSchedule();tab.focus({preventScroll:true});});closeTab.addEventListener("click",()=>layout.hidePanel(id));
      tab.addEventListener("keydown",event=>{if(event.altKey||!["ArrowLeft","ArrowRight","Home","End","Delete"].includes(event.key))return;event.preventDefault();if(event.key==="Delete"){layout.hidePanel(id);return;}const place=this.groups.panels[id as WorkspacePanelId].placement;if(place==="floating")return;const peers=openGroupTabs(this.groups,place),index=peers.indexOf(id as WorkspacePanelId),next=event.key==="Home"?0:event.key==="End"?peers.length-1:(index+(event.key==="ArrowLeft"?-1:1)+peers.length)%peers.length;groupTabs.get(peers[next])?.button.click();});
      wrap.append(tab,closeTab);groupStrips.get("main")!.append(wrap);groupTabs.set(id as WorkspacePanelId,{wrap,button:tab,close:closeTab});layout.addHandle(id,tab);
    }
    layout.addHandle("schedule",scheduleNav);
    layout.addPanel({id:"details",label:"Class details",element:detailsFrame,handle:detailsHandle,defaultDock:"main",allowedDocks:["main"],getDockTargets:()=>this.panelDropTargets("details")});
    actionObserver.observe(host,{childList:true});doc.addEventListener("click",actionClick);
    for(const pane of panes)helpObserver.observe(pane.title,{childList:true,subtree:true,attributes:true,attributeFilter:["style","class","hidden"]});
    this.syncPlanSurfaces();
    for(const name of ["resize","scroll","focus","pageshow","load"])doc.defaultView?.addEventListener(name,resize);
    doc.addEventListener("visibilitychange",resize);doc.addEventListener("keydown",key);extras.addEventListener("toggle",resize);
    doc.addEventListener("pointermove",move);doc.addEventListener("pointerup",end);doc.addEventListener("pointercancel",end);doc.defaultView?.addEventListener("blur",end);
    doc.defaultView?.addEventListener("beforeprint",beforePrint);doc.defaultView?.addEventListener("afterprint",afterPrint);
    printMedia?.addEventListener("change",printChanged);if(printMedia?.matches)beforePrint();
    host.classList.add("pl-workspace-host","pl-grouped-workspace");doc.documentElement.classList.add("pl-workspace-page");this.syncGroupsToPanels();resize();
  }

  private positionWorkspace(): void {
    const s=this.state,view=s?.doc.defaultView;if(!s||!view||s.printing())return;
    // UCLA navigation and original menus remain in their original ancestry.
    // Root scrolling is intentional: UCLA's unchanged header can scroll away.
    // BODY stays non-scrollable; only the document and individual panes scroll.
    const marker=s.position.getBoundingClientRect(),top=this.introduction.isHeaderCompact()?0:Math.ceil(Math.max(marker.top<=13?0:marker.top,this.introduction.headerClearance()));
    s.host.style.setProperty("--pl-workspace-top",`${top}px`);s.host.classList.toggle("pl-workspace-flow",top>0&&view.innerHeight-top<400);
    s.host.style.setProperty("--pl-workspace-flow-offset",`${Math.max(0,top-marker.top)+8}px`);
    s.host.style.setProperty("--pl-workspace-left",`${marker.left}px`);
    s.host.style.setProperty("--pl-workspace-width",`${s.doc.documentElement.clientWidth}px`);
    s.scrollRoom.style.height=`${Math.max(0,view.innerHeight-28)}px`;
  }

  private currentPlanMenu(s:Workspace):HTMLElement|null {
    return s.host.querySelector<HTMLElement>(":scope > .plannerTopMenuLinks")||s.extras.querySelector<HTMLElement>(":scope > .plannerTopMenuLinks");
  }

  private planSurfaceVisible(node:HTMLElement):boolean {
    const style=node.ownerDocument.defaultView?.getComputedStyle(node);
    return node.isConnected&&!node.hidden&&!node.classList.contains("hidden")&&style?.display!=="none"&&style?.visibility!=="hidden";
  }

  /** These are the native action panels observed beside the planner, not copies
   * of their fields. Presentation never changes their own display/hidden state. */
  private syncPlanSurfaces():void {
    const s=this.state;if(!s)return;
    const previousActive=this.activePlanSurface;
    const candidates=[...s.host.children].filter((node):node is HTMLElement=>node instanceof HTMLElement&&(
      node.matches("div.mobileloadmenupanel.touchpanelmenu.noprint")&&[...node.children].filter(child=>!child.hasAttribute(OWNED)).length===1&&!!node.querySelector(":scope > div.message > ul")||
      node.matches("div#AboutDragger.message.info,div#SaveDragger.message.info")&&node.firstElementChild?.tagName==="HEADER"||
      node.matches("div#ResponseMessageDragger")&&!!node.querySelector(":scope > table")
    )&&node.closest("form")===s.host.closest("form"));
    for(const [node,record] of this.planSurfaces)if(!candidates.includes(node)){this.restorePlanSurface(record);this.planSurfaces.delete(node);}
    for(const node of candidates){
      if(!this.planSurfaces.has(node)){
        const record:PlanSurface={node,close:null,hadStyle:node.hasAttribute("style"),visible:false};this.planSurfaces.set(node,record);
        node.classList.add("pl-plan-action-surface");
        if(node.matches(".mobileloadmenupanel")){
          const close=s.doc.createElement("button");close.type="button";close.className="pl-plan-action-load-close";close.textContent="Close load plan";close.setAttribute(OWNED,"true");
          close.addEventListener("click",()=>this.dismissPlanSurface(node));node.prepend(close);record.close=close;
        }
        s.actionObserver.observe(node,{attributes:true,attributeFilter:["style","hidden","class"]});
      }
    }
    const visible=candidates.filter(node=>this.planSurfaceVisible(node));
    const newlyVisible=visible.filter(node=>!this.planSurfaces.get(node)!.visible);
    const targetId=this.pendingPlanAction==="loadMenuEntry"?"load":this.pendingPlanAction==="aboutMenuEntry"?"AboutDragger":["renamePlan","savePlanAsMenuEntry"].includes(this.pendingPlanAction||"")?"SaveDragger":null;
    const requested=visible.find(node=>targetId==="load"?node.matches(".mobileloadmenupanel"):node.id===targetId);
    if(requested&&this.pendingPlanAction){
      this.planSurfaceTrigger.set(requested,this.pendingPlanAction);this.pendingPlanAction=null;
      if(!requested.contains(s.doc.activeElement))this.focusPlanSurface(requested);
    }
    this.activePlanSurface=requested||newlyVisible.at(-1)||(this.activePlanSurface&&visible.includes(this.activePlanSurface)?this.activePlanSurface:null)||visible.at(-1)||null;
    if(previousActive&&!visible.includes(previousActive)&&previousActive.contains(s.doc.activeElement))this.focusPlanTrigger(previousActive);
    for(const node of candidates){const open=visible.includes(node);this.planSurfaces.get(node)!.visible=open;if(node.classList.contains("pl-plan-action-surface-open")!==open)node.classList.toggle("pl-plan-action-surface-open",open);}
    this.positionPlanActions();
  }

  private positionPlanActions():void {
    const s=this.state,view=s?.doc.defaultView;if(!s||!view)return;
    const host=s.host.getBoundingClientRect(),summary=s.extras.querySelector("summary")!.getBoundingClientRect();
    const menuHeight=`${Math.max(40,Math.min(host.bottom,view.innerHeight)-summary.bottom-12)}px`;
    if(s.extras.style.getPropertyValue("--pl-plan-menu-max-height")!==menuHeight)s.extras.style.setProperty("--pl-plan-menu-max-height",menuHeight);
    const width=Math.max(0,Math.min(560,host.width-24)),left=Math.max(12,Math.min(host.width-width-12,summary.left-host.left));
    const top=Math.max(12,summary.bottom-host.top+8),height=Math.max(80,Math.min(host.bottom,view.innerHeight)-host.top-top-12);
    for(const node of this.planSurfaces.keys())for(const [key,value] of [["left",left],["top",top],["width",width],["max-height",height]] as const){
      const name=`--pl-plan-action-${key}`,next=`${value}px`;if(node.style.getPropertyValue(name)!==next)node.style.setProperty(name,next);
    }
  }

  private dismissPlanSurface(node:HTMLElement):boolean {
    const s=this.state;if(!s||!this.planSurfaces.has(node)||!this.planSurfaceVisible(node))return false;
    let close:HTMLButtonElement|null=null;
    if(node.matches(".mobileloadmenupanel")){
      const button=this.currentPlanMenu(s)?.querySelector<HTMLButtonElement>(":scope > button#loadMenuEntry");
      if(button?.getAttribute("onclick")==='$(".mobileloadmenupanel").toggle(); return false;')close=button;
    }else{
      const expected=node.id==="AboutDragger"?"$('#AboutDragger').hide(); $('#aboutMenuEntry').focus(); return false;":`$('#${node.id}').hide(); return false;`;
      close=[...node.querySelectorAll<HTMLButtonElement>("button.link")].find(button=>button.getAttribute("onclick")===expected)||null;
    }
    if(!close||close.disabled||close.matches(":disabled")||close.form!==s.host.closest("form")||close.getAttribute("aria-disabled")==="true"||
      ["form","formaction","formmethod","formenctype","formtarget"].some(name=>close.hasAttribute(name))||
      close.hasAttribute("type")&&close.getAttribute("type")!=="button")return false;
    const boundary=node.contains(close)?node:this.currentPlanMenu(s);
    for(let element:HTMLElement|null=close;element&&element!==boundary;element=element.parentElement){
      const style=s.doc.defaultView!.getComputedStyle(element);
      if(element.hidden||element.getAttribute("aria-hidden")==="true"||style.display==="none"||["hidden","collapse"].includes(style.visibility))return false;
    }
    s.extras.open=true;close.click();this.syncPlanSurfaces();
    if(!this.planSurfaceVisible(node))this.focusPlanTrigger(node);
    return true;
  }

  private focusPlanTrigger(node:HTMLElement):void {
    const s=this.state;if(!s)return;
    if(this.activePlanSurface&&this.activePlanSurface!==node&&this.planSurfaceVisible(this.activePlanSurface)){this.focusPlanSurface(this.activePlanSurface);return;}
    const id=this.planSurfaceTrigger.get(node)||(node.id==="AboutDragger"?"aboutMenuEntry":node.matches(".mobileloadmenupanel")?"loadMenuEntry":null);
    const trigger=id?s.doc.getElementById(id):null;s.extras.open=true;
    (trigger&&this.currentPlanMenu(s)?.contains(trigger)?trigger:s.extras.querySelector<HTMLElement>("summary"))?.focus({preventScroll:true});
  }

  private focusPlanSurface(node:HTMLElement):void {
    const input=node.querySelector<HTMLElement>('#planNameBox:not([disabled])');
    const controls=[...node.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([type="hidden"]):not([disabled]),a[href],select:not([disabled]),textarea:not([disabled])')];
    const visible=(control:HTMLElement)=>{
      for(let part:HTMLElement|null=control;part&&node.contains(part);part=part.parentElement){const style=part.ownerDocument.defaultView!.getComputedStyle(part);if(part.hidden||part.getAttribute("aria-hidden")==="true"||style.display==="none"||["hidden","collapse"].includes(style.visibility))return false;}
      return true;
    };
    (input&&visible(input)?input:controls.find(visible))?.focus({preventScroll:true});
  }

  private restorePlanSurface(record:PlanSurface):void {
    record.close?.remove();record.node.classList.remove("pl-plan-action-surface","pl-plan-action-surface-open");
    for(const key of ["left","top","width","max-height"])record.node.style.removeProperty(`--pl-plan-action-${key}`);
    if(!record.hadStyle&&!record.node.getAttribute("style"))record.node.removeAttribute("style");
    this.planSurfaceTrigger.delete(record.node);
  }

  private maximumScheduleWidth():number {
    const placement=this.groups.panels.schedule.placement;
    const others=WORKSPACE_DOCKS.filter(dock=>dock!==placement&&openGroupTabs(this.groups,dock).length);
    const remaining=others.reduce((sum,dock)=>sum+minimumGroupWidth(this.groups,dock)+12,0);
    return Math.max(420,(this.state?.deck.clientWidth||1400)-remaining);
  }

  private currentScheduleWidth():number {
    const s=this.state,available=s?.deck.clientWidth||1400;
    const preferred=this.scheduleExpanded?this.maximumScheduleWidth():this.scheduleWidth??Math.min(640,available*.38);
    return Math.max(420,Math.min(this.maximumScheduleWidth(),preferred));
  }

  private selectModule(module:Module,focus=false,explicitNavigation=false):void {
    const s=this.state;if(!s)return;
    if(module!=="information"&&!s.panes.some(p=>p.module===module))return;
    if(explicitNavigation&&module!=="information"){this.groups=selectWorkspaceTab(this.groups,module);this.syncGroupsToPanels();}
    if(module==="information"&&this.module!=="information")this.previousModule=this.module;
    this.closeActions(false);this.module=module;this.showSchedule=false;s.extras.open=false;
    if(module==="information"||s.layout.getPlacement(module)==="main")this.mainModule=module;
    const pane=s.panes.find(p=>p.module===module);if(pane&&!pane.opaque){pane.collapsed=false;this.paneChoices.set(pane.title.id,false);}
    if(pane&&!pane.opaque&&explicitNavigation){this.setPaneCollapsed(pane,false);if(!this.state)return;}
    this.updatePanes();if(focus)(module==="information"?s.doc.querySelector<HTMLButtonElement>(".pl-intro-info"):s.moduleButtons.get(module))?.focus({preventScroll:true});
    if(pane?.opaque&&explicitNavigation)this.openNativeModule(pane);
    if(explicitNavigation||focus)this.rememberLayout();
  }

  /** The navigation may forward only a user's explicit request to the exact
   * native expand control. Restoring a selected module never opens it. */
  private primaryTarget(title:HTMLElement,body:HTMLElement):HTMLElement|null {
    const spec=PRIMARY_DISCLOSURES[title.id as keyof typeof PRIMARY_DISCLOSURES];
    if(!spec||body.id!==spec.body)return null;
    return spec.target===spec.body?body:body.querySelector<HTMLElement>(":scope > #gridDiv");
  }

  private primaryExpansion(title:HTMLElement,body:HTMLElement):{button:HTMLButtonElement;target:HTMLElement}|null {
    const spec=PRIMARY_DISCLOSURES[title.id as keyof typeof PRIMARY_DISCLOSURES],doc=title.ownerDocument,location=doc.defaultView?.location;
    const target=this.primaryTarget(title,body),form=doc.getElementById("aspnetForm");
    if(!spec||!target||!target.classList.contains("hidden")||title.parentElement!==body.parentElement||
      !location||location.origin!=="https://be.my.ucla.edu"||location.pathname!=="/ClassPlanner/ClassPlan.aspx"||
      !(form instanceof HTMLFormElement)||form.method.toLowerCase()!=="post"||body.closest("form")!==form||
      doc.querySelectorAll(`#${spec.target}`).length!==1||doc.querySelectorAll(`#${spec.toggle}`).length!==1)return null;
    try{const action=new URL(form.action,location.href);if(action.origin!==location.origin||action.pathname!==location.pathname)return null;}catch{return null;}
    const children=[...title.children].filter(node=>!node.hasAttribute(OWNED)),button=doc.getElementById(spec.toggle);
    if(!(button instanceof HTMLButtonElement)||button.parentElement!==title||button.form!==form||
      children.length!==spec.children||children[children.length-1]!==button||
      !button.matches("button.planSectionToggle.link")||button.disabled||button.matches(":disabled")||button.getAttribute("aria-disabled")==="true"||
      ["type","form","formaction","formmethod","formenctype","formtarget"].some(name=>button.hasAttribute(name))||
      button.getAttribute("onclick")!==`shrink('${spec.target}'); __doPostBack('${spec.toggle.replaceAll("_","$")}','')`||
      button.children.length!==2||!button.children[0].matches("i.icon-plus-sign:not(.icon-minus-sign)")||
      button.children[1].tagName!=="LABEL"||button.children[1].textContent?.trim()!==spec.label)return null;
    if(spec.children===3&&(!children[0].matches("a.planSectionHelpTip")||!children[1].matches("button#faceTip.uit-clickover-bottom.planSectionHelpTip.link")))return null;
    for(let node:HTMLElement|null=button;node&&title.contains(node);node=node.parentElement){const style=doc.defaultView!.getComputedStyle(node);if(node.hidden||node.getAttribute("aria-hidden")==="true"||style.display==="none"||["hidden","collapse"].includes(style.visibility))return null;}
    return {button,target};
  }

  private beginPrimaryOpen(pane:Pane,expansion:{button:HTMLButtonElement;target:HTMLElement},forward=true):void {
    const s=this.state;if(!s||this.pendingModuleOpen||!pane.toggle)return;
    const {button,target}=expansion,status=s.doc.createElement("p");status.className="pl-optimizer-state";status.setAttribute(OWNED,"true");status.setAttribute("role","status");
    status.textContent=`Opening ${pane.label}… If it stays closed, use Original layout to retry the native heading.`;pane.body.before(status);pane.toggle.setAttribute("aria-busy","true");
    const observer=new MutationObserver(()=>this.refreshModulePending());this.pendingModuleOpen={pane,button,target,status,navigation:pane.toggle,observer};
    observer.observe(pane.section,{childList:true,subtree:true,attributes:true,attributeFilter:["class","hidden","style"]});
    if(forward){this.forwardingPrimary=button;try{button.click();}finally{this.forwardingPrimary=null;}this.refreshModulePending();}
  }

  private nativeExpandButton(pane:Pane):HTMLButtonElement|null {
    if(pane.module==="study"||pane.module==="personal")return this.secondaryExpandButton(pane,pane.module);
    const s=this.state,doc=s?.doc,location=doc?.defaultView?.location;
    if(!s||!doc||!location||location.origin!=="https://be.my.ucla.edu"||location.pathname!=="/ClassPlanner/ClassPlan.aspx"||
      pane.module!=="optimizer"||!pane.section.isConnected||pane.section.parentElement!==s.main)return null;
    const children=[...pane.section.children].filter(node=>!node.hasAttribute(OWNED));
    if(children.length!==3||children[0]!==pane.title||children[2]!==pane.body||pane.title.id!=="classOptimizerTitle"||
      !children[1].matches("#HelpOptimizerDiv.message.info")||pane.body.id!=="panelOptimizer"||!pane.body.classList.contains("hidden"))return null;
    const form=doc.getElementById("aspnetForm"),button=doc.getElementById(OPTIMIZER_TOGGLE);
    if(!(form instanceof HTMLFormElement)||form.method.toLowerCase()!=="post"||!(button instanceof HTMLButtonElement)||
      button.parentElement!==pane.title||button.form!==form||pane.section.closest("form")!==form||
      doc.querySelectorAll(`#${OPTIMIZER_TOGGLE}`).length!==1||doc.getElementById("panelOptimizer")!==pane.body||
      !button.matches("button.planSectionToggle.link")||button.disabled||button.matches(":disabled")||button.getAttribute("aria-disabled")==="true"||
      button.getAttribute("onclick")!==OPTIMIZER_OPEN||["type","formaction","formmethod","formenctype","formtarget"].some(name=>button.hasAttribute(name)))return null;
    try {const action=new URL(form.action,location.href);if(action.origin!==location.origin||action.pathname!==location.pathname)return null;}catch{return null;}
    for(let node:HTMLElement|null=button;node&&pane.section.contains(node);node=node.parentElement){
      const style=doc.defaultView!.getComputedStyle(node);
      if(node.hidden||node.getAttribute("aria-hidden")==="true"||style.display==="none"||style.visibility==="hidden"||style.visibility==="collapse")return null;
    }
    const titleChildren=[...pane.title.children].filter(node=>!node.hasAttribute(OWNED));
    if(titleChildren.length!==2||!titleChildren[0].matches("button#ctl00_MainContent_planSectionHelpTipOpPop.planSectionHelpTip.link")||
      titleChildren[1]!==button||button.children.length!==2||!button.children[0].matches("i.icon-plus-sign:not(.icon-minus-sign)")||
      button.children[1].tagName!=="LABEL"||button.children[1].textContent?.trim()!=="Plan Optimizer")return null;
    return button;
  }

  private secondaryExpandButton(pane:Pane,module:keyof typeof SECONDARY_DISCLOSURES):HTMLButtonElement|null {
    const s=this.state,doc=s?.doc,location=doc?.defaultView?.location,spec=SECONDARY_DISCLOSURES[module];
    if(!s||!doc||!location||location.origin!=="https://be.my.ucla.edu"||location.pathname!=="/ClassPlanner/ClassPlan.aspx"||
      !pane.opaque||!pane.section.isConnected||pane.section.parentElement!==s.main)return null;
    const children=[...pane.section.children].filter(node=>!node.hasAttribute(OWNED));
    if(children.length!==2||children[0]!==pane.title||children[1]!==pane.body||pane.title.id!==spec.title||
      pane.body.id!==spec.body||!pane.body.classList.contains("hidden"))return null;
    const form=doc.getElementById("aspnetForm"),button=doc.getElementById(spec.toggle);
    if(!(form instanceof HTMLFormElement)||form.method.toLowerCase()!=="post"||!(button instanceof HTMLButtonElement)||
      button.parentElement!==pane.title||button.form!==form||pane.section.closest("form")!==form||
      doc.querySelectorAll(`#${spec.toggle}`).length!==1||doc.querySelectorAll(`#${spec.body}`).length!==1||
      doc.getElementById(spec.body)!==pane.body||!button.matches("button.planSectionToggle.link")||
      button.disabled||button.matches(":disabled")||button.getAttribute("aria-disabled")==="true"||
      button.getAttribute("onclick")!==`shrink('${spec.body}'); __doPostBack('${spec.toggle.replaceAll("_","$")}','')`||
      ["type","form","formaction","formmethod","formenctype","formtarget"].some(name=>button.hasAttribute(name)))return null;
    try {const action=new URL(form.action,location.href);if(action.origin!==location.origin||action.pathname!==location.pathname)return null;}catch{return null;}
    for(let node:HTMLElement|null=button;node&&pane.section.contains(node);node=node.parentElement){
      const style=doc.defaultView!.getComputedStyle(node);
      if(node.hidden||node.getAttribute("aria-hidden")==="true"||style.display==="none"||["hidden","collapse"].includes(style.visibility))return null;
    }
    const titleChildren=[...pane.title.children].filter(node=>!node.hasAttribute(OWNED));
    if(titleChildren.length!==spec.count||!titleChildren[spec.count-2].matches(spec.help)||
      (module==="study"&&!titleChildren[0].matches("a.planSectionHelpTip"))||titleChildren[spec.count-1]!==button||
      button.children.length!==2||!button.children[0].matches("i.icon-plus-sign:not(.icon-minus-sign)")||
      button.children[1].tagName!=="LABEL"||button.children[1].textContent?.trim()!==spec.label)return null;
    return button;
  }

  private openNativeModule(pane:Pane):void {
    this.refreshModulePending();
    const s=this.state;
    if(!s||!pane.module||this.pendingModuleOpen)return;
    const button=this.nativeExpandButton(pane),navigation=s.moduleButtons.get(pane.module);
    if(!button||!navigation)return;
    const status=s.doc.createElement("p");status.className="pl-optimizer-state";status.setAttribute(OWNED,"true");
    status.setAttribute("role","status");status.textContent=`Opening ${pane.module==="optimizer"?"Plan Optimizer":MODULE_LABELS[pane.module]}… If it stays closed, click the module heading.`;
    pane.body.before(status);navigation.setAttribute("aria-busy","true");
    const observer=new MutationObserver(()=>this.refreshModulePending());
    this.pendingModuleOpen={pane,button,target:pane.body,status,navigation,observer};
    observer.observe(pane.section,{childList:true,subtree:true,attributes:true,attributeFilter:["class","hidden","style","disabled","onclick","form"]});
    // Mark pending before the native click so reentrant or rapid navigation
    // cannot issue a second postback while MyUCLA has not opened the panel.
    button.click();this.refreshModulePending();
  }

  private refreshModulePending():void {
    const pending=this.pendingModuleOpen;if(!pending)return;
    if(!this.state||!pending.pane.section.isConnected||!pending.pane.body.isConnected||!pending.button.isConnected||
      pending.pane.body.parentElement!==pending.pane.section||this.state.doc.getElementById(pending.button.id)!==pending.button||
      this.state.doc.getElementById(pending.pane.body.id)!==pending.pane.body||!pending.target.isConnected||
      this.state.doc.getElementById(pending.target.id)!==pending.target||!pending.target.classList.contains("hidden"))this.clearModulePending();
  }

  private clearModulePending():void {
    const pending=this.pendingModuleOpen;if(!pending)return;this.pendingModuleOpen=null;
    pending.observer.disconnect();pending.status.remove();pending.navigation.removeAttribute("aria-busy");
  }

  private setPaneCollapsed(pane:Pane,collapsed:boolean,focus=false):void {
    if(!this.state||pane.opaque)return;
    if(!collapsed&&this.primaryTarget(pane.title,pane.body)?.classList.contains("hidden")){
      if(this.pendingModuleOpen)return;
      const expansion=this.primaryExpansion(pane.title,pane.body);if(!expansion){this.restore();return;}
      this.beginPrimaryOpen(pane,expansion);
      if(!this.state)return;
    }
    if(collapsed&&pane===this.state.panes[0]){this.closeActions(false);this.closePreview(false);}
    pane.collapsed=collapsed;this.paneChoices.set(pane.title.id,collapsed);this.updatePanes();this.rememberLayout();
    if(focus)(collapsed&&pane.reopen?pane.reopen:pane.toggle)?.focus({preventScroll:true});
  }

  private panelLayoutChanged(id:string,placement:PanelPlacement,reason:PanelLayoutChangeReason,operation?:PanelDropOperation):void {
    const s=this.state;if(!s||this.updatingLayout)return;
    const committedGroups=this.gestureChoices?.groups;
    if(reason==="drag"){
      // Detaching changes the dock geometry once. Subsequent pointer frames
      // only need to align projected native details, not remeasure every pane.
      const signature=s.panes.map(pane=>`${pane.module}:${s.layout.getPlacement(pane.module||"schedule")}:${s.layout.isHidden(pane.module||"schedule")}`).join("|")+`|${id}:${s.detailsFrame.classList.contains("pl-panel-dragging")}`;
      if(this.dragPresentation!==signature){this.dragPresentation=signature;this.updatePanes();}
      else if(id==="classes"||id==="details")this.positionPreview();
      return;
    }
    this.dragPresentation="";
    if(reason==="geometry"&&!s.layout.isInteracting())this.restoreGestureChoices();
    else if(reason==="placement"||reason==="commit"||reason==="reset")this.gestureChoices=null;
    if(isWorkspacePanelId(id)&&(reason==="placement"||reason==="visibility"))this.releasePresetSizing();
    this.updatingLayout=true;
    try {
      if(reason==="reset")this.resetLayoutChoices();
      if(isWorkspacePanelId(id)){
        if(reason==="placement")this.groups=placement==="floating"?floatWorkspaceTab(committedGroups||this.groups,id):this.groupDropState(id,operation||{kind:"merge",dock:placement},committedGroups||this.groups);
        if(reason==="visibility")this.groups=s.layout.isHidden(id)?closeWorkspaceTab(this.groups,id):selectWorkspaceTab(this.groups,id);
      }
      if(reason!=="geometry")this.syncGroupsToPanels();
      if(reason==="placement"&&id==="details"&&placement==="main"){
        this.makeDockSpace("classes",s.layout.getPlacement("classes")||"main");this.selectModule("classes",false,true);
      }
      if(reason==="placement"&&id==="schedule"&&placement!=="floating")this.showSchedule=s.doc.defaultView!.innerWidth<1100;
      if((reason==="placement"||(reason==="visibility"&&!s.layout.isHidden(id)))&&id!=="details"){
        this.makeDockSpace(id,placement);
        if(id!=="schedule"&&id in MODULE_LABELS){this.module=id as Module;if(placement==="main")this.mainModule=this.module;}
      }
      if(reason==="visibility"&&s.layout.isHidden(id)&&id==="schedule")this.showSchedule=false;
      this.updatePanes();
      if(reason==="visibility"&&s.layout.isHidden(id)){
        const focus=id==="schedule"?(s.doc.defaultView!.innerWidth<1100?s.mobileSchedule:s.scheduleNav):id==="details"?s.moduleButtons.get(this.module)||s.moduleButtons.get("classes"):s.moduleButtons.get(id as Module);focus?.focus({preventScroll:true});
      }
    } finally {this.updatingLayout=false;}
    if(reason!=="geometry")this.rememberLayout();
  }

  private makeDockSpace(id:string,placement:PanelPlacement):void {
    // A dock is a tab group. Moving into it never displaces its existing tabs.
  }

  private syncGroupsToPanels():void {
    const s=this.state;if(!s)return;const before=this.updatingLayout;this.updatingLayout=true;
    try{for(const id of WORKSPACE_PANEL_IDS){const panel=this.groups.panels[id];if(s.layout.getPlacement(id)!==panel.placement){if(panel.placement==="floating")s.layout.floatPanel(id,undefined,false);else s.layout.dockPanel(id,panel.placement,false);}if(panel.open)s.layout.showPanel(id);else s.layout.hidePanel(id);}}finally{this.updatingLayout=before;}
  }

  private groupDropState(id:WorkspacePanelId,operation:PanelDropOperation,source=this.gestureChoices?.groups||this.groups):WorkspaceGroups {
    return operation.kind==="split"?splitWorkspaceTab(source,id,operation.dock,this.state?.deck.getBoundingClientRect().width||0).state:mergeWorkspaceTab(source,id,operation.dock,operation.index);
  }

  private groupDropAllowed(id:WorkspacePanelId,operation:PanelDropOperation):boolean {
    const source=this.gestureChoices?.groups||this.groups,next=this.groupDropState(id,operation,source);
    if(operation.kind==="split")return (this.state?.doc.defaultView?.innerWidth||0)>=1100&&splitWorkspaceTab(source,id,operation.dock,this.state?.deck.getBoundingClientRect().width||0).accepted;
    return next.panels[id].placement===operation.dock&&WORKSPACE_DOCKS.filter(dock=>openGroupTabs(next,dock).length).length<=2;
  }

  private presentationGroups():WorkspaceGroups {
    let groups=this.groups;
    for(const pane of this.state?.panes||[]){const id=pane.module||"schedule";if(isWorkspacePanelId(id)&&pane.section.classList.contains("pl-panel-dragging"))groups=floatWorkspaceTab(groups,id);}
    return groups;
  }

  /** Shared by the drop preview and the committed layout so their bounds agree. */
  private visiblePanelPlacements(): Map<string,PanelPlacement> {
    const s=this.state!,placements=new Map<string,PanelPlacement>();
    for(const pane of s.panes){const id=pane.module||"schedule";if(!s.layout.isHidden(id))placements.set(id,s.layout.getPlacement(id)||"main");}
    return placements;
  }

  private activeMainFor(placements:Map<string,PanelPlacement>,requested:Module=this.mainModule):Module|null {
    if(requested==="information")return requested;
    if(placements.get(requested)==="main")return requested;
    // Other native modules are available tabs, not occupied main panes until
    // explicitly selected. Keep the same familiar Classes/Find fallback.
    return this.state!.panes.find(pane=>(pane.module==="classes"||pane.module==="find")&&placements.get(pane.module)==="main")?.module||null;
  }

  private resizeDock(edge:"left"|"right",requested:number,splitTotal?:number):void {
    const geometry=this.dockGeometry();
    this.releasePresetSizing();
    const group=edge==="left"?geometry.displayDocks[0]:geometry.displayDocks.at(-1),other=geometry.displayDocks.find(dock=>dock!==group);
    const minimum=group?minimumGroupWidth(geometry.state,group):200,maximum=Math.max(minimum,geometry.rect.width-12-(other?minimumGroupWidth(geometry.state,other):0));
    const size=Math.max(minimum,Math.min(maximum,requested));
    if(group===this.groups.panels.schedule.placement)this.scheduleExpanded=false;
    this.dockSizes[edge]=size;
    // Automatic filling is computed only. An explicit resize of the shared
    // divider changes both sides so its movement follows the pointer exactly.
    if(other==="left"||other==="right")this.dockSizes[other]=geometry.rect.width-12-size;
  }

  private dockGeometry(override?:{id:string;placement:PanelPlacement},groupState?:WorkspaceGroups,focusId?:WorkspacePanelId) {
    const s=this.state!,measured=s.deck.getBoundingClientRect(),view=s.doc.defaultView!;
    // A short viewport keeps the native masthead in document flow. Its host can
    // be taller than the visible area, but fixed panes must scroll locally
    // inside that area instead of stranding controls below the viewport.
    const bottomReserve=parseFloat(view.getComputedStyle(s.host).getPropertyValue("--pl-workspace-bottom"))||0;
    const visibleBottom=Math.min(measured.bottom,view.innerHeight-bottomReserve);
    const rect=new DOMRect(measured.left,measured.top,measured.width,Math.max(0,visibleBottom-measured.top));
    let state=groupState||this.presentationGroups();
    if(override&&isWorkspacePanelId(override.id))state=override.placement==="floating"?floatWorkspaceTab(state,override.id):mergeWorkspaceTab(state,override.id,override.placement);
    const docks=WORKSPACE_DOCKS.filter(dock=>openGroupTabs(state,dock).some(id=>s.groupTabs.has(id)));
    const preferredRight=this.scheduleExpanded&&state.panels.schedule.placement==="right"?this.currentScheduleWidth():this.dockSizes.right??this.currentScheduleWidth(),preferredLeft=this.scheduleExpanded&&state.panels.schedule.placement==="left"?this.currentScheduleWidth():this.dockSizes.left??this.currentScheduleWidth();
    const preferred={left:preferredLeft,right:preferredRight,main:Math.max(0,rect.width-(docks.includes("left")?preferredLeft+12:0)-(docks.includes("right")?preferredRight+12:0))};
    const preset=this.activePreset(state),usable=Math.max(0,rect.width-12*Math.max(0,docks.length-1));
    if(preset)for(const dock of WORKSPACE_DOCKS)preferred[dock]=usable*(preset.ratios[dock]||0);
    const widths=readableGroupWidths(state,rect.width,preferred);
    const selected=focusId||(this.showSchedule?"schedule":this.module!=="information"?this.module:null);
    const chosen=selected?state.panels[selected].placement:null;
    const focused=chosen&&chosen!=="floating"&&docks.includes(chosen)?chosen:docks.includes("main")?"main":docks[0];
    const compact=s.doc.defaultView!.innerWidth<1100||widths===null;
    const information=this.module==="information"&&!groupState;
    const displayDocks=information?[]:compact?focused?[focused]:[]:docks;
    const boxes:Record<PanelDock,PanelBox>={left:{left:rect.left,top:rect.top+40,width:0,height:Math.max(0,rect.height-40)},main:{left:rect.left,top:rect.top+40,width:0,height:Math.max(0,rect.height-40)},right:{left:rect.left,top:rect.top+40,width:0,height:Math.max(0,rect.height-40)}};
    const wholeBoxes:Record<PanelDock,PanelBox>={left:{...boxes.left,top:rect.top,height:rect.height},main:{...boxes.main,top:rect.top,height:rect.height},right:{...boxes.right,top:rect.top,height:rect.height}};
    let left=rect.left;
    for(const dock of displayDocks){const width=compact?rect.width:widths![dock];wholeBoxes[dock]={left,top:rect.top,width,height:rect.height};boxes[dock]={left,top:rect.top+40,width,height:Math.max(0,rect.height-40)};left+=width+12;}
    if(information||!docks.length){boxes.main={left:rect.left,top:rect.top,width:rect.width,height:rect.height};wholeBoxes.main=boxes.main;}
    const activeMain:Module|"schedule"|null=information?"information":displayDocks.includes("main")?activeGroupTab(state,"main"):null;
    const leftId=displayDocks.includes("left")?activeGroupTab(state,"left"):null,rightId=displayDocks.includes("right")?activeGroupTab(state,"right"):null;
    const sideMax=Math.max(0,rect.width-12-Math.min(...docks.map(dock=>minimumGroupWidth(state,dock)),420));
    return {rect,wide:!compact,customized:true,left:leftId,right:rightId,sideMax,leftSize:boxes.left.width,rightSize:boxes.right.width,leftWidth:boxes.main.left-rect.left,rightWidth:rect.right-boxes.main.left-boxes.main.width,boxes,wholeBoxes,activeMain,fillSides:!activeMain&&displayDocks.length>0,displayDocks,state,information};
  }

  private groupDropTargets(id:WorkspacePanelId):PanelDropTarget[] {
    const s=this.state;if(!s)return[];
    const source=this.gestureChoices?.groups||this.groups,geometry=this.dockGeometry(undefined,source),targets:PanelDropTarget[]=[],rect=geometry.rect;
    // Keep tab-strip drops for ordering/grouping. The body has generous edge
    // targets, with a small outside gutter, so a split does not require hitting
    // an exact border. Preview and commit still use the same group reducer.
    const edgeWidth=Math.min(180,Math.max(80,rect.width*.15)),gutter=12;
    for(const dock of ["left","right"] as const){
      const operation:PanelDropOperation={kind:"split",dock};if(!this.groupDropAllowed(id,operation))continue;
      const next=this.groupDropState(id,operation,source),preview=this.dockGeometry(undefined,next,id).wholeBoxes[dock];
      targets.push({operation,preview,hit:{left:dock==="left"?rect.left-gutter:rect.right-edgeWidth,top:rect.top+40,width:edgeWidth+gutter,height:Math.max(0,rect.height-40)}});
    }
    for(const dock of geometry.displayDocks){
      const box=geometry.wholeBoxes[dock],strip=s.groupStrips.get(dock)!.getBoundingClientRect(),peers=openGroupTabs(source,dock).filter(peer=>peer!==id);
      const visibleLeft=Math.max(box.left,strip.left),visibleRight=Math.min(box.left+box.width,strip.right);let last=visibleLeft;
      peers.forEach((peer,index)=>{const button=s.groupTabs.get(peer)?.wrap.getBoundingClientRect();if(!button||button.width<=0)return;const right=Math.min(visibleRight,button.left+button.width/2);if(right<=last)return;const operation:PanelDropOperation={kind:"merge",dock,index};targets.push({operation,preview:this.dockGeometry(undefined,this.groupDropState(id,operation,source),id).wholeBoxes[dock],hit:{left:last,top:box.top,width:right-last,height:40}});last=right;});
      const operation:PanelDropOperation={kind:"merge",dock,index:peers.length};
      targets.push({operation,preview:this.dockGeometry(undefined,this.groupDropState(id,operation,source),id).wholeBoxes[dock],hit:{left:box.left,top:box.top+40,width:box.width,height:Math.max(0,box.height-40)}});
      if(visibleRight>last)targets.push({operation,preview:this.dockGeometry(undefined,this.groupDropState(id,operation,source),id).wholeBoxes[dock],hit:{left:last,top:box.top,width:visibleRight-last,height:40}});
    }
    return targets;
  }
  private panelDropTargets(id:string):Partial<Record<PanelDock,PanelDockTarget>> {
    const s=this.state;if(!s)return {};
    const rect=s.deck.getBoundingClientRect(),wide=s.doc.defaultView!.innerWidth>=1100;
    // The outer quarters are generous snap regions; the middle remains free
    // for floating except for the main workspace's header strip.
    const edgeWidth=Math.min(300,rect.width*.25),top=rect.top,height=rect.height;
    if(id==="details"){
      const preview=this.detailsDockBox();
      return {main:{preview,hit:{...preview,top:Math.max(top,preview.top),height:Math.min(160,preview.height)}}};
    }
    const targets:Partial<Record<PanelDock,PanelDockTarget>>={};
    for(const dock of ["left","right"] as const){
      const geometry=this.dockGeometry({id,placement:dock});
      targets[dock]={preview:geometry.boxes[dock],hit:{left:dock==="left"?rect.left:rect.right-edgeWidth,top,width:edgeWidth,height}};
    }
    if(id!=="schedule"){
      const preview=this.dockGeometry({id,placement:"main"}).boxes.main;
      // Drop near the top of browsing to rejoin it; elsewhere the panel floats.
      targets.main={preview,hit:{left:rect.left+edgeWidth,top,width:Math.max(0,rect.width-edgeWidth*2),height:Math.min(wide?140:100,height)}};
    }
    return targets;
  }

  private detailsDockBox():PanelBox {
    const s=this.state!,plan=s.panes[0].section,place=s.layout.getPlacement("classes")||"main";
    const geometry=this.dockGeometry({id:"classes",placement:place});
    const rect=place==="floating"?(s.layout.snapshot().panels.find(panel=>panel.id==="classes")?.box||plan.getBoundingClientRect()):geometry.boxes[place==="left"||place==="right"?place:"main"];
    const measurable=!s.layout.isHidden("classes")&&!plan.classList.contains("pl-details-only")&&plan.getBoundingClientRect().width>0;
    const titleHeight=measurable?s.panes[0].title.getBoundingClientRect().height||this.planHeaderHeight:this.planHeaderHeight;
    const available=Math.max(0,rect.height-titleHeight),mainWidth=place==="main"?geometry.boxes.main.width:rect.width;
    const narrow=s.doc.defaultView!.innerWidth<1100||mainWidth<560||((place==="floating"||place==="left"||place==="right")&&rect.width<700);
    if(narrow){
      const small=(place==="floating"||place==="left"||place==="right")&&rect.width<700;
      const minimum=small?180:200,maximumList=small?160:180,listHeight=Math.min(maximumList,Math.max(120,available-minimum));
      return {left:rect.left,top:rect.top+titleHeight+listHeight,width:rect.width,height:Math.max(minimum,available-listHeight)};
    }
    const listWidth=mainWidth<700?228:Math.min(288,Math.max(248,rect.width*.27));
    return {left:rect.left+listWidth,top:rect.top+titleHeight,width:Math.max(0,rect.width-listWidth),height:available};
  }

  private positionPanels():void {
    const s=this.state;if(!s)return;
    const geometry=this.dockGeometry(),{rect,boxes,wholeBoxes,displayDocks,state}=geometry;
    s.deck.classList.add("pl-custom-docks");s.deck.classList.toggle("pl-no-main-dock",displayDocks.length>0&&!displayDocks.includes("main")&&!geometry.information);
    s.host.dataset.plGroupsCompact=String(!geometry.wide);
    s.navToggle.textContent=this.navigationCollapsed?"›":"‹";
    s.navToggle.setAttribute("aria-label",`${this.navigationCollapsed?"Expand":"Collapse"} navigation`);s.navToggle.title=s.navToggle.getAttribute("aria-label")!;s.navToggle.setAttribute("aria-expanded",String(!this.navigationCollapsed));
    s.navDivider.setAttribute("aria-valuemin","0");s.navDivider.setAttribute("aria-valuemax","1");s.navDivider.setAttribute("aria-valuenow",this.navigationCollapsed?"0":"1");
    s.main.style.setProperty("--pl-main-left",`${Math.max(0,boxes.main.left-rect.left)}px`);s.main.style.setProperty("--pl-main-right",`${Math.max(0,rect.right-boxes.main.left-boxes.main.width)}px`);
    for(const dock of WORKSPACE_DOCKS){
      const strip=s.groupStrips.get(dock)!;strip.hidden=!displayDocks.includes(dock);const box=wholeBoxes[dock];
      for(const name of ["left","top","width"] as const)strip.style.setProperty(`--pl-group-${name}`,`${box[name]}px`);
      const tabs=openGroupTabs(this.groups,dock).filter(id=>s.groupTabs.has(id));
      tabs.forEach((id,index)=>{const tab=s.groupTabs.get(id)!;if(strip.children[index]!==tab.wrap)strip.insertBefore(tab.wrap,strip.children[index]||null);tab.wrap.hidden=false;const selected=activeGroupTab(state,dock)===id;tab.button.setAttribute("aria-selected",String(selected));tab.button.tabIndex=selected?0:-1;});
      if(!strip.hidden&&!s.layout.isInteracting()){
        const active=activeGroupTab(state,dock),tab=active&&s.groupTabs.get(active),view=strip.getBoundingClientRect(),item=tab?.wrap.getBoundingClientRect();
        if(item&&view.width>0){const delta=item.left<view.left?item.left-view.left:item.right>view.right?Math.min(item.right-view.right,item.left-view.left):0;if(delta)strip.scrollLeft+=delta;}
      }
    }
    for(const [id,tab] of s.groupTabs){const panel=this.groups.panels[id];if(!panel.open||panel.placement==="floating")tab.wrap.hidden=true;}
    for(const pane of s.panes){
      const id=(pane.module||"schedule") as WorkspacePanelId,place=s.layout.getPlacement(id),docked=place!=="floating"&&place!==undefined&&displayDocks.includes(place)&&activeGroupTab(state,place)===id;
      pane.section.classList.toggle("pl-panel-docked",docked);
      const headerClose=pane.title.querySelector<HTMLButtonElement>(`[data-pl-panel-close="${id}"]`);if(headerClose)headerClose.hidden=docked;
      if(docked)for(const [name,value] of Object.entries(boxes[place as PanelDock]))pane.section.style.setProperty(`--pl-dock-${name}`,`${Math.max(0,value)}px`);
      pane.section.classList.toggle("pl-panel-small",pane.module==="classes"&&(place==="floating"||docked)&&pane.section.getBoundingClientRect().width<700);
    }
    s.splitters[0].hidden=true;
    for(const handle of s.splitters.slice(1)){
      const edge=handle.dataset.plDockDivider as "left"|"right",first=displayDocks[0],selectedEdge=first==="left"?"left":"right";
      handle.hidden=displayDocks.length!==2||edge!==selectedEdge;
      const group=edge==="left"?first:displayDocks[1],box=wholeBoxes[group||"main"],other=displayDocks.find(dock=>dock!==group);
      const position=edge==="left"?box.left+box.width:box.left-12;
      Object.assign(handle.style,{left:`${position}px`,top:`${rect.top}px`,width:"12px",height:`${rect.height}px`});
      handle.setAttribute("aria-valuemin",String(group?minimumGroupWidth(state,group):0));handle.setAttribute("aria-valuemax",String(Math.max(0,rect.width-12-(other?minimumGroupWidth(state,other):0))));handle.setAttribute("aria-valuenow",String(Math.round(box.width)));
    }
    s.widenSchedule.hidden=this.groups.panels.schedule.placement!=="right"||displayDocks.length!==2||activeGroupTab(state,"right")!=="schedule"||s.widenSchedule.disabled;
    const plan=s.panes[0].section,titleHeight=s.panes[0].title.getBoundingClientRect().height;
    if(titleHeight&&!s.layout.isHidden("classes")&&!plan.classList.contains("pl-details-only")&&plan.getBoundingClientRect().width>0)this.planHeaderHeight=titleHeight;
    s.detailsFrame.hidden=!this.openDetails.size||s.layout.isHidden("details");
    s.panes[0].section.classList.toggle("pl-details-floating",s.layout.isFloating("details")||s.layout.isHidden("details"));
  }
  private updatePanes():void {
    const s=this.state;if(!s||s.printing())return;
    // Docked panels use viewport coordinates. Apply the navigation width before
    // measuring the deck, otherwise one toggle leaves panels at the old edge.
    s.host.classList.toggle("pl-navigation-collapsed",this.navigationCollapsed);
    this.refreshModulePending();
    if(this.module!=="information"&&!s.panes.some(pane=>pane.module===this.module))this.module="classes";
    if(this.module!=="information"&&!this.showSchedule){
      const panel=this.groups.panels[this.module],active=panel.placement!=="floating"?activeGroupTab(this.groups,panel.placement):null;
      if(!panel.open||(panel.placement!=="floating"&&active!==this.module)){
        const fallback=active||activeGroupTab(this.groups,"main")||WORKSPACE_DOCKS.map(dock=>activeGroupTab(this.groups,dock)).find(Boolean);
        if(fallback==="schedule")this.showSchedule=true;else if(fallback)this.module=fallback;
      }
    }
    const geometry=this.dockGeometry(),activeMain=geometry.activeMain,wide=geometry.wide;
    if(activeMain&&activeMain!=="schedule")this.mainModule=activeMain;
    s.main.classList.toggle("pl-main-empty",activeMain===null);s.host.dataset.plModule=this.module;s.host.classList.remove("pl-show-schedule");
    for(const [module,button] of s.moduleButtons){button.setAttribute("aria-pressed",String(this.module===module&&!s.layout.isHidden(module)));button.classList.toggle("pl-panel-nav-closed",s.layout.isHidden(module));}
    s.scheduleNav.setAttribute("aria-pressed",String(!s.layout.isHidden("schedule")));s.scheduleNav.classList.toggle("pl-panel-nav-closed",s.layout.isHidden("schedule"));
    for(const pane of s.panes){
      if(!pane.opaque&&this.primaryTarget(pane.title,pane.body)?.classList.contains("hidden")&&this.pendingModuleOpen?.pane!==pane)pane.collapsed=true;
      const id=(pane.module||"schedule") as WorkspacePanelId,placement=s.layout.getPlacement(id);
      const visible=!s.layout.isHidden(id)&&(placement==="floating"||(placement!==undefined&&geometry.displayDocks.includes(placement)&&activeGroupTab(geometry.state,placement)===id));
      pane.section.classList.toggle("pl-module-active",visible);
      pane.section.classList.toggle("pl-group-inactive",!visible);
      pane.section.classList.toggle("pl-details-only",pane.module==="classes"&&!visible&&s.layout.isFloating("details")&&!s.layout.isHidden("details")&&this.openDetails.size>0);
      if(!pane.opaque){pane.section.classList.toggle("pl-pane-collapsed",pane.collapsed);pane.section.classList.toggle("pl-pane-open",!pane.collapsed);pane.toggle?.setAttribute("aria-expanded",String(!pane.collapsed));const label=`${pane.collapsed?"Expand":"Collapse"} ${pane.label}`;pane.toggle?.setAttribute("aria-label",label);if(pane.toggle){pane.toggle.title=label;pane.toggle.textContent=pane.collapsed?"›":"⌄";}}
      const available=Math.min(s.doc.defaultView!.innerHeight,pane.section.getBoundingClientRect().bottom)-pane.title.getBoundingClientRect().bottom-12;
      pane.title.style.setProperty("--pl-header-help-height",`${Math.max(60,available)}px`);
    }
    const width=this.currentScheduleWidth();s.deck.style.setProperty("--pl-schedule-width",`${width}px`);
    const splitter=s.splitters[0];splitter.setAttribute("aria-valuemin","420");splitter.setAttribute("aria-valuemax",String(Math.floor(this.maximumScheduleWidth())));splitter.setAttribute("aria-valuenow",String(Math.round(width)));
    splitter.setAttribute("aria-valuetext",`${Math.round(width)} pixels wide`);
    s.widenSchedule.textContent=this.scheduleExpanded?"Restore width":"Widen";
    s.widenSchedule.setAttribute("aria-label",this.scheduleExpanded?"Restore schedule width":"Widen schedule");
    s.widenSchedule.setAttribute("aria-pressed",String(this.scheduleExpanded));
    s.widenSchedule.title=this.scheduleExpanded?"Restore your previous schedule width":"Give the schedule more room. Drag the divider for finer adjustment.";
    s.widenSchedule.disabled=!this.scheduleExpanded&&width>=this.maximumScheduleWidth()-1;
    s.mobileMain.textContent=MODULE_LABELS[this.module];s.mobileMain.setAttribute("aria-pressed",String(!this.showSchedule));s.mobileSchedule.setAttribute("aria-pressed",String(this.showSchedule));
    s.panes[0].section.classList.toggle("pl-has-docked-details",!!this.selected);s.empty.hidden=!!this.selected;
    this.updateDetailsCloseControls();
    this.positionPanels();
    this.positionCalendarTools();
    for(const detail of this.openDetails.values()){
      const concealed=s.layout.isHidden("details")||((s.layout.isHidden("classes")||!s.panes[0].section.classList.contains("pl-module-active"))&&!s.layout.isFloating("details"));
      detail.card.classList.toggle("pl-details-concealed",concealed);detail.trigger?.setAttribute("aria-expanded",String(!concealed));
      detail.card.classList.toggle("pl-details-moving",s.detailsFrame.classList.contains("pl-panel-dragging"));
    }
    s.doc.documentElement.classList.toggle("pl-panel-drag-in-progress",!!s.host.querySelector(".pl-panel-dragging"));
    const mainWidth=s.panes[0].section.getBoundingClientRect().width;
    s.main.dataset.plMainSize=mainWidth>=700?"wide":mainWidth>=560?"medium":"narrow";
    this.positionPreview();this.positionHeaderHelp();const info=geometry.boxes.main;this.introduction.showInformationInWorkspace(geometry.information,new DOMRect(info.left,info.top,info.width,info.height),geometry.information);
    this.settings?.update({selectedPreset:this.activePreset()?.id??null,compact:!geometry.wide,
      defaultLayout:!this.layoutPreset&&!this.scheduleExpanded&&this.scheduleWidth===null&&!Object.keys(this.dockSizes).length&&JSON.stringify(this.groups)===JSON.stringify(createDefaultGroups())});
  }

  private restoreHeaderHelp(node:HTMLElement):void {
    const previous=this.headerHelp.get(node);if(!previous)return;
    if(!previous.hadClass)node.classList.remove("pl-header-help-floating");
    for(const property of previous.properties){if(property.value)node.style.setProperty(property.name,property.value,property.priority);else node.style.removeProperty(property.name);}
    if(!previous.hadStyle&&!node.getAttribute("style"))node.removeAttribute("style");
    this.headerHelp.delete(node);
  }

  private positionHeaderHelp():void {
    const s=this.state,view=s?.doc.defaultView;if(!s||!view||s.printing())return;
    const visible=new Set<HTMLElement>();
    for(const pane of s.panes){
      const shown=!pane.section.classList.contains("pl-group-inactive")&&!pane.section.classList.contains("pl-panel-hidden");
      const popups=shown?[...pane.title.querySelectorAll<HTMLElement>(":scope > .popover.clickover")].filter(node=>!node.hidden&&view.getComputedStyle(node).display!=="none"&&view.getComputedStyle(node).visibility!=="hidden"):[];
      pane.section.classList.toggle("pl-header-help-open",popups.length>0);
      for(const popup of popups){
        visible.add(popup);
        if(!this.headerHelp.has(popup))this.headerHelp.set(popup,{hadStyle:popup.hasAttribute("style"),hadClass:popup.classList.contains("pl-header-help-floating"),properties:["left","top","width","max-height"].map(name=>{name=`--pl-header-help-${name}`;return{name,value:popup.style.getPropertyValue(name),priority:popup.style.getPropertyPriority(name)};})});
        if(!popup.classList.contains("pl-header-help-floating"))popup.classList.add("pl-header-help-floating");
        const bounds=pane.title.getBoundingClientRect(),width=Math.max(0,Math.min(380,view.innerWidth-24,bounds.width-16));
        if(width<=0)continue;
        const left=Math.max(12,Math.min(bounds.left+8,view.innerWidth-width-12)),below=Math.max(0,view.innerHeight-bounds.bottom-16),above=Math.max(0,bounds.top-16);
        const flip=below<120&&above>below,maximum=Math.max(0,Math.min(360,flip?above:below));
        const set=(name:string,value:number)=>{const key=`--pl-header-help-${name}`,text=`${value}px`;if(popup.style.getPropertyValue(key)!==text)popup.style.setProperty(key,text);};
        set("left",left);set("width",width);set("max-height",maximum);
        const height=Math.min(maximum,popup.scrollHeight||popup.getBoundingClientRect().height);
        set("top",Math.max(12,flip?bounds.top-4-height:bounds.bottom+4));
      }
    }
    for(const popup of this.headerHelp.keys())if(!visible.has(popup))this.restoreHeaderHelp(popup);
  }

  private updateDetailsCloseControls():void {
    const s=this.state;if(!s)return;
    const multiple=this.openDetails.size>1;
    const group=s.detailsFrame.querySelector<HTMLButtonElement>('[data-pl-panel-close="details"]');
    if(group){
      group.hidden=!multiple;
      group.setAttribute("aria-label","Close all class details");
      group.title="Close all open details — reopen them with a course's Details button";
    }
    for(const detail of this.openDetails.values()){
      const title=detail.preview.querySelector("h2")?.textContent?.trim()||"this class";
      detail.close.setAttribute("aria-label",multiple?`Close details for ${title}`:"Close details");
      detail.close.title=multiple?`Close only ${title}`:"Close class details";
    }
    this.updateDetailIndex();
  }

  /** Navigate the existing open stack without replacing or concealing native rows. */
  private updateDetailIndex():void {
    const s=this.state;if(!s)return;
    s.detailIndex.hidden=this.openDetails.size<2;
    let index=0;
    for(const detail of this.openDetails.values()){
      if(s.detailIndex.children[index]!==detail.jump)s.detailIndex.insertBefore(detail.jump,s.detailIndex.children[index]||null);
      detail.jump.setAttribute("aria-current",String(detail.card===this.selected));index++;
    }
  }

  private jumpToDetail(card:HTMLElement):void {
    const s=this.state,detail=this.openDetails.get(card);if(!s||!detail)return;
    this.selected=card;this.updateDetailIndex();this.positionPreview();
    const box=s.slot.getBoundingClientRect();
    if(box.height)s.slot.scrollTop=Math.max(0,s.slot.scrollTop+detail.spacer.getBoundingClientRect().top-box.top);
    this.positionPreview();
    const bounds=s.detailIndex.getBoundingClientRect(),button=detail.jump.getBoundingClientRect();
    if(button.left<bounds.left)s.detailIndex.scrollLeft+=button.left-bounds.left;
    else if(button.right>bounds.right)s.detailIndex.scrollLeft+=button.right-bounds.right;
  }

  /** Place the original calendar switches in unused header space when they fit.
   * Their native parents and handlers stay intact; narrow panels keep two rows. */
  private positionCalendarTools():void {
    const s=this.state;if(!s||s.printing())return;
    const pane=s.panes[1],section=pane.section;
    const menu=pane.body.querySelector<HTMLElement>(":scope > #gridDiv > .classPlanner_SectionMenu.plannerMenuLinks.checkboxStateHolder");
    const clear=()=>{
      section.classList.remove("pl-calendar-inline-tools");
      section.querySelectorAll(".pl-calendar-header-tools").forEach(node=>node.classList.remove("pl-calendar-header-tools"));
      for(const name of ["left","top","width"])section.style.removeProperty(`--pl-calendar-tools-${name}`);
    };
    const title=pane.title.querySelector<HTMLElement>("#ctl00_MainContent_toggleGrid"),grip=pane.title.querySelector<HTMLElement>(".pl-panel-grip");
    const bounds=section.getBoundingClientRect(),header=pane.title.getBoundingClientRect();
    if(!menu||!title||!grip||pane.collapsed||s.layout.isHidden("schedule")||bounds.width<=0||header.height<=0){clear();return;}
    const leadingRight=Math.max(title.getBoundingClientRect().right,grip.getBoundingClientRect().right);
    const trailing=[...pane.title.children].filter((node):node is HTMLElement=>node instanceof HTMLElement&&node!==title&&node!==grip&&!node.hidden)
      .map(node=>node.getBoundingClientRect()).filter(box=>box.width>0&&box.height>0);
    const right=Math.min(header.right-12,...trailing.map(box=>box.left-12));
    const left=leadingRight+12,width=right-left;
    if(width<320){clear();return;}
    section.querySelectorAll(".pl-calendar-header-tools").forEach(node=>{if(node!==menu)node.classList.remove("pl-calendar-header-tools");});
    section.classList.add("pl-calendar-inline-tools");menu.classList.add("pl-calendar-header-tools");
    // A new native positioned ancestor changes absolute coordinates. Preserve
    // its ordinary layout instead of overriding an unrecognized container.
    if(menu.offsetParent!==section){clear();return;}
    section.style.setProperty("--pl-calendar-tools-left",`${left-bounds.left-section.clientLeft}px`);
    section.style.setProperty("--pl-calendar-tools-width",`${width}px`);
    const menuHeight=menu.getBoundingClientRect().height;
    // Native switch sets vary by term. Do not squeeze or clip a wider set.
    if(menu.scrollWidth>width+1||menuHeight>header.height-4){clear();return;}
    section.style.setProperty("--pl-calendar-tools-top",`${pane.title.getBoundingClientRect().top-bounds.top-section.clientTop+section.scrollTop+(header.height-menuHeight)/2}px`);
  }

  private summaryChanged(card:HTMLElement):boolean {
    const table=card.querySelector<HTMLTableElement>("table.coursetable"),previous=this.summaries.get(card);
    return !table||!previous||previous.table!==table||!previous.node.isConnected||previous.signature!==JSON.stringify(sectionSummary(table));
  }

  private ensureSummary(course:CourseSnapshot):void {
    const table=course.node.querySelector<HTMLTableElement>("table.coursetable"),host=course.node.querySelector<HTMLElement>(":scope > tr:first-child > td.SubjectAreaName_ClassName");
    if(!table||!host)return;
    const values=sectionSummary(table),signature=JSON.stringify(values),previous=this.summaries.get(course.node);
    if(previous?.table===table&&previous.node.isConnected&&previous.signature===signature)return;
    previous?.node.remove();const summary=host.ownerDocument.createElement("div");summary.className="pl-workspace-course-summary";summary.setAttribute(OWNED,"true");
    for(const fields of values){
      const line=host.ownerDocument.createElement("p");
      fields.forEach((text,index)=>{
        const value=host.ownerDocument.createElement("span"),field=[1,4,5,2][index];
        value.dataset.plSummaryField=String(field);value.textContent=text;
        // Color describes this section only; UCLA's wording and counts remain authoritative.
        if(field===2){const status=formatSectionStatus(text);if(status)value.dataset.plStatusTone=status.tone;}
        line.append(value);
      });
      summary.append(line);
    }
    host.append(summary);this.summaries.set(course.node,{node:summary,table,signature});
  }

  private openPreview(course:CourseSnapshot,trigger:HTMLElement|null,focus=true):void{
    const s=this.state;if(!s||!s.deck.contains(course.node))return;
    const existing=this.openDetails.get(course.node);if(existing){
      if(s.layout.isHidden("details")&&focus){s.layout.showPanel("details");this.selected=course.node;this.updatePanes();this.revealDetailTarget(existing.preview);existing.close.focus({preventScroll:true});}else this.closeDetail(existing);return;
    }
    if(focus)s.layout.showPanel("details");
    if(focus){this.introduction.closeInfo(false);this.closeActions(false);s.extras.open=false;this.module="classes";this.groups=selectWorkspaceTab(this.groups,"classes");this.syncGroupsToPanels();if(s.layout.getPlacement("classes")==="main")this.mainModule="classes";this.showSchedule=false;}
    const pane=s.panes[0];pane.collapsed=false;this.paneChoices.set(pane.title.id,false);this.updatePanes();
    const table=course.node.querySelector<HTMLTableElement>("table.coursetable"),row=course.node.children[2] as HTMLElement,destination=row?.firstElementChild as HTMLElement;
    if(!table||!destination)return;
    let preview=s.preview,head=s.head,close=s.close;
    if(!preview.hidden){
      preview=s.doc.createElement("aside");preview.className="pl-workspace-preview";preview.setAttribute(OWNED,"true");preview.setAttribute("role","region");
      head=s.doc.createElement("div");head.className="pl-workspace-preview-head";
      close=s.doc.createElement("button");close.type="button";close.className="pl-workspace-preview-close";close.textContent="×";close.setAttribute("aria-label","Close details");
      close.addEventListener("click",()=>{const detail=this.openDetails.get(course.node);if(detail)this.closeDetail(detail);});preview.append(close,head);
    }
    preview.setAttribute("aria-label",`Details for ${course.label}`);
    const spacer=s.doc.createElement("div");spacer.className="pl-workspace-detail-space";spacer.setAttribute(OWNED,"true");spacer.setAttribute("aria-hidden","true");s.slot.append(spacer);
    const cards=new SectionCards();cards.table(table);
    const nestedCanScroll=(origin:EventTarget|null,delta:number):boolean=>{
      for(let target=origin instanceof Element?origin:null;target&&target!==row;target=target.parentElement){
        if(target instanceof HTMLElement&&/^(auto|scroll)$/.test(s.doc.defaultView?.getComputedStyle(target).overflowY||"")&&target.scrollHeight>target.clientHeight&&((delta<0&&target.scrollTop>0)||(delta>0&&target.scrollTop+target.clientHeight<target.scrollHeight)))return true;
      }
      return false;
    };
    const wheel=(event:WheelEvent)=>{
      if(event.ctrlKey||event.defaultPrevented||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
      if(nestedCanScroll(event.target,event.deltaY))return;
      // The original body cannot be reparented into the adjacent viewport. Route
      // its scrolling to the same local stack without changing any native action.
      const factor=event.deltaMode===1?20:event.deltaMode===2?s.slot.clientHeight:1;
      if(s.slot.scrollHeight>s.slot.clientHeight){event.preventDefault();s.slot.scrollTop+=event.deltaY*factor;this.positionPreview();}
    };
    let touch:{id:number;x:number;y:number;lastY:number;target:EventTarget|null}|null=null;
    const touchStart=(event:TouchEvent)=>{
      touch=null;
      if(event.touches.length!==1||event.defaultPrevented||(event.target instanceof Element&&event.target.closest("input,select,textarea,[contenteditable=true]")))return;
      const point=event.touches[0];touch={id:point.identifier,x:point.clientX,y:point.clientY,lastY:point.clientY,target:event.target};
    };
    const touchMove=(event:TouchEvent)=>{
      if(event.touches.length!==1){touch=null;return;}
      if(!touch||event.defaultPrevented)return;
      const point=[...event.touches].find(point=>point.identifier===touch!.id);if(!point)return;
      const delta=touch.lastY-point.clientY,travel=touch.y-point.clientY;touch.lastY=point.clientY;
      if(Math.abs(travel)<8||Math.abs(travel)<Math.abs(touch.x-point.clientX)||nestedCanScroll(touch.target,delta))return;
      // A swipe inside a fixed native row must scroll its adjacent stack, not
      // UCLA's document. Taps, editable controls and pinch gestures stay native.
      if(event.cancelable&&s.slot.scrollHeight>s.slot.clientHeight){event.preventDefault();s.slot.scrollTop+=delta;this.positionPreview();}
    };
    const touchEnd=()=>{touch=null;};
    const onFocus=(event:FocusEvent)=>{
      this.selected=course.node;this.updateDetailIndex();
      if(s.layout.isFloating("details"))s.layout.bringToFront("classes");s.layout.bringToFront("details");
      if(event.target instanceof HTMLElement)this.revealDetailTarget(event.target);
    };
    const pointer=()=>{this.selected=course.node;this.updateDetailIndex();if(s.layout.isFloating("details"))s.layout.bringToFront("classes");s.layout.bringToFront("details");};
    const key=(event:KeyboardEvent)=>{
      const target=event.target instanceof Element?event.target:null;
      if(event.defaultPrevented||target?.closest("input,select,textarea,[contenteditable=true]"))return;
      if(!["PageDown","PageUp","Home","End"].includes(event.key))return;
      event.preventDefault();s.slot.scrollTop=event.key==="Home"?0:event.key==="End"?s.slot.scrollHeight:s.slot.scrollTop+(event.key==="PageDown"?1:-1)*s.slot.clientHeight*.85;this.positionPreview();
    };
    const jump=s.doc.createElement("button");jump.className="pl-workspace-detail-jump";jump.setAttribute(OWNED,"true");jump.type="button";jump.textContent=course.label.replace(/^Class\s+\d+:\s*/,"");jump.title=jump.textContent;jump.setAttribute("aria-label",`Show open details for ${jump.textContent}`);
    jump.addEventListener("click",()=>this.jumpToDetail(course.node));
    jump.addEventListener("keydown",event=>{
      if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key)||event.altKey||event.ctrlKey||event.metaKey)return;
      event.preventDefault();const details=[...this.openDetails.values()],index=details.findIndex(detail=>detail.card===course.node);
      const next=event.key==="Home"?0:event.key==="End"?details.length-1:(index+(event.key==="ArrowRight"?1:-1)+details.length)%details.length;
      const target=details[next];if(target){this.jumpToDetail(target.card);target.jump.focus({preventScroll:true});}
    });
    const detail:OpenDetails={card:course.node,table,row,destination,preview,close,spacer,trigger,jump,cards,hadStyle:course.node.hasAttribute("style"),observer:null,wheel,focus:onFocus,pointer,key,touchStart,touchMove,touchEnd};
    this.openDetails.set(course.node,detail);this.selected=course.node;
    trigger?.setAttribute("aria-expanded","true");
    const title=s.doc.createElement("h2");title.textContent=course.label.replace(/^Class\s+\d+:\s*/,"");head.replaceChildren(title);
    const exam=course.node.querySelector(":scope > tr:nth-child(2) .final_exam_info");
    if(exam){
      const disclosure=s.doc.createElement("details"),summary=s.doc.createElement("summary"),line=s.doc.createElement("p");
      summary.textContent="Final exam";line.textContent=officialText(exam);disclosure.append(summary,line);head.append(disclosure);
      disclosure.addEventListener("toggle",()=>this.positionPreview());
    }
    course.node.classList.add("pl-workspace-preview-card","pl-preview-docked");preview.hidden=false;destination.prepend(preview);
    row.addEventListener("wheel",wheel,{passive:false});row.addEventListener("focusin",onFocus);row.addEventListener("pointerdown",pointer);row.addEventListener("keydown",key);
    row.addEventListener("touchstart",touchStart,{passive:true});row.addEventListener("touchmove",touchMove,{passive:false});row.addEventListener("touchend",touchEnd);row.addEventListener("touchcancel",touchEnd);
    if(typeof ResizeObserver!=="undefined"){detail.observer=new ResizeObserver(()=>this.positionPreview());detail.observer.observe(destination);}
    this.updatePanes();
    if(focus){
      const bounds=s.slot.getBoundingClientRect();
      if(bounds.height){s.slot.scrollTop=Math.max(0,s.slot.scrollTop+row.getBoundingClientRect().top-bounds.top);this.positionPreview();}
      close.focus({preventScroll:true});
    }
  }

  private revealInPlan(target:HTMLElement,start:number,end:number):void {
    const s=this.state,view=s?.doc.defaultView;if(!s||!view)return;
    const plan=s.panes[0];
    for(let container=target.parentElement;container&&plan.section.contains(container);container=container.parentElement){
      const overflow=view.getComputedStyle(container).overflowY;
      if(!/^(auto|scroll)$/.test(overflow)||container.clientHeight<=0||container.scrollHeight<=container.clientHeight)continue;
      const bounds=container.getBoundingClientRect();
      const top=Math.max(bounds.top+container.clientTop,container===plan.section?plan.title.getBoundingClientRect().bottom:0)+8;
      const bottom=Math.min(bounds.top+container.clientTop+container.clientHeight,view.innerHeight)-8;
      if(bottom<=top)return;
      const delta=start<top?start-top:end>bottom?Math.min(end-bottom,start-top):0;
      container.scrollTop=Math.max(0,Math.min(container.scrollHeight-container.clientHeight,container.scrollTop+delta));
      return;
    }
  }

  private positionPreview():void {
    const s=this.state;if(!s||s.printing()||!this.openDetails.size||this.positioningDetails)return;
    this.positioningDetails=true;
    try {
      const box=s.slot.getBoundingClientRect(),width=s.slot.clientWidth||box.width;
      // Hidden modules retain their measured stack and scroll extent until they
      // are shown again; a zero-size measurement must not collapse that state.
      if(!box.width||!box.height)return;
      let offset=0;
      for(const detail of this.openDetails.values()){
        const floating=s.layout.isFloating("details");
        detail.card.style.setProperty("--pl-detail-z",s.detailsFrame.classList.contains("pl-panel-dragging")?"226":floating?String(Number(s.detailsFrame.style.getPropertyValue("--pl-panel-z")||130)+1):"108");
        detail.card.style.setProperty("--pl-detail-width",`${Math.max(0,width)}px`);
        const style=s.doc.defaultView?.getComputedStyle(detail.row),padding=(parseFloat(style?.paddingTop||"0")||0)+(parseFloat(style?.paddingBottom||"0")||0);
        const height=Math.max(120,Math.ceil(detail.destination.getBoundingClientRect().height+padding));
        detail.spacer.style.height=`${height+12}px`;
        const top=box.top+offset-s.slot.scrollTop,clipTop=Math.min(height,Math.max(0,box.top-top)),clipBottom=Math.min(height,Math.max(0,top+height-(box.top+box.height)));
        for(const [key,value] of [["left",box.left],["top",top],["height",height],["clip-top",clipTop],["clip-bottom",clipBottom]] as const)detail.card.style.setProperty(`--pl-detail-${key}`,`${value}px`);
        offset+=height+12;
      }
    } finally {this.positioningDetails=false;}
  }

  private revealDetailTarget(target:HTMLElement):void {
    const s=this.state;if(!s)return;
    // Focus can arrive before the scroll event updates the projected native row.
    // Measure the control only after aligning it to the stack's current scroll.
    this.positionPreview();
    const box=s.slot.getBoundingClientRect(),rect=target.getBoundingClientRect();
    if(!rect.height||!box.height)return;
    const shift=rect.top<box.top?rect.top-box.top:rect.bottom>box.bottom?rect.bottom-box.bottom:0;
    if(shift){s.slot.scrollTop=Math.max(0,s.slot.scrollTop+shift);this.positionPreview();}
  }

  private closeDetail(detail:OpenDetails,focus=true):void {
    detail.observer?.disconnect();detail.row.removeEventListener("wheel",detail.wheel);detail.row.removeEventListener("focusin",detail.focus);detail.row.removeEventListener("pointerdown",detail.pointer);detail.row.removeEventListener("keydown",detail.key);
    detail.row.removeEventListener("touchstart",detail.touchStart);detail.row.removeEventListener("touchmove",detail.touchMove);detail.row.removeEventListener("touchend",detail.touchEnd);detail.row.removeEventListener("touchcancel",detail.touchEnd);
    detail.cards.restore();detail.trigger?.setAttribute("aria-expanded","false");
    detail.card.classList.remove("pl-workspace-preview-card","pl-preview-inline","pl-preview-docked","pl-details-concealed","pl-details-moving");
    for(const name of ["left","top","width","height","clip-top","clip-bottom","z"])detail.card.style.removeProperty(`--pl-detail-${name}`);
    if(!detail.hadStyle&&!detail.card.getAttribute("style"))detail.card.removeAttribute("style");
    this.openDetails.delete(detail.card);detail.spacer.remove();detail.jump.remove();
    const s=this.state;
    if(s&&detail.preview===s.preview){s.preview.hidden=true;s.slot.prepend(s.preview);}else detail.preview.remove();
    if(this.selected===detail.card)this.selected=[...this.openDetails.keys()].at(-1)||null;
    if(s){s.panes[0].section.classList.toggle("pl-has-docked-details",!!this.openDetails.size);s.empty.hidden=!!this.openDetails.size;s.detailsFrame.hidden=!this.openDetails.size||s.layout.isHidden("details");this.updateDetailsCloseControls();this.positionPreview();}
    if(focus)this.returnDetailsFocus(detail.trigger);
  }

  private returnDetailsFocus(trigger:HTMLElement|null):void {
    const s=this.state;if(!s||!trigger?.isConnected)return;
    const visible=!s.layout.isHidden("classes")&&s.panes[0].section.classList.contains("pl-module-active")&&!(this.showSchedule&&s.doc.defaultView!.innerWidth<1100);
    const target=visible?trigger:s.moduleButtons.get(s.layout.isHidden("classes")?"classes":this.module)||s.moduleButtons.get("classes");target?.focus({preventScroll:true});
  }

  closePreview(focus=true):void{
    const current=this.selected&&this.openDetails.get(this.selected);
    for(const detail of this.openDetails.values())this.closeDetail(detail,false);
    if(focus&&current)this.returnDetailsFocus(current.trigger);
  }

  restore():void{
    this.settings?.destroy();this.settings=null;
    this.clearModulePending();
    for(const host of this.actionControls.keys())this.removeActions(host);
    for(const summary of this.summaries.values())summary.node.remove();this.summaries.clear();
    this.useOriginal=false;this.returnButton?.remove();this.returnButton=null;this.browser.restore();this.introduction.restore();
    const intro = this.introductionOnly; this.introductionOnly = null;
    if (intro) {
      for (const event of ["resize", "scroll", "focus", "pageshow", "load"]) intro.doc.defaultView?.removeEventListener(event, intro.resize);
      intro.doc.removeEventListener("visibilitychange", intro.resize); intro.doc.removeEventListener("keydown", intro.key);
      intro.toolbar.remove(); intro.doc.documentElement.classList.remove("pl-intro-page");
    }
    const s=this.state;if(!s)return;s.helpObserver.disconnect();s.navEnd();s.end();this.restoreGestureChoices();s.layout.restore();this.closePreview(false);s.slot.removeEventListener("scroll",s.detailsScroll);s.panes[1].section.removeEventListener("scroll",s.calendarScroll);s.actionObserver.disconnect();s.doc.removeEventListener("click",s.actionClick);
    s.doc.removeEventListener("pointermove",s.navMove);s.doc.removeEventListener("pointerup",s.navEnd);s.doc.removeEventListener("pointercancel",s.navEnd);s.doc.defaultView?.removeEventListener("blur",s.navEnd);
    this.dragPresentation="";
    for(const record of this.planSurfaces.values())this.restorePlanSurface(record);this.planSurfaces.clear();this.activePlanSurface=null;this.pendingPlanAction=null;
    this.state=null;this.drag=null;s.widenSchedule.remove();for(const popup of this.headerHelp.keys())this.restoreHeaderHelp(popup);
    s.doc.defaultView?.removeEventListener("beforeprint",s.beforePrint);s.doc.defaultView?.removeEventListener("afterprint",s.afterPrint);s.stopPrint();s.afterPrint();
    s.doc.defaultView?.removeEventListener("resize",s.resize);s.doc.defaultView?.removeEventListener("scroll",s.resize);s.extras.removeEventListener("toggle",s.resize);s.doc.removeEventListener("keydown",s.key);
    s.doc.defaultView?.removeEventListener("focus",s.resize);s.doc.defaultView?.removeEventListener("pageshow",s.resize);s.doc.defaultView?.removeEventListener("load",s.resize);s.doc.removeEventListener("visibilitychange",s.resize);
    s.doc.removeEventListener("pointermove",s.move);s.doc.removeEventListener("pointerup",s.end);s.doc.removeEventListener("pointercancel",s.end);s.doc.defaultView?.removeEventListener("blur",s.end);
    for(const pane of s.panes){
      pane.title.querySelectorAll(".pl-panel-grip,.pl-panel-close").forEach(node=>node.remove());pane.section.classList.remove("pl-panel-docked","pl-panel-small","pl-details-only","pl-details-floating","pl-calendar-inline-tools","pl-group-inactive","pl-header-help-open");
      pane.section.querySelectorAll(".pl-calendar-header-tools").forEach(node=>node.classList.remove("pl-calendar-header-tools"));
      for(const name of ["left","top","width"])pane.section.style.removeProperty(`--pl-calendar-tools-${name}`);
      for(const name of ["left","top","width","height"])pane.section.style.removeProperty(`--pl-dock-${name}`);
      if(!pane.sectionHadStyle&&!pane.section.getAttribute("style"))pane.section.removeAttribute("style");
      pane.title.removeEventListener("click",pane.click,true);pane.toggle?.remove();pane.title.classList.remove("pl-pane-title");if(!pane.opaque)pane.body.classList.remove("pl-pane-body");
      pane.title.style.removeProperty("--pl-header-help-height");if(!pane.titleHadStyle&&!pane.title.getAttribute("style"))pane.title.removeAttribute("style");
      if(!pane.bodyHadClass&&!pane.body.getAttribute("class"))pane.body.removeAttribute("class");pane.section.classList.remove("pl-pane-open","pl-pane-collapsed","pl-module-active","pl-has-docked-details");
    }
    for(const {node,anchor,menu} of [...s.placements].reverse()){
      // A native partial update can replace the panel inside our shell. Restore
      // that live replacement, never revive the now-disconnected old panel.
      const current=menu?this.currentPlanMenu(s):node.isConnected?node:node.id?s.doc.getElementById(node.id):null;
      if(anchor.isConnected&&current)anchor.replaceWith(current);else anchor.remove();
    }
    PRIMARY.forEach(([, ,cls])=>s.doc.querySelectorAll(`.${cls}`).forEach(n=>n.classList.remove(cls)));
    for(const cleanup of this.courseTargets.values())cleanup();this.courseTargets.clear();
    s.preview.remove();s.detailsFrame.remove();s.deck.remove();s.shell.remove();s.top.remove();s.position.remove();s.scrollRoom.remove();["--pl-workspace-top","--pl-workspace-left","--pl-workspace-width","--pl-notice-count","--pl-workspace-flow-offset"].forEach(p=>s.host.style.removeProperty(p));
    if(!s.hostHadStyle&&!s.host.getAttribute("style"))s.host.removeAttribute("style");s.host.classList.remove("pl-workspace-host","pl-workspace-flow","pl-task-plan","pl-task-find","pl-show-schedule","pl-workspace-empty-plan","pl-navigation-collapsed","pl-grouped-workspace");delete s.host.dataset.plModule;delete s.host.dataset.plGroupsCompact;s.doc.documentElement.classList.remove("pl-workspace-page","pl-panel-drag-in-progress");
  }
}

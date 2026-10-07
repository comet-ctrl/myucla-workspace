const OWNED = "data-planner-lift-owned";
const TERM = "ctl00_MainContent_termSessionChooser_TermChooser";
const composedParent = (node: Node): Node | null => node.parentNode || (node instanceof ShadowRoot ? node.host : null);
const inComposedTree = (root: Node, value: EventTarget | null): boolean => {
  let node = value instanceof Node ? value : null;
  for (let depth = 0; node && depth < 128; depth++, node = composedParent(node)) if (node === root) return true;
  return false;
};
interface WorkspaceInformation {
  navigation: HTMLElement;
  onInformation: () => void;
  onCloseInformation: () => void;
}
interface Introduction {
  doc: Document; layout: HTMLElement; title: HTMLElement; description: HTMLElement; text: HTMLElement;
  anchor: Comment; about: HTMLDetailsElement; term: HTMLElement; label: HTMLLabelElement;
  sidebar: HTMLElement; header: HTMLButtonElement; info: HTMLButtonElement; close: HTMLButtonElement; notices: HTMLElement[];
  sidebarHadClass: boolean; sidebarHadStyle: boolean; layoutHadClass: boolean; noticeHadClass: boolean[];
  focus: (event: FocusEvent) => void;
  masthead: HTMLElement | null; edge: HTMLButtonElement | null; onLayout: () => void; cleanupReveal: () => void;
  workspace?: WorkspaceInformation;
  beforePrint: () => void; afterPrint: () => void;
}

/** Compact only the recorded planner introduction; never touch UCLA's header. */
export class PlannerIntroduction {
  private state: Introduction | null = null;
  private compactHeader = false;
  private saveFailed = false;
  private saveSequence = 0;
  private pendingSave: Promise<void> = Promise.resolve();
  private headerRevealed = false;
  private headerLatched = false;
  private headerMotion: {target: number; timer: number} | null = null;

  constructor(private readonly onHeaderChange: (compact: boolean) => void | Promise<void> = () => {}) {}

  setHeaderCompact(compact: boolean): void {
    this.stopHeaderMotion(); this.headerRevealed = false;this.headerLatched=false;
    this.compactHeader = compact; this.positionHeader(); this.positionInfo();
  }

  isHeaderCompact(): boolean { return this.compactHeader && !this.headerRevealed; }

  /** Measure native header/menu surfaces only, including open shadow roots. */
  headerClearance(): number {
    const s=this.state,view=s?.doc.defaultView;if(!s?.masthead||!view||this.isHeaderCompact())return 0;
    let bottom=Math.max(0,s.masthead.getBoundingClientRect().bottom,s.term.getBoundingClientRect().bottom+8,s.title.getBoundingClientRect().bottom+8),count=0;
    const roots:(HTMLElement|ShadowRoot)[]=[s.masthead];if(s.masthead.shadowRoot)roots.push(s.masthead.shadowRoot);
    for(let index=0;index<roots.length&&count<2048;index++)for(const node of roots[index].querySelectorAll('*')){
      if(++count>2048)break;
      if(node.shadowRoot&&roots.length<32)roots.push(node.shadowRoot);
      if(!node.getClientRects().length||view.getComputedStyle(node).visibility!=="visible")continue;
      bottom=Math.max(bottom,node.getBoundingClientRect().bottom);
    }
    return bottom+(this.headerLatched||!this.compactHeader?32:0);
  }

  private stopHeaderMotion(): void {
    if (this.headerMotion) this.state?.doc.defaultView?.clearTimeout(this.headerMotion.timer);
    this.headerMotion = null;
  }

  private compactTop(): number {
    const s = this.state, view = s?.doc.defaultView;
    return s && view ? Math.max(0, view.scrollY + s.title.getBoundingClientRect().top - 12) : 0;
  }

  private isHeaderAtCompactPosition(): boolean {
    const s = this.state;
    return this.compactHeader || this.headerRevealed || !!(s && (s.doc.defaultView?.scrollY || 0) > 0 && s.title.getBoundingClientRect().top <= 13);
  }

  /** Scroll the untouched native header; never replay a navigation action. */
  private moveHeader(top: number): void {
    const s = this.state, view = s?.doc.defaultView; if (!s || !view) return;
    this.stopHeaderMotion();
    const motion = {target: top, timer: 0}; this.headerMotion = motion;
    const finish = () => {
      if (this.headerMotion !== motion || this.state !== s) return;
      this.stopHeaderMotion(); this.positionHeader(); this.positionInfo(); s.onLayout();
    };
    // One bounded fallback for browsers without scrollend; there is no polling.
    motion.timer = view.setTimeout(finish, 800);
    const reduced = view.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    view.scrollTo({top, behavior: reduced ? "instant" : "smooth"});
    this.positionInfo(); s.onLayout();
  }

  private revealHeader(): void {
    if (!this.state?.masthead || !this.isHeaderAtCompactPosition() || this.headerRevealed) return;
    this.headerRevealed = true; this.moveHeader(0);
  }

  private concealHeader(returnFocus = false): void {
    const s = this.state; if (!s || !this.headerRevealed) return;
    this.headerRevealed = false;this.headerLatched=false;
    if (returnFocus && s.header.isConnected) s.header.focus({preventScroll: true});
    this.moveHeader(this.compactTop());
  }

  private bindHeaderReveal(s: Introduction): () => void {
    const {doc, masthead, edge} = s, view = doc.defaultView;
    if (!masthead || !edge || !view) return () => {};
    let hovering = false, leaveTimer = 0, heldPointer: number | null = null, suppressHover = false;
    let pointerX: number | null = null, pointerY = 0;
    const locatePointer = (event: PointerEvent) => {
      if (event.pointerType !== "touch") { pointerX = event.clientX; pointerY = event.clientY; }
    };
    const pointerAtEdge = () => {
      if (pointerX === null) return false;
      const bounds = edge.getBoundingClientRect();
      return pointerX >= bounds.left && pointerX <= bounds.right && pointerY >= bounds.top && pointerY <= bounds.bottom;
    };
    const cancelLeave = () => { view.clearTimeout(leaveTimer); leaveTimer = 0; };
    const contains = (node: EventTarget | null) => inComposedTree(masthead, node) || inComposedTree(edge, node);
    let observedRoots: (HTMLElement | ShadowRoot)[] = [];
    const rendered = (element: Element): boolean => {
      let node: Node | null = element;
      for (let depth = 0; node && depth < 128; depth++, node = composedParent(node)) {
        if (node instanceof Element) {
          const style = view.getComputedStyle(node);
          if (node.hasAttribute("hidden") || style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") return false;
        }
        if (node === masthead) return true;
      }
      return false;
    };
    const menuOpen = () => {
      // UCLA's native masthead uses nested web components. Inspect only bounded
      // presentation state in their open roots, never labels or field values.
      const roots: (HTMLElement | ShadowRoot)[] = [masthead], candidates: Element[] = [];
      let count = 0, truncated = false;
      for (let index = 0; index < roots.length && count <= 2048; index++) {
        const root = roots[index], walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
        let node = root instanceof Element ? root : walker.nextNode() as Element | null;
        while (node) {
          if (++count > 2048) { truncated = true; break; }
          if (node.shadowRoot) {
            if (roots.length < 32) roots.push(node.shadowRoot); else truncated = true;
          }
          if (node.matches('[aria-expanded="true"],details[open],[role="menu"]')) candidates.push(node);
          node = walker.nextNode() as Element | null;
        }
      }
      if (roots.length !== observedRoots.length || roots.some((root, index) => observedRoots[index] !== root)) {
        observer.disconnect();
        for (const root of roots) observer.observe(root, {subtree: true, childList: true, attributes: true, attributeFilter: ["aria-expanded", "open", "hidden", "class", "style"]});
        observedRoots = roots;
      }
      // An unexpectedly huge native header stays accessible until an explicit
      // dismissal instead of concealing an uninspected menu.
      for(const menu of candidates)resizeObserver?.observe(menu);
      return truncated || candidates.some(menu => rendered(menu) && (menu.matches('[aria-expanded="true"],details[open]') || menu.getClientRects().length > 0));
    };
    const scheduleLeave = () => {
      cancelLeave(); if (this.headerLatched || !this.headerRevealed || heldPointer !== null) return;
      leaveTimer = view.setTimeout(() => {
        leaveTimer = 0;
        if (this.state === s && heldPointer === null && !hovering && !contains(doc.activeElement) && !menuOpen()) this.concealHeader();
      }, 280);
    };
    const enter = (event: PointerEvent) => {
      locatePointer(event);
      if (event.pointerType === "touch" || event.buttons || suppressHover) return;
      // Hover only exposes the owned affordance via CSS. Opening the native
      // header requires a click, or focus entering the native navigation.
      hovering = true; cancelLeave();
    };
    const leave = (event: PointerEvent) => {
      locatePointer(event);
      // Leaving the browser viewport is a deliberate departure too. A layout
      // change underneath a stationary pointer has another element as target.
      if (event.relatedTarget === null && (event.clientY <= 0 || event.clientX <= 0 || event.clientX >= view.innerWidth || event.clientY >= view.innerHeight)) suppressHover = false;
      hovering = contains(event.relatedTarget); if (!hovering) scheduleLeave();
    };
    const pointerMove = (event: PointerEvent) => {
      locatePointer(event);
      if (!suppressHover || event.pointerType === "touch") return;
      if (!pointerAtEdge()) suppressHover = false;
    };
    const click = (event: MouseEvent) => { if (this.state === s) {
      if(!this.compactHeader){s.header.click();return;}
      if(this.headerRevealed){this.concealHeader(true);return;}
      // Pointer activation must not leave focus on the now-hidden tab and
      // indefinitely prevent the usual leave dismissal. Keyboard keeps focus.
      if (event.detail > 0) edge.blur();
      suppressHover = false; cancelLeave();this.headerLatched=true; this.revealHeader();
    } };
    const focusOut = () => scheduleLeave();
    const pointerDown = (event: PointerEvent) => {
      locatePointer(event);
      if (event.button !== 0 || event.isPrimary === false) return;
      heldPointer = event.pointerId ?? 0; cancelLeave();
    };
    const pointerEnd = (event: PointerEvent) => {
      if (heldPointer !== (event.pointerId ?? 0)) return;
      heldPointer = null; scheduleLeave();
    };
    const blur = () => { heldPointer = null; scheduleLeave(); };
    const outsideClick = (event: MouseEvent) => {
      if (this.headerLatched || event.button !== 0 || !this.headerRevealed || contains(event.target) || event.target === s.header) return;
      cancelLeave(); hovering = false;
      // Wait until the target's click handler has run. Moving the workspace on
      // pointerdown can move a native button away before its click completes.
      this.concealHeader(contains(doc.activeElement));
    };
    const key = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || (!this.headerRevealed&&this.compactHeader)) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('dialog[open],[role="dialog"],.ui-dialog') && !contains(target)) return;
      if(!this.compactHeader&&!contains(event.target))return;
      if(!this.compactHeader){s.header.click();event.preventDefault();return;}
      // Escape scrolls the edge back under the same pointer. Its resulting
      // pointerenter is layout-generated, not a fresh request to reopen.
      // Measure after focus return: the keyboard-focused edge is a taller
      // labeled button, while its normal pointer sensor is only the top strip.
      if (s.header.isConnected) s.header.focus({preventScroll: true});
      suppressHover = pointerAtEdge(); cancelLeave(); hovering = false; this.concealHeader(); event.preventDefault();
    };
    const scrollEnd = () => {
      if (!this.headerMotion || Math.abs(view.scrollY - this.headerMotion.target) > 1) return;
      this.stopHeaderMotion(); this.positionHeader(); this.positionInfo(); s.onLayout();
    };
    const observer = new MutationObserver(() => { menuOpen();s.onLayout();if (!hovering) scheduleLeave(); });
    const resizeObserver=typeof view.ResizeObserver==="function"?new view.ResizeObserver(()=>s.onLayout()):null;
    resizeObserver?.observe(masthead);
    menuOpen();
    for (const node of [masthead, edge]) {
      node.addEventListener("pointerenter", enter); node.addEventListener("pointerleave", leave);
      node.addEventListener("focusout", focusOut);
    }
    edge.addEventListener("click", click); doc.addEventListener("keydown", key); doc.addEventListener("click", outsideClick);
    doc.addEventListener("pointerdown", pointerDown, true); doc.addEventListener("pointerup", pointerEnd, true); doc.addEventListener("pointercancel", pointerEnd, true);
    doc.addEventListener("pointermove", pointerMove, true);
    const wheel = () => { this.stopHeaderMotion(); };
    view.addEventListener("wheel", wheel, {passive:true});
    view.addEventListener("scrollend", scrollEnd); view.addEventListener("blur", blur);
    return () => {
      cancelLeave(); observer.disconnect();resizeObserver?.disconnect(); this.stopHeaderMotion();
      for (const node of [masthead, edge]) {
        node.removeEventListener("pointerenter", enter); node.removeEventListener("pointerleave", leave);
        node.removeEventListener("focusout", focusOut);
      }
      edge.removeEventListener("click", click); doc.removeEventListener("keydown", key); doc.removeEventListener("click", outsideClick);
      doc.removeEventListener("pointerdown", pointerDown, true); doc.removeEventListener("pointerup", pointerEnd, true); doc.removeEventListener("pointercancel", pointerEnd, true);
      doc.removeEventListener("pointermove", pointerMove, true);
      view.removeEventListener("wheel", wheel);
      view.removeEventListener("scrollend", scrollEnd); view.removeEventListener("blur", blur);
    };
  }

  private saveChoice(compact: boolean): void {
    const sequence = ++this.saveSequence; this.saveFailed = false;
    this.pendingSave = this.pendingSave.catch(() => {}).then(() => this.onHeaderChange(compact));
    this.pendingSave.then(() => {
      if (sequence === this.saveSequence) { this.saveFailed = false; this.positionInfo(); }
    }).catch(() => {
      if (sequence === this.saveSequence) { this.saveFailed = true; this.positionInfo(); }
    });
  }

  needsRefresh(doc: Document): boolean {
    const s = this.state;
    return !!s && (doc.getElementById("layoutContentArea") !== s.layout ||
      doc.getElementById("div_page_title_section2") !== s.description ||
      doc.getElementById("titleText") !== s.title || !s.header.isConnected ||
      doc.getElementById("page_title_text") !== s.text || !s.info.isConnected ||
      (s.masthead && !s.masthead.isConnected) || (s.edge && !s.edge.isConnected) ||
      !s.sidebar.isConnected || doc.getElementById(TERM)?.parentElement !== s.label.parentElement);
  }

  mount(doc: Document, toolbar: HTMLElement, onLayout: () => void, workspace?: WorkspaceInformation): boolean {
    if (this.state) return true;
    const layout = doc.getElementById("layoutContentArea"), title = doc.getElementById("titleText");
    const description = doc.getElementById("div_page_title_section2"), text = doc.getElementById("page_title_text");
    const main = doc.getElementById("main-content"), term = doc.getElementById("ctl00_MainContent_termSessionChooser");
    const select = doc.getElementById(TERM) as HTMLSelectElement | null;
    const columns = main?.parentElement, sidebars = columns?.querySelectorAll<HTMLElement>(":scope > right-sidebar");
    const sidebar = sidebars?.length === 1 ? sidebars[0] : null;
    if (!main || !layout?.matches("section#layoutContentArea") || title?.parentElement !== layout || title.tagName !== "H2" ||
      title.textContent?.trim() !== "Class Planner" || description?.parentElement !== layout ||
      description.children.length !== 1 || text?.parentElement !== description || text.tagName !== "DIV" ||
      text.querySelector("input,select,button,textarea,script,iframe") || columns?.parentElement !== layout ||
      !columns.matches("layout-columnwrapper.col-2MR") || !sidebar || !term || term.parentElement !== main ||
      term.children.length !== 2 || !term.children[0].matches("div.term_display") ||
      !term.children[1].matches("div.term") || select?.tagName !== "SELECT" ||
      select.parentElement !== term.children[1] || select.form !== doc.getElementById("aspnetForm") ||
      term.querySelectorAll("input,select,button,textarea").length !== 1) return false;

    const owned = <T extends HTMLElement>(e: T, cls: string): T => {
      e.className = cls; e.setAttribute(OWNED, "true"); return e;
    };
    const anchor = doc.createComment("planner-lift-introduction"); text.before(anchor);
    // This wrapper contains native text/links and deliberately is not owned.
    const about = doc.createElement("details"); about.className = "pl-intro-about";
    const summary = owned(doc.createElement("summary"), ""); summary.textContent = "About this planner";
    about.append(summary, text); description.append(about);
    about.addEventListener("toggle", onLayout);
    const label = owned(doc.createElement("label"), "pl-intro-term-label"); label.htmlFor = TERM; label.textContent = "Term";
    select.before(label);
    const header = owned(doc.createElement("button"), "pl-intro-header-toggle"); header.type = "button";
    toolbar.append(header);
    const mastheads = doc.querySelectorAll<HTMLElement>("layout-headerwrap");
    const masthead = mastheads.length === 1 && !mastheads[0].contains(layout) ? mastheads[0] : null;
    const edge = masthead ? owned(doc.createElement("button"), "pl-intro-header-edge") : null;
    if (edge) {
      edge.type = "button"; edge.textContent = "UCLA menu";
      edge.setAttribute("aria-label", "Show UCLA header temporarily"); edge.setAttribute("aria-expanded", "false");
      edge.title = "Reveal UCLA's menu. Move away to return to your planner.";
      doc.body.append(edge);
    }
    const info = owned(doc.createElement("button"), "pl-intro-info"); info.type = "button";
    info.textContent = workspace ? "Information & help" : "Links & help"; info.setAttribute("aria-expanded", "false");
    info.title = "Planner links, enrollment appointments and help";
    if(workspace){info.dataset.plModule="information";info.setAttribute("aria-pressed","false");workspace.navigation.prepend(info);}else toolbar.append(info);
    const close = owned(doc.createElement("button"), "pl-intro-info-close"); close.type = "button";
    close.textContent = "×"; close.setAttribute("aria-label", "Close links and help"); sidebar.prepend(close);
    const notices = [...main.children].filter((e): e is HTMLElement => e instanceof HTMLElement &&
      e.tagName === "DIV" && !e.id && !e.className && !e.querySelector("input,select,button,a,textarea,script,iframe") &&
      [...e.children].every(c => ["SPAN", "STRONG", "BR"].includes(c.tagName)));
    const noticeHadClass = notices.map(e => e.hasAttribute("class"));
    const sidebarHadClass = sidebar.hasAttribute("class"), sidebarHadStyle = sidebar.hasAttribute("style"), layoutHadClass = layout.hasAttribute("class");
    notices.forEach(e => e.classList.add("pl-intro-notice"));
    layout.classList.add("pl-planner-introduction"); term.classList.add("pl-intro-term"); sidebar.classList.add("pl-intro-sidebar");
    // Keyboard navigation to the untouched UCLA menu must remain reachable.
    const focus = (event: FocusEvent) => {
      if (!masthead || !inComposedTree(masthead, event.target)) return;
      this.revealHeader();
    };
    // Chromium suppresses closed details descendants even when print CSS asks
    // for display:block. Expose the original introduction only while printing.
    let printChoice:boolean|null=null;
    const beforePrint=()=>{if(printChoice===null)printChoice=about.open;about.open=true;};
    const afterPrint=()=>{if(printChoice!==null){about.open=printChoice;printChoice=null;}};
    this.state = {doc, layout, title, description, text, anchor, about, term, label, sidebar, header, info, close, notices,
      sidebarHadClass, sidebarHadStyle, layoutHadClass, noticeHadClass, focus, workspace, beforePrint, afterPrint,
      masthead, edge, onLayout, cleanupReveal: () => {}};
    this.state.cleanupReveal = this.bindHeaderReveal(this.state);
    doc.addEventListener('focusin', focus);
    doc.defaultView?.addEventListener('beforeprint',beforePrint);doc.defaultView?.addEventListener('afterprint',afterPrint);
    header.addEventListener("click", () => {
      const s = this.state, view = doc.defaultView; if (!view || s?.header !== header) return;
      // Scroll the original banner away; never hide, move or restyle its menu.
      // Stop at the title so the term selector and notices remain accessible.
      const compact = !this.isHeaderAtCompactPosition();
      this.compactHeader = compact; this.headerRevealed = false;this.headerLatched=false;
      this.moveHeader(compact ? this.compactTop() : 0);
      this.saveChoice(compact);
      header.focus({preventScroll: true});
    });
    info.addEventListener("click", () => {
      if(workspace){workspace.onInformation();return;}
      if (sidebar.classList.contains("pl-intro-sidebar-open")) { this.closeInfo(); return; }
      sidebar.classList.add("pl-intro-sidebar-open"); info.setAttribute("aria-expanded", "true");
      this.positionInfo(); close.focus({preventScroll: true});
    });
    close.addEventListener("click", () => {if(workspace)workspace.onCloseInformation();else this.closeInfo();});
    this.positionInfo();
    return true;
  }

  positionHeader(): void {
    const s = this.state, view = s?.doc.defaultView;
    if (!s || !view || this.headerMotion || s.doc.visibilityState === 'hidden') return;
    if (this.headerRevealed||!this.compactHeader) {
      if (this.headerLatched||!this.compactHeader) {
        // Keep a fully fitting header visible. Oversized native menus retain
        // only the root travel needed to reach their bottom and close control.
        const maxScroll = Math.max(0, view.scrollY + this.headerClearance() - view.innerHeight);
        if (view.scrollY > maxScroll + 1) view.scrollTo({top: maxScroll, behavior: 'instant'});
      }
      return;
    }
    const top = s.title.getBoundingClientRect().top;
    // Keep the saved compact view when native navigation resets root scrolling.
    // Keep compact root alignment; panels retain their independent scrolling.
    if (Math.abs(top-12)>1) view.scrollTo({top: this.compactTop(), behavior: 'instant'});
  }

  positionInfo(): void {
    const s = this.state; if (!s) return;
    const compact = this.isHeaderAtCompactPosition();
    s.doc.documentElement.classList.toggle("pl-header-compact", compact);
    s.doc.documentElement.classList.toggle("pl-header-revealed", this.headerRevealed);
    const open=!this.compactHeader||this.headerRevealed;
    s.doc.documentElement.classList.toggle("pl-header-latched",!this.compactHeader||this.headerLatched&&this.headerRevealed);
    if(open)s.edge?.style.setProperty('--pl-header-edge-top',`${Math.max(0,Math.min(s.doc.defaultView!.innerHeight-32,this.headerClearance()-32))}px`);
    else s.edge?.style.removeProperty('--pl-header-edge-top');
    if (s.edge) { s.edge.hidden = false;s.edge.textContent=open?"Hide UCLA menu":"UCLA menu";s.edge.title=open?"Click to hide UCLA's menu, or press Escape.":"Click to show UCLA's menu.";s.edge.setAttribute("aria-label",open?"Hide UCLA header":"Show UCLA header temporarily"); s.edge.setAttribute("aria-expanded", String(open)); }
    s.header.textContent = compact ? "Show header" : "Compact header";
    s.header.setAttribute("aria-pressed", String(compact));
    s.header.title = this.saveFailed ? "Could not save the header preference. Try again." : compact ? "Show UCLA's menu and stop keeping the header compact" : "Keep UCLA's banner out of view across terms and reloads";
    if (s.workspace || !s.sidebar.classList.contains("pl-intro-sidebar-open")) return;
    const top = Math.max(12, Math.min(s.doc.defaultView!.innerHeight - 160, s.info.getBoundingClientRect().bottom + 8));
    s.sidebar.style.setProperty("--pl-info-top", `${Math.ceil(top)}px`);
  }

  /** Visually place the original sidebar in the main workspace without reparenting it. */
  showInformationInWorkspace(active: boolean, bounds: DOMRect, selected=active): void {
    const s=this.state;if(!s?.workspace)return;
    s.sidebar.classList.toggle("pl-intro-sidebar-open",active);
    s.sidebar.classList.add("pl-intro-sidebar-workspace");
    s.info.setAttribute("aria-expanded",String(active));s.info.setAttribute("aria-pressed",String(selected));
    for(const [key,value] of [["left",bounds.left],["top",bounds.top],["width",bounds.width],["height",bounds.height]] as const)s.sidebar.style.setProperty(`--pl-info-${key}`,`${Math.max(0,value)}px`);
  }

  closeInfo(focus = true): boolean {
    const s = this.state; if (!s?.sidebar.classList.contains("pl-intro-sidebar-open")) return false;
    s.sidebar.classList.remove("pl-intro-sidebar-open"); s.info.setAttribute("aria-expanded", "false");
    if(s.workspace)s.info.setAttribute("aria-pressed","false");
    if (focus && s.info.isConnected) s.info.focus({preventScroll: true}); return true;
  }

  restore(): void {
    const s = this.state; if (!s) return;
    s.cleanupReveal(); this.headerRevealed = false; this.state = null;
    s.doc.documentElement.classList.remove("pl-header-compact", "pl-header-revealed","pl-header-latched");this.headerLatched=false; s.edge?.remove();
    s.doc.removeEventListener('focusin', s.focus);
    s.doc.defaultView?.removeEventListener('beforeprint',s.beforePrint);s.doc.defaultView?.removeEventListener('afterprint',s.afterPrint);s.afterPrint();
    s.layout.classList.remove("pl-planner-introduction"); s.term.classList.remove("pl-intro-term");
    s.sidebar.classList.remove("pl-intro-sidebar", "pl-intro-sidebar-open", "pl-intro-sidebar-workspace");
    if (!s.layoutHadClass && !s.layout.className) s.layout.removeAttribute("class");
    if (!s.sidebarHadClass && !s.sidebar.className) s.sidebar.removeAttribute("class");
    for(const name of ["left","top","width","height"])s.sidebar.style.removeProperty(`--pl-info-${name}`); if (!s.sidebarHadStyle && !s.sidebar.getAttribute("style")) s.sidebar.removeAttribute("style");
    s.notices.forEach((e,i) => {e.classList.remove("pl-intro-notice"); if (!s.noticeHadClass[i] && !e.className) e.removeAttribute("class");});
    // Preserve native replacements too; never revive disconnected text or discard a new child.
    for (const child of [...s.about.childNodes]) {
      if (child instanceof Element && child.hasAttribute(OWNED)) continue;
      if (s.anchor.isConnected) s.anchor.before(child); else s.about.before(child);
    }
    s.anchor.remove();
    s.about.remove(); s.label.remove(); s.header.remove(); s.info.remove(); s.close.remove();
  }
}

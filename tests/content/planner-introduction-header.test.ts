// @vitest-environment jsdom
// @vitest-environment-options {"url":"https://be.my.ucla.edu/ClassPlanner/ClassPlan.aspx"}
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlannerIntroduction } from "../../src/content/planner-introduction";
// @ts-expect-error Shared production-browser fixture is JavaScript.
import { introductionFixtureHtml } from "../../harness/workspace-fixture.mjs";

describe("temporary access to the original UCLA header", () => {
  let introduction: PlannerIntroduction, masthead: HTMLElement, nativeButton: HTMLButtonElement;
  let scrollY: number, reduced: boolean;
  const save = vi.fn(), onLayout = vi.fn(), nativeAction = vi.fn();
  const edge = () => document.querySelector<HTMLButtonElement>(".pl-intro-header-edge")!;
  const toggle = () => document.querySelector<HTMLButtonElement>(".pl-intro-header-toggle")!;
  const revealed = () => document.documentElement.classList.contains("pl-header-revealed");
  const pointer = (node: HTMLElement, type: string, relatedTarget: EventTarget | null = null, buttons = 0, pointerType = "mouse") => {
    const event = new MouseEvent(type, { relatedTarget, buttons });
    Object.defineProperty(event, "pointerType", { value: pointerType }); node.dispatchEvent(event);
  };
  const openTemporary = () => {
    masthead.dispatchEvent(new FocusEvent("focusin",{bubbles:true}));
    toggle().focus();
  };
  const shadowHeader = () => {
    masthead.replaceChildren();
    const outer = masthead.attachShadow({mode: "open"}), component = document.createElement("header-header");
    outer.append(component);
    const inner = component.attachShadow({mode: "open"}), menuHost = document.createElement("fictional-menu");
    inner.append(menuHost);
    const menuRoot = menuHost.attachShadow({mode: "open"});
    menuRoot.innerHTML = '<button type="button" aria-expanded="false">Fictional menu</button><div role="menu" hidden><a href="#fictional-help">Fictional help</a></div>';
    return {component, menuHost, button: menuRoot.querySelector<HTMLButtonElement>("button")!, menu: menuRoot.querySelector<HTMLElement>('[role="menu"]')!};
  };
  beforeEach(() => {
    vi.useFakeTimers(); scrollY = 0; reduced = false;
    save.mockClear(); onLayout.mockClear(); nativeAction.mockClear();
    document.body.innerHTML = new DOMParser().parseFromString(introductionFixtureHtml(), "text/html").body.innerHTML;
    masthead = document.querySelector<HTMLElement>("layout-headerwrap")!;
    masthead.insertAdjacentHTML("beforeend", '<button id="fictional-native-menu" type="button" aria-expanded="false">Example native menu</button>');
    nativeButton = document.getElementById("fictional-native-menu") as HTMLButtonElement;
    nativeButton.addEventListener("click", nativeAction);
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: reduced })));
    vi.spyOn(window, "scrollY", "get").mockImplementation(() => scrollY);
    vi.spyOn(document.getElementById("titleText")!, "getBoundingClientRect").mockImplementation(() => ({ top: 178 - scrollY }) as DOMRect);
    vi.spyOn(window, "scrollTo").mockImplementation((value: ScrollToOptions | number) => {
      scrollY = typeof value === "number" ? value : value.top || 0;
      introduction.positionHeader(); introduction.positionInfo();
    });
    introduction = new PlannerIntroduction(save); introduction.setHeaderCompact(true);
    const toolbar = document.createElement("div"); toolbar.id = "fixture-toolbar"; document.body.append(toolbar);
    expect(introduction.mount(document, toolbar, onLayout)).toBe(true);
    introduction.positionHeader(); expect(scrollY).toBe(166);
    vi.mocked(window.scrollTo).mockClear();
  });
  afterEach(() => { introduction.restore(); vi.clearAllTimers(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it("keeps a clicked header open through departure, focus changes and outside clicks until clicked closed", () => {
    edge().click();expect(revealed()).toBe(true);
    expect(document.documentElement.classList.contains('pl-header-latched')).toBe(true);
    expect(edge().getAttribute('aria-label')).toBe('Hide UCLA header');
    pointer(edge(),'pointerleave',document.body);toggle().focus();
    document.body.click();window.dispatchEvent(new Event('blur'));vi.advanceTimersByTime(2000);
    expect(revealed()).toBe(true);expect(save).not.toHaveBeenCalled();
    edge().click();expect(revealed()).toBe(false);expect(document.activeElement).toBe(toggle());
    expect(document.documentElement.classList.contains('pl-header-latched')).toBe(false);
    edge().click();document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
    expect(revealed()).toBe(false);expect(save).not.toHaveBeenCalled();
  });

  it("preserves temporary keyboard access to native navigation and its leave behavior without saving", async () => {
    const original = masthead.outerHTML, parent = masthead.parentElement, form = nativeButton.form;
    openTemporary();
    expect(revealed()).toBe(true); expect(scrollY).toBe(0);
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: "smooth" });
    expect(edge().getAttribute("aria-expanded")).toBe("true");
    introduction.positionHeader(); expect(scrollY).toBe(0);
    window.dispatchEvent(new Event("scrollend"));
    pointer(edge(), "pointerleave", nativeButton); pointer(masthead, "pointerenter");
    vi.advanceTimersByTime(400); expect(revealed()).toBe(true);
    pointer(masthead, "pointerleave", document.body);
    vi.advanceTimersByTime(279); expect(revealed()).toBe(true);
    vi.advanceTimersByTime(1); expect(revealed()).toBe(false); expect(scrollY).toBe(166);
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 166, behavior: "smooth" });
    expect(toggle().textContent).toBe("Show header"); expect(toggle().getAttribute("aria-pressed")).toBe("true");
    expect(masthead.outerHTML).toBe(original); expect(masthead.parentElement).toBe(parent); expect(nativeButton.form).toBe(form);
    await Promise.resolve(); expect(save).not.toHaveBeenCalled(); expect(nativeAction).not.toHaveBeenCalled();
  });

  it("does not reveal while a panel is being dragged or from touch hover", () => {
    pointer(edge(), "pointerenter", null, 1);
    pointer(edge(), "pointerenter", null, 0, "touch");
    expect(revealed()).toBe(false); expect(window.scrollTo).not.toHaveBeenCalled();
    edge().focus(); openTemporary();
    expect(revealed()).toBe(true); expect(scrollY).toBe(0); expect(save).not.toHaveBeenCalled();
  });

  it("honors reduced motion without changing the saved compact preference", () => {
    reduced = true; openTemporary();
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: "instant" });
    pointer(edge(), "pointerleave", document.body); vi.advanceTimersByTime(280);
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 166, behavior: "instant" });
    expect(save).not.toHaveBeenCalled();
  });

  it("keeps native keyboard navigation visible until focus leaves without pinning the header open", async () => {
    nativeButton.focus(); expect(revealed()).toBe(true); expect(scrollY).toBe(0);
    pointer(masthead, "pointerleave", document.body); vi.advanceTimersByTime(400);
    expect(revealed()).toBe(true); expect(document.activeElement).toBe(nativeButton);
    toggle().focus(); vi.advanceTimersByTime(280);
    expect(revealed()).toBe(false); expect(scrollY).toBe(166);
    await Promise.resolve(); expect(save).not.toHaveBeenCalled(); expect(nativeAction).not.toHaveBeenCalled();
  });

  it("waits for an expanded native menu to close before leaving the header", async () => {
    openTemporary(); nativeButton.setAttribute("aria-expanded", "true");
    pointer(edge(), "pointerleave", document.body); vi.advanceTimersByTime(280);
    expect(revealed()).toBe(true);
    nativeButton.setAttribute("aria-expanded", "false"); await Promise.resolve();
    vi.advanceTimersByTime(280); expect(revealed()).toBe(false); expect(scrollY).toBe(166);
    expect(save).not.toHaveBeenCalled();
  });

  it("holds nested open-shadow native menus and observes their closing without reading content", async () => {
    const {button, menuHost} = shadowHeader(), source = menuHost.shadowRoot!.innerHTML;
    const parent = button.parentNode;
    Object.defineProperty(button, "textContent", {configurable: true, get: () => { throw Error("Native menu text must not be read"); }});
    Object.defineProperty(button, "value", {configurable: true, get: () => { throw Error("Native menu values must not be read"); }});
    button.setAttribute("aria-expanded", "true");
    openTemporary(); pointer(edge(), "pointerleave", document.body);
    vi.advanceTimersByTime(280); expect(revealed()).toBe(true); expect(scrollY).toBe(0);
    button.setAttribute("aria-expanded", "false"); await Promise.resolve();
    vi.advanceTimersByTime(280); expect(revealed()).toBe(false); expect(scrollY).toBe(166);
    expect(button.parentNode).toBe(parent); expect(menuHost.shadowRoot!.innerHTML).toBe(source);
    expect(save).not.toHaveBeenCalled(); expect(nativeAction).not.toHaveBeenCalled();
  });

  it("keeps retargeted shadow focus and clicks inside the original header", async () => {
    const {button} = shadowHeader(), action = vi.fn(); button.addEventListener("click", action);
    button.focus();
    expect(document.activeElement).toBe(masthead); expect(revealed()).toBe(true);
    pointer(masthead, "pointerleave", document.body); vi.advanceTimersByTime(500);
    expect(revealed()).toBe(true);
    button.dispatchEvent(new MouseEvent("click", {button: 0, bubbles: true, composed: true}));
    expect(action).toHaveBeenCalledOnce(); expect(revealed()).toBe(true);
    toggle().focus(); vi.advanceTimersByTime(280); expect(revealed()).toBe(false);
    await Promise.resolve(); expect(save).not.toHaveBeenCalled();
  });

  it.each(["hidden", "display"])("does not hold a shadow menu behind a %s native ancestor", mode => {
    const {button, component} = shadowHeader(); button.setAttribute("aria-expanded", "true");
    if (mode === "hidden") component.hidden = true; else component.style.display = "none";
    openTemporary(); pointer(edge(), "pointerleave", document.body);
    vi.advanceTimersByTime(280); expect(revealed()).toBe(false); expect(scrollY).toBe(166);
    expect(save).not.toHaveBeenCalled();
  });

  it("observes visible role menus inside shadow roots even without aria-expanded", async () => {
    const {menu} = shadowHeader(); menu.hidden = false;
    vi.spyOn(menu, "getClientRects").mockReturnValue([{width: 200, height: 90}] as unknown as DOMRectList);
    openTemporary(); pointer(edge(), "pointerleave", document.body);
    vi.advanceTimersByTime(280); expect(revealed()).toBe(true);
    menu.hidden = true; await Promise.resolve(); vi.advanceTimersByTime(280);
    expect(revealed()).toBe(false); expect(save).not.toHaveBeenCalled();
  });

  it("Escape dismisses the temporary header and returns focus to Show header", () => {
    edge().focus(); openTemporary(); nativeButton.focus();
    const escape = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    nativeButton.dispatchEvent(escape);
    expect(escape.defaultPrevented).toBe(true); expect(revealed()).toBe(false);
    expect(document.activeElement).toBe(toggle()); expect(scrollY).toBe(166);
    expect(toggle().textContent).toBe("Show header"); expect(edge().getAttribute("aria-expanded")).toBe("false");
    expect(save).not.toHaveBeenCalled();
  });

  it("never opens from hovering or crossing the top edge, including after Escape", () => {
    pointer(edge(), "pointerenter");
    pointer(masthead, "pointerenter");
    vi.advanceTimersByTime(1000);
    expect(revealed()).toBe(false); expect(scrollY).toBe(166);
    openTemporary(); expect(revealed()).toBe(true);
    document.dispatchEvent(new KeyboardEvent("keydown", {key:"Escape",bubbles:true,cancelable:true}));
    pointer(edge(), "pointerenter"); pointer(masthead, "pointerenter");
    vi.advanceTimersByTime(1000); expect(revealed()).toBe(false);
    openTemporary(); expect(revealed()).toBe(true);
    expect(save).not.toHaveBeenCalled();
  });
  it("waits for the native outside click before collapsing even with reduced motion", () => {
    reduced = true;
    edge().focus(); openTemporary(); expect(revealed()).toBe(true);
    const outside = document.getElementById("searchTier0")!, action = vi.fn(() => expect(revealed()).toBe(true));
    outside.addEventListener("click", action);
    const down = new MouseEvent("pointerdown", {button: 0, bubbles: true, cancelable: true});
    outside.dispatchEvent(down); expect(revealed()).toBe(true); expect(scrollY).toBe(0);
    outside.dispatchEvent(new MouseEvent("pointerup", {button: 0, bubbles: true}));
    expect(revealed()).toBe(true); expect(scrollY).toBe(0);
    const click = new MouseEvent("click", {button: 0, bubbles: true, cancelable: true});
    outside.dispatchEvent(click);
    expect(action).toHaveBeenCalledOnce(); expect(down.defaultPrevented).toBe(false); expect(click.defaultPrevented).toBe(false);
    expect(revealed()).toBe(false); expect(scrollY).toBe(166); expect(document.activeElement).toBe(toggle());
    expect(save).not.toHaveBeenCalled();
  });

  it.each(["pointerup", "pointercancel"])("does not collapse under a held primary gesture, then releases on %s", end => {
    reduced = true; openTemporary();
    document.body.dispatchEvent(new MouseEvent("pointerdown", {button: 0, bubbles: true}));
    pointer(edge(), "pointerleave", document.body);
    vi.advanceTimersByTime(1200); expect(revealed()).toBe(true); expect(scrollY).toBe(0);
    document.body.dispatchEvent(new MouseEvent(end, {button: 0, bubbles: true}));
    vi.advanceTimersByTime(279); expect(revealed()).toBe(true);
    vi.advanceTimersByTime(1); expect(revealed()).toBe(false); expect(scrollY).toBe(166);
    expect(save).not.toHaveBeenCalled();
  });

  it("leaves Escape to a native menu that already handled it", () => {
    nativeButton.addEventListener("keydown", event => event.preventDefault());
    nativeButton.focus(); nativeButton.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    expect(revealed()).toBe(true); expect(document.activeElement).toBe(nativeButton);
    expect(save).not.toHaveBeenCalled();
  });

  it("the explicit Show header button pins the banner open and persists exactly that choice", async () => {
    openTemporary(); toggle().click();
    await Promise.resolve(); await Promise.resolve();
    expect(save).toHaveBeenCalledExactlyOnceWith(false);
    expect(revealed()).toBe(false); expect(scrollY).toBe(0);
    expect(toggle().textContent).toBe("Compact header"); expect(edge().hidden).toBe(false);
    pointer(edge(), "pointerleave", document.body); vi.advanceTimersByTime(1000);
    expect(scrollY).toBe(0); expect(save).toHaveBeenCalledOnce();
  });

  it("does not snap a smooth collapse before scrollend reaches its target", () => {
    openTemporary(); window.dispatchEvent(new Event("scrollend"));
    vi.mocked(window.scrollTo).mockImplementation(() => { scrollY = 80; });
    pointer(edge(), "pointerleave", document.body); vi.advanceTimersByTime(280);
    const calls = vi.mocked(window.scrollTo).mock.calls.length;
    introduction.positionHeader(); window.dispatchEvent(new Event("scrollend")); introduction.positionHeader();
    expect(vi.mocked(window.scrollTo).mock.calls).toHaveLength(calls);
    scrollY = 166; window.dispatchEvent(new Event("scrollend"));
    scrollY = 0; introduction.positionHeader();
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 166, behavior: "instant" });
  });

  it("removes timers, observer, sensor, classes and stale callbacks on restoration", async () => {
    const original = masthead.outerHTML, staleEdge = edge(), staleToggle = toggle();
    pointer(staleEdge, "pointerenter"); pointer(staleEdge, "pointerleave", document.body);
    introduction.restore(); vi.mocked(window.scrollTo).mockClear(); onLayout.mockClear();
    staleEdge.click(); staleToggle.click(); pointer(staleEdge, "pointerenter");
    nativeButton.setAttribute("aria-expanded", "true"); nativeButton.setAttribute("aria-expanded", "false");
    nativeButton.focus(); await Promise.resolve(); vi.advanceTimersByTime(2000);
    expect(document.querySelector(".pl-intro-header-edge")).toBeNull();
    expect(document.documentElement.classList.contains("pl-header-compact")).toBe(false); expect(revealed()).toBe(false);
    expect(masthead.outerHTML).toBe(original); expect(window.scrollTo).not.toHaveBeenCalled(); expect(onLayout).not.toHaveBeenCalled(); expect(save).not.toHaveBeenCalled();
    const escape = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }); nativeButton.dispatchEvent(escape);
    expect(escape.defaultPrevented).toBe(false);
  });
});

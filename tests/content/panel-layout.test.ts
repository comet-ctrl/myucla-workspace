// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { PanelLayoutController, type PanelDock, type PanelDockTarget } from "../../src/content/panel-layout";

describe("native-preserving panel layout", () => {
  let layout: PanelLayoutController;
  let host: HTMLElement, panel: HTMLElement, handle: HTMLButtonElement, field: HTMLInputElement;
  let changed: Mock<NonNullable<ConstructorParameters<typeof PanelLayoutController>[2]>>;
  let activate: Mock<() => void>;
  let animationFrames: Map<number, FrameRequestCallback>, nextFrame: number;
  const paint = () => {
    const callbacks = [...animationFrames.values()]; animationFrames.clear();
    callbacks.forEach(callback => callback(0));
  };
  const rect = (left = 50, top = 60, width = 600, height = 400) => ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON() {} });
  const pointer = (node: EventTarget, type: string, x: number, y: number, pointerId = 1, render = true) => {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientX: x, clientY: y });
    Object.defineProperties(event, { pointerId: { value: pointerId }, isPrimary: { value: true } });
    node.dispatchEvent(event); if (render) paint(); return event;
  };
  const key = (node: HTMLElement, value: string, options: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true, ...options });
    node.dispatchEvent(event); return event;
  };
  const startDrag = (node: HTMLElement = handle) => { pointer(node, "pointerdown", 80, 80); pointer(document, "pointermove", 96, 98); };
  const dropOn = (dock: PanelDock) => {
    const x = dock === "left" ? 100 : dock === "right" ? 900 : 500, y = 320;
    pointer(document, "pointermove", x, y); pointer(document, "pointerup", x, y);
  };
  beforeEach(() => {
    animationFrames = new Map(); nextFrame = 0;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(callback => { const id = ++nextFrame; animationFrames.set(id, callback); return id; });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(id => { animationFrames.delete(id); });
    document.body.innerHTML = '<form id="native"><div id="host"><section id="panel"><button type="button" id="handle">Schedule</button><div><input name="choice"><button type="button" id="native-action">Native action</button></div></section></div></form>';
    host = document.getElementById("host")!; panel = document.getElementById("panel")!;
    handle = document.getElementById("handle") as HTMLButtonElement; field = panel.querySelector("input")!;
    host.getBoundingClientRect = () => rect(20, 40, 960, 640); panel.getBoundingClientRect = () => rect();
    Object.defineProperty(window, "innerWidth", { value: 1024, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 768, configurable: true });
    changed = vi.fn(); activate = vi.fn();
    layout = new PanelLayoutController(document, host, changed);
    layout.addPanel({ id: "schedule", label: "Weekly schedule", element: panel, handle, defaultDock: "right", onActivate: activate });
  });
  afterEach(() => { layout.restore(); vi.restoreAllMocks(); });

  it("keeps every native node, parent, handler, value and form association across docking", () => {
    const parent = panel.parentElement, fieldParent = field.parentElement, form = field.form;
    const native = document.getElementById("native-action")!, action = vi.fn(); native.addEventListener("click", action);
    field.value = "example chosen value";
    layout.floatPanel("schedule"); layout.dockPanel("schedule", "left"); layout.floatPanel("schedule"); layout.restore();
    expect(panel.parentElement).toBe(parent); expect(field.parentElement).toBe(fieldParent); expect(field.form).toBe(form);
    expect(field.value).toBe("example chosen value"); expect(document.getElementById("native-action")).toBe(native);
    expect(action).not.toHaveBeenCalled(); native.click(); expect(action).toHaveBeenCalledOnce();
    expect(document.querySelectorAll("[data-planner-lift-owned]")).toHaveLength(0);
  });
  it("does not activate or mutate layout during mounting or a click below the drag threshold", () => {
    const clicked = vi.fn(); handle.addEventListener("click", clicked);
    pointer(handle, "pointerdown", 80, 80); pointer(document, "pointermove", 82, 82); pointer(document, "pointerup", 82, 82); handle.click();
    expect(layout.getPlacement("schedule")).toBe("right"); expect(changed).not.toHaveBeenCalled(); expect(activate).not.toHaveBeenCalled();
    expect(clicked).toHaveBeenCalledOnce(); expect(document.querySelector(".pl-panel-drop-overlay")).toBeNull();
  });
  it.each<PanelDock>(["left", "right", "main"])("docks by an explicit pointer drop at %s without clicking the navigation handle", dock => {
    const clicked = vi.fn(); handle.addEventListener("click", clicked); startDrag();
    expect(document.querySelectorAll("[data-pl-dock-target]")).toHaveLength(1); dropOn(dock); handle.click();
    expect(layout.getPlacement("schedule")).toBe(dock); expect(panel.dataset.plPanelPlacement).toBe(dock);
    expect(activate).toHaveBeenCalledOnce(); expect(clicked).not.toHaveBeenCalled();
    expect(document.querySelector(".pl-panel-drop-overlay")).toBeNull(); expect(panel.parentElement).toBe(host);
  });
  it("moves the real panel with the pointer before dropping, without cloning or changing native controls", () => {
    const native = document.getElementById("native-action")!, action = vi.fn(), parent = field.parentElement, form = field.form;
    native.addEventListener("click", action); field.value = "fictional selection";
    const original = layout.snapshot(); startDrag();
    expect(document.querySelector(".pl-panel-drag-ghost")).toBeNull();
    expect(panel.classList.contains("pl-panel-dragging")).toBe(true);
    expect(panel.style.getPropertyValue("--pl-panel-left")).toBe("66px");
    expect(panel.style.getPropertyValue("--pl-panel-top")).toBe("78px");
    pointer(document, "pointermove", 160, 130);
    expect(panel.style.getPropertyValue("--pl-panel-left")).toBe("130px");
    expect(panel.style.getPropertyValue("--pl-panel-top")).toBe("110px");
    expect(changed.mock.calls.every(call => call[2] === "drag")).toBe(true);
    expect(layout.snapshot()).toEqual(original); // Remounts must never preserve an uncommitted drag.
    expect(panel.parentElement).toBe(host); expect(field.parentElement).toBe(parent); expect(field.form).toBe(form);
    expect(field.value).toBe("fictional selection"); expect(field.disabled).toBe(false);
    expect(document.querySelectorAll("#native-action")).toHaveLength(1); expect(document.getElementById("native-action")).toBe(native);
    native.click(); expect(action).not.toHaveBeenCalled();
    pointer(document, "pointerup", 900, 720);
    expect(layout.isFloating("schedule")).toBe(true); expect(panel.classList.contains("pl-floating-panel")).toBe(true);
    expect(panel.classList.contains("pl-panel-dragging")).toBe(false);
    expect(panel.querySelector<HTMLButtonElement>(".pl-panel-resize")!.hidden).toBe(false);
    expect(parseFloat(panel.style.getPropertyValue("--pl-panel-left"))).toBeLessThanOrEqual(412);
    expect(activate).toHaveBeenCalledOnce();
    expect(changed).toHaveBeenLastCalledWith("schedule", "floating", "placement");
    native.click(); expect(action).toHaveBeenCalledOnce();
  });
  it("moves an existing floating panel relative to its original position", () => {
    layout.floatPanel("schedule", { left: 100, top: 100, width: 300, height: 250 });
    pointer(handle, "pointerdown", 350, 120); pointer(document, "pointermove", 380, 140); pointer(document, "pointerup", 380, 140);
    expect(layout.snapshot().panels[0].box).toEqual({ left: 130, top: 120, width: 300, height: 250 });
  });
  it("coalesces rapid pointer events into one display update at the latest position", () => {
    const before = layout.snapshot();
    pointer(handle, "pointerdown", 80, 80);
    expect(layout.isInteracting()).toBe(false);
    activate.mockImplementation(() => expect(layout.isInteracting()).toBe(true));
    for (let x = 100; x <= 400; x += 20) pointer(document, "pointermove", x, 150, 1, false);
    expect(animationFrames.size).toBe(1); expect(changed).not.toHaveBeenCalled();
    expect(layout.isInteracting()).toBe(true);
    expect(activate).toHaveBeenCalledOnce(); expect(layout.snapshot()).toEqual(before);
    paint();
    expect(changed).toHaveBeenCalledExactlyOnceWith("schedule", "floating", "drag");
    expect(panel.style.getPropertyValue("--pl-panel-left")).toBe("370px");
    expect(panel.style.getPropertyValue("--pl-panel-top")).toBe("130px");
    expect(animationFrames.size).toBe(0);
    key(handle, "Escape"); expect(layout.isInteracting()).toBe(false);
  });
  it("uses the release coordinates even before the queued animation frame and leaves no late writes", () => {
    pointer(handle, "pointerdown", 80, 80); pointer(document, "pointermove", 200, 150, 1, false);
    pointer(document, "pointerup", 400, 720, 1, false);
    expect(layout.snapshot().panels[0].box).toEqual({ left: 370, top: 356, width: 600, height: 400 });
    expect(changed.mock.calls.map(call => call[2])).toEqual(["drag", "placement"]);
    const styles = panel.style.cssText; expect(animationFrames.size).toBe(0); paint();
    expect(panel.style.cssText).toBe(styles); expect(document.querySelector(".pl-panel-drop-overlay")).toBeNull();
  });
  it("keeps the grabbed point under the pointer beyond viewport edges, then bounds the finished floating panel", () => {
    layout.floatPanel("schedule", { left: 12, top: 12, width: 1000, height: 744 });
    const before = layout.snapshot();
    pointer(handle, "pointerdown", 60, 32); pointer(document, "pointermove", 560, 732);
    expect(panel.style.getPropertyValue("--pl-panel-left")).toBe("512px");
    expect(panel.style.getPropertyValue("--pl-panel-top")).toBe("712px");
    expect(layout.snapshot()).toEqual(before);
    pointer(document, "pointermove", -40, -68);
    expect(panel.style.getPropertyValue("--pl-panel-left")).toBe("-88px");
    expect(panel.style.getPropertyValue("--pl-panel-top")).toBe("-88px");
    pointer(document, "pointerup", -40, -68);
    expect(layout.snapshot().panels[0].box).toEqual({ left: 12, top: 12, width: 1000, height: 744 });
  });
  it.each(["Escape", "pointercancel", "blur", "restore", "removed"])("cancels a queued frame without reapplying it after %s", cancel => {
    const before = layout.snapshot(), styles = panel.style.cssText;
    pointer(handle, "pointerdown", 80, 80); pointer(document, "pointermove", 200, 150, 1, false);
    expect(animationFrames.size).toBe(1);
    if (cancel === "Escape") key(handle, "Escape");
    else if (cancel === "blur") window.dispatchEvent(new Event("blur"));
    else if (cancel === "restore") layout.restore();
    else if (cancel === "removed") { panel.remove(); paint(); }
    else pointer(document, "pointercancel", 200, 150, 1, false);
    expect(animationFrames.size).toBe(0); paint();
    expect(panel.style.cssText).toBe(styles);
    if (cancel !== "restore") expect(layout.snapshot()).toEqual(before);
    expect(changed.mock.calls.some(call => call[2] === "placement" || call[2] === "commit" || call[2] === "drag")).toBe(false);
    expect(document.querySelector(".pl-panel-drop-overlay")).toBeNull();
  });
  it("commits a resize at pointer release while snapshots during the gesture remain unchanged", () => {
    layout.floatPanel("schedule", { left: 30, top: 30, width: 360, height: 300 });
    const before = layout.snapshot(), resize = panel.querySelector<HTMLButtonElement>(".pl-panel-resize")!;
    changed.mockClear();
    pointer(resize, "pointerdown", 390, 330); pointer(document, "pointermove", 500, 440);
    expect(layout.snapshot()).toEqual(before);
    pointer(document, "pointermove", 510, 450, 1, false);
    pointer(document, "pointerup", 520, 460, 1, false);
    expect(layout.snapshot().panels[0].box).toEqual({ left: 30, top: 30, width: 490, height: 430 });
    expect(changed).toHaveBeenLastCalledWith("schedule", "floating", "commit");
    expect(changed.mock.calls.filter(call => call[2] === "commit")).toHaveLength(1);
    expect(animationFrames.size).toBe(0); paint();
    changed.mockClear(); key(resize, "ArrowLeft");
    expect(layout.snapshot().panels[0].box?.width).toBe(474);
    expect(changed).toHaveBeenCalledExactlyOnceWith("schedule", "floating", "commit");
  });
  it("Escape cancels a drag before any placement change and cannot close another UI", () => {
    const bubbling = vi.fn(); document.addEventListener("keydown", bubbling); startDrag();
    const event = key(handle, "Escape");
    expect(event.defaultPrevented).toBe(true); expect(layout.getPlacement("schedule")).toBe("right");
    expect(document.querySelector(".pl-panel-drag-ghost")).toBeNull(); expect(bubbling).not.toHaveBeenCalled();
    document.removeEventListener("keydown", bubbling);
  });
  it("ignores nested native buttons and fields in a header", () => {
    const header = document.createElement("div"), native = document.createElement("button"); native.type = "button"; header.append(native); panel.prepend(header);
    layout.addHandle("schedule", header);
    startDrag(native); pointer(document, "pointerup", 900, 70);
    native.dispatchEvent(new MouseEvent("dblclick", { bubbles: true })); key(native, "f", { altKey: true, shiftKey: true });
    expect(layout.getPlacement("schedule")).toBe("right"); expect(activate).not.toHaveBeenCalled();
  });
  it("leaves native labels, selection controls, accessible controls and links usable inside a full header", () => {
    const header = document.createElement("div");
    header.innerHTML = '<span>Heading</span><label for="header-choice">Choose</label><input id="header-choice" type="radio" checked><a href="#help">Help</a><span role="button">Help control</span><span role="checkbox" aria-checked="true">Toggle</span>';
    panel.prepend(header); layout.addHandle("schedule", header);
    const selected = header.querySelector<HTMLInputElement>("input")!, parent = selected.parentElement, form = selected.form;
    for (const control of header.querySelectorAll<HTMLElement>("label,input,a,[role]")) {
      startDrag(control); pointer(document, "pointerup", 900, 320);
      expect(key(control, "f", { altKey: true, shiftKey: true }).defaultPrevented).toBe(false);
      const double = new MouseEvent("dblclick", { bubbles: true, cancelable: true }); control.dispatchEvent(double);
      expect(double.defaultPrevented).toBe(false);
    }
    expect(layout.getPlacement("schedule")).toBe("right"); expect(activate).not.toHaveBeenCalled();
    expect(selected.checked).toBe(true); expect(selected.parentElement).toBe(parent); expect(selected.form).toBe(form);
    const clicked = vi.fn(), control = header.querySelector<HTMLElement>("[role='button']")!; control.addEventListener("click", clicked);
    startDrag(header.firstElementChild as HTMLElement); pointer(document, "pointerup", 500, 720);
    control.click(); expect(clicked).toHaveBeenCalledOnce();
  });
  it("handles nested grips once and lets blank header space move the same panel", () => {
    const header = document.createElement("div"), title = document.createElement("span");
    title.textContent = "Heading"; header.append(title, handle); panel.prepend(header); layout.addHandle("schedule", header);
    startDrag(handle); pointer(document, "pointerup", 500, 720);
    expect(activate).toHaveBeenCalledOnce(); expect(layout.isFloating("schedule")).toBe(true);
    activate.mockClear(); handle.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    expect(activate).toHaveBeenCalledOnce(); expect(layout.getPlacement("schedule")).toBe("right");
    activate.mockClear(); startDrag(title); pointer(document, "pointerup", 100, 320);
    expect(activate).toHaveBeenCalledOnce(); expect(layout.getPlacement("schedule")).toBe("left");
  });
  it.each(['<div class="popover">', '<div class="clickover">', '<div role="dialog">', '<div role="alertdialog">', '<div popover>', '<dialog open>'])("preserves native Help text and scroll gestures inside header surface %s", opening => {
    const header = document.createElement("div");
    header.innerHTML = `${opening}<p>Example native Help text</p>${opening.startsWith("<dialog") ? "</dialog>" : "</div>"}`;
    panel.prepend(header); layout.addHandle("schedule", header);
    const text = header.querySelector<HTMLElement>("p")!, clicked = vi.fn(), scrolled = vi.fn();
    text.addEventListener("click", clicked); text.addEventListener("wheel", scrolled);
    startDrag(text); pointer(document, "pointerup", 900, 320);
    for (const type of ["dblclick", "contextmenu"]) {
      const event = new MouseEvent(type, { bubbles: true, cancelable: true }); text.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }
    expect(key(text, "f", { altKey: true, shiftKey: true }).defaultPrevented).toBe(false);
    const wheel = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 80 }); text.dispatchEvent(wheel); text.click();
    expect(wheel.defaultPrevented).toBe(false); expect(scrolled).toHaveBeenCalledOnce(); expect(clicked).toHaveBeenCalledOnce();
    expect(layout.getPlacement("schedule")).toBe("right"); expect(activate).not.toHaveBeenCalled();
    expect(document.querySelector(".pl-panel-drop-overlay,.pl-panel-layout-menu")).toBeNull();
  });
  it("allows a navigation proxy to float its panel", () => {
    const proxy = document.createElement("button"); proxy.type = "button"; host.prepend(proxy); layout.addHandle("schedule", proxy);
    startDrag(proxy); pointer(document, "pointerup", 900, 720);
    expect(layout.isFloating("schedule")).toBe(true); expect(activate).toHaveBeenCalledOnce();
  });
  it("anchors a proxy drag under the pointer instead of using the panel's former screen position", () => {
    const proxy = document.createElement("button"); proxy.type = "button"; host.prepend(proxy); layout.addHandle("schedule", proxy);
    layout.floatPanel("schedule", { left: 600, top: 400, width: 300, height: 220 });
    pointer(proxy, "pointerdown", 320, 80); pointer(document, "pointermove", 400, 130);
    expect(panel.style.getPropertyValue("--pl-panel-left")).toBe("280px");
    expect(panel.style.getPropertyValue("--pl-panel-top")).toBe("108px");
    pointer(document, "pointerup", 400, 130);
    expect(layout.snapshot().panels[0].box).toEqual({ left: 280, top: 108, width: 300, height: 220 });
  });
  it("keeps dock targets at their original bounds when the workspace shrinks during a drag", () => {
    startDrag(); pointer(document, "pointermove", 900, 320);
    const target = document.querySelector<HTMLElement>("[data-pl-dock-target='right']")!, before = target.style.cssText;
    host.getBoundingClientRect = () => rect(400, 400, 200, 150);
    dropOn("right");
    expect(layout.getPlacement("schedule")).toBe("right"); expect(target.style.cssText).toBe(before);
  });
  it("fills the entire hovered destination and leaves room to float between the generous side targets", () => {
    startDrag();
    const preview = () => document.querySelector<HTMLElement>(".pl-panel-drop-preview");
    expect(preview()?.dataset.plDockTarget).toBe("left");
    expect(preview()?.style.height).toBe("640px"); expect(parseFloat(preview()!.style.width)).toBeCloseTo(403.2);
    expect(document.querySelector(".pl-panel-drop-target")).toBeNull(); expect(preview()?.textContent).toBe("");
    pointer(document, "pointermove", 300, 320);
    expect(preview()).toBeNull(); expect(document.querySelector(".pl-panel-drop-overlay")?.childElementCount).toBe(0);
    pointer(document, "pointermove", 500, 320);
    expect(preview()?.dataset.plDockTarget).toBe("main"); expect(preview()?.style.width).toBe("960px");
    pointer(document, "pointermove", 900, 650);
    expect(preview()?.dataset.plDockTarget).toBe("right"); expect(preview()?.style.top).toBe("40px"); expect(preview()?.style.height).toBe("640px");
    expect(document.querySelectorAll("[data-pl-dock-target]")).toHaveLength(1);
    pointer(document, "pointermove", 700, 320); pointer(document, "pointerup", 700, 320);
    expect(layout.isFloating("schedule")).toBe(true);
  });
  it("does not offer a bottom dock through pointer, keyboard or layout menu", () => {
    startDrag(); pointer(document, "pointermove", 500, 660);
    expect(document.querySelector("[data-pl-dock-target]")).toBeNull();
    pointer(document, "pointerup", 500, 660); expect(layout.isFloating("schedule")).toBe(true);
    expect(key(handle, "ArrowDown", { altKey: true }).defaultPrevented).toBe(false);
    expect(layout.isFloating("schedule")).toBe(true);
    key(handle, "ContextMenu");
    expect(document.querySelector(".pl-panel-layout-menu")?.textContent).not.toContain("Bottom");
  });
  it("freezes supplied hit regions and full previews before activation can reflow the workspace", () => {
    const target: PanelDockTarget = { hit: { left: 800, top: 40, width: 180, height: 640 }, preview: { left: 700, top: 40, width: 280, height: 640 } };
    const targets = vi.fn(() => ({ right: target }));
    layout.removePanel("schedule");
    layout.addPanel({ id: "schedule", label: "Schedule", element: panel, handle, defaultDock: "right", getDockTargets: targets, onActivate: () => {
      target.hit.left = 100; target.preview.left = 20; target.preview.width = 500;
    } });
    pointer(handle, "pointerdown", 80, 80);
    expect(targets).toHaveBeenCalledOnce();
    pointer(document, "pointermove", 900, 100);
    const preview = document.querySelector<HTMLElement>(".pl-panel-drop-preview")!;
    expect(preview.dataset.plDockTarget).toBe("right");
    expect(preview.style.left).toBe("700px"); expect(preview.style.width).toBe("280px");
    pointer(document, "pointerup", 900, 100);
    expect(layout.getPlacement("schedule")).toBe("right"); expect(targets).toHaveBeenCalledOnce();
  });
  it("prioritizes side targets over overlapping main space and retains the active edge for twelve pixels", () => {
    const box = { left: 20, top: 40, width: 960, height: 640 };
    layout.removePanel("schedule");
    layout.addPanel({ id: "schedule", label: "Schedule", element: panel, handle, defaultDock: "right", getDockTargets: () => ({
      main: { hit: box, preview: box },
      left: { hit: { ...box, width: 240 }, preview: { ...box, width: 400 } },
      right: { hit: { ...box, left: 740, width: 240 }, preview: { ...box, left: 580, width: 400 } }
    }) });
    startDrag();
    const target = () => document.querySelector<HTMLElement>("[data-pl-dock-target]")?.dataset.plDockTarget;
    expect(target()).toBe("left");
    pointer(document, "pointermove", 272, 320); expect(target()).toBe("left");
    pointer(document, "pointermove", 273, 320); expect(target()).toBe("main");
    pointer(document, "pointermove", 900, 320); expect(target()).toBe("right");
    pointer(document, "pointermove", 728, 320); expect(target()).toBe("right");
    pointer(document, "pointerup", 728, 320); expect(layout.getPlacement("schedule")).toBe("right");
  });
  it("uses only valid supplied destinations and does not create fallback targets for missing entries", () => {
    layout.removePanel("schedule");
    layout.addPanel({ id: "schedule", label: "Schedule", element: panel, handle, defaultDock: "right", getDockTargets: () => ({
      left: { hit: { left: 20, top: 40, width: 240, height: 640 }, preview: { left: 20, top: 40, width: NaN, height: 640 } }
    }) });
    startDrag(); pointer(document, "pointermove", 900, 320);
    expect(document.querySelector("[data-pl-dock-target]")).toBeNull();
    pointer(document, "pointerup", 900, 320); expect(layout.isFloating("schedule")).toBe(true);
  });
  it.each(["Escape", "pointercancel", "blur"])("restores placement, geometry and stacking when a real-panel drag is cancelled by %s", cancel => {
    layout.floatPanel("schedule", { left: 100, top: 100, width: 350, height: 250 });
    const before = layout.snapshot(), styles = panel.style.cssText;
    pointer(handle, "pointerdown", 130, 120); pointer(document, "pointermove", 200, 160);
    expect(panel.style.getPropertyValue("--pl-panel-left")).toBe("170px");
    if (cancel === "Escape") key(handle, "Escape");
    else if (cancel === "blur") window.dispatchEvent(new Event("blur"));
    else pointer(document, "pointercancel", 200, 160);
    expect(layout.snapshot()).toEqual(before); expect(panel.style.cssText).toBe(styles);
    expect(panel.classList.contains("pl-panel-dragging")).toBe(false);
    expect(document.querySelector(".pl-panel-drop-overlay")).toBeNull();
    expect(changed.mock.calls.filter(call => call[2] === "placement")).toHaveLength(1);
  });
  it("supports keyboard float/dock and double-click returning to its default dock", () => {
    key(handle, "f", { altKey: true, shiftKey: true }); expect(layout.isFloating("schedule")).toBe(true);
    key(handle, "ArrowLeft", { altKey: true }); expect(layout.getPlacement("schedule")).toBe("left");
    handle.dispatchEvent(new MouseEvent("dblclick", { bubbles: true })); expect(layout.isFloating("schedule")).toBe(true);
    handle.dispatchEvent(new MouseEvent("dblclick", { bubbles: true })); expect(layout.getPlacement("schedule")).toBe("right");
  });
  it("limits pointer, keyboard and menu destinations to the registered docks", () => {
    layout.removePanel("schedule"); layout.addPanel({ id: "schedule", label: "Schedule", element: panel, handle, defaultDock: "right", allowedDocks: ["right"] });
    key(handle, "ArrowLeft", { altKey: true }); expect(layout.getPlacement("schedule")).toBe("right");
    startDrag(); expect(document.querySelectorAll("[data-pl-dock-target]")).toHaveLength(0);
    pointer(document, "pointermove", 900, 320); expect(document.querySelectorAll("[data-pl-dock-target]")).toHaveLength(1); layout.cancelActiveDrag();
    key(handle, "F10", { shiftKey: true }); const menu = document.querySelector(".pl-panel-layout-menu")!;
    expect(menu.textContent).toContain("Dock: Right side"); expect(menu.textContent).not.toContain("Dock: Left side");
  });
  it("provides a focusable keyboard layout menu and restores focus on dismissal", () => {
    handle.focus(); key(handle, "F10", { shiftKey: true });
    const menu = document.querySelector<HTMLElement>(".pl-panel-layout-menu")!, buttons = [...menu.querySelectorAll<HTMLButtonElement>("button")];
    expect(document.activeElement).toBe(buttons[0]); expect(menu.getAttribute("role")).toBe("menu");
    key(buttons[0], "End"); expect(document.activeElement).toBe(buttons.at(-1));
    key(buttons.at(-1)!, "Escape"); expect(document.querySelector(".pl-panel-layout-menu")).toBeNull(); expect(document.activeElement).toBe(handle);
    key(handle, "ContextMenu"); document.querySelector<HTMLButtonElement>(".pl-panel-layout-menu button")!.click();
    expect(layout.isFloating("schedule")).toBe(true); expect(document.activeElement).toBe(handle);
  });
  it("resizes within the viewport and restores the original box when cancelled", () => {
    layout.floatPanel("schedule", { left: 30, top: 30, width: 360, height: 300 });
    const resize = panel.querySelector<HTMLButtonElement>(".pl-panel-resize")!;
    pointer(resize, "pointerdown", 390, 330); pointer(document, "pointermove", 500, 440);
    expect(panel.style.getPropertyValue("--pl-panel-width")).toBe("470px");
    expect(layout.snapshot().panels[0].box?.width).toBe(360); key(resize, "Escape");
    expect(layout.snapshot().panels[0].box).toEqual({ left: 30, top: 30, width: 360, height: 300 });
    key(resize, "ArrowRight"); expect(layout.snapshot().panels[0].box?.width).toBe(376);
    key(resize, "ArrowDown", { shiftKey: true }); expect(layout.snapshot().panels[0].box?.height).toBe(340);
  });
  it("keeps floating panels reachable after a narrow viewport resize", () => {
    layout.floatPanel("schedule", { left: 900, top: 700, width: 2000, height: 2000 });
    Object.defineProperty(window, "innerWidth", { value: 390, configurable: true }); Object.defineProperty(window, "innerHeight", { value: 360, configurable: true });
    window.dispatchEvent(new Event("resize"));
    expect(layout.snapshot().panels[0].box).toEqual({ left: 12, top: 12, width: 366, height: 336 });
  });
  it("restores an in-memory snapshot without activating native disclosures", () => {
    layout.floatPanel("schedule", { left: 100, top: 100, width: 350, height: 300 }); const snapshot = layout.snapshot();
    layout.reset(); activate.mockClear(); layout.restoreSnapshot(snapshot);
    expect(activate).not.toHaveBeenCalled(); expect(layout.snapshot()).toEqual(snapshot);
    snapshot.panels[0].box!.width = 9999; expect(layout.snapshot().panels[0].box?.width).toBe(350);
  });
  it("hides and reopens a panel in its same place without modifying native visibility or activating it", () => {
    layout.floatPanel("schedule", { left: 100, top: 100, width: 350, height: 300 });
    const before = layout.snapshot().panels[0], parent = panel.parentElement, form = field.form;
    activate.mockClear(); changed.mockClear(); layout.hidePanel("schedule");
    expect(layout.isHidden("schedule")).toBe(true); expect(panel.classList.contains("pl-panel-hidden")).toBe(true);
    expect(panel.hasAttribute("hidden")).toBe(false); expect(field.form).toBe(form); expect(panel.parentElement).toBe(parent);
    expect(layout.snapshot().panels[0]).toEqual({ ...before, hidden: true });
    layout.showPanel("schedule"); expect(layout.snapshot().panels[0]).toEqual(before);
    expect(activate).not.toHaveBeenCalled();
    expect(changed.mock.calls).toEqual([["schedule", "floating", "visibility"], ["schedule", "floating", "visibility"]]);
  });
  it("restores hidden docked and floating panels from snapshots without activating a native disclosure", () => {
    layout.floatPanel("schedule", { left: 100, top: 100, width: 350, height: 300 }); layout.dockPanel("schedule", "left");
    layout.hidePanel("schedule"); const snapshot = layout.snapshot(); layout.reset(); activate.mockClear();
    layout.restoreSnapshot(snapshot); expect(layout.snapshot()).toEqual(snapshot); expect(activate).not.toHaveBeenCalled();
    layout.floatPanel("schedule", undefined, false); expect(layout.isHidden("schedule")).toBe(true);
    const floating = layout.snapshot(); layout.reset(); layout.restoreSnapshot(floating);
    expect(layout.snapshot()).toEqual(floating); expect(activate).not.toHaveBeenCalled();
    layout.floatPanel("schedule"); expect(layout.isHidden("schedule")).toBe(false); expect(activate).toHaveBeenCalledOnce();
  });
  it("cancels a hidden navigation-tab drag back to the original hidden layout", () => {
    const proxy = document.createElement("button"); proxy.type = "button"; host.prepend(proxy); layout.addHandle("schedule", proxy);
    field.type = "radio"; field.checked = true; const parent = field.parentElement, form = field.form;
    layout.hidePanel("schedule"); const before = layout.snapshot(); startDrag(proxy);
    expect(layout.isHidden("schedule")).toBe(false); key(proxy, "Escape");
    expect(layout.snapshot()).toEqual(before); expect(layout.isHidden("schedule")).toBe(true);
    expect(field.checked).toBe(true); expect(field.parentElement).toBe(parent); expect(field.form).toBe(form);
  });
  it.each(["drag", "float", "dock"])("does not displace another pane from the old dock while activating a closed pane to %s", action => {
    const other = document.createElement("section"), otherHandle = document.createElement("button"), proxy = document.createElement("button");
    otherHandle.type = proxy.type = "button"; other.append(otherHandle); host.append(other, proxy);
    layout.addPanel({ id: "find", label: "Find", element: other, handle: otherHandle, defaultDock: "right" });
    layout.addHandle("schedule", proxy); layout.hidePanel("schedule");
    // The workspace's explicit navigation reveals a closed module; its collision
    // handler would move a neighbor if this emitted the stale dock as visible.
    activate.mockImplementation(() => layout.showPanel("schedule")); changed.mockClear();
    changed.mockImplementation((id, place, reason) => {
      if (id === "schedule" && place === "right" && reason === "visibility" && !layout.isHidden(id)) layout.dockPanel("find", "main", false);
    });
    const before = layout.snapshot();
    if (action === "drag") {
      startDrag(proxy); expect(layout.getPlacement("find")).toBe("right"); key(proxy, "Escape");
      expect(layout.snapshot()).toEqual(before);
    } else if (action === "float") layout.floatPanel("schedule");
    else layout.dockPanel("schedule", "left");
    expect(layout.getPlacement("find")).toBe("right");
    expect(changed.mock.calls.filter(call => call[2] === "visibility")).toHaveLength(0);
    expect(activate).toHaveBeenCalledOnce();
    if (action === "dock") expect(changed).toHaveBeenCalledExactlyOnceWith("schedule", "left", "placement", { kind: "merge", dock: "left" });
    else if (action === "float") expect(changed).toHaveBeenCalledExactlyOnceWith("schedule", "floating", "placement");
  });
  it("provides Hide and Show actions through the existing layout menu", () => {
    const proxy = document.createElement("button"); proxy.type = "button"; host.prepend(proxy); layout.addHandle("schedule", proxy);
    key(proxy, "ContextMenu");
    const hide = [...document.querySelectorAll<HTMLButtonElement>(".pl-panel-layout-menu button")].find(button => button.textContent === "Hide panel")!;
    expect(hide.getAttribute("role")).toBe("menuitem"); hide.click(); expect(layout.isHidden("schedule")).toBe(true);
    expect(activate).not.toHaveBeenCalled(); key(proxy, "ContextMenu");
    [...document.querySelectorAll<HTMLButtonElement>(".pl-panel-layout-menu button")].find(button => button.textContent === "Show panel")!.click();
    expect(layout.isHidden("schedule")).toBe(false); expect(activate).toHaveBeenCalledOnce();
  });
  it("reset returns all registered panels to their defaults without native actions", () => {
    const other = document.createElement("section"), otherHandle = document.createElement("button"); other.append(otherHandle); host.append(other);
    layout.addPanel({ id: "details", label: "Details", element: other, handle: otherHandle, defaultDock: "main", onActivate: activate });
    layout.floatPanel("schedule"); layout.floatPanel("details"); layout.hidePanel("schedule"); layout.hidePanel("details"); activate.mockClear(); layout.reset();
    expect(layout.getPlacement("schedule")).toBe("right"); expect(layout.getPlacement("details")).toBe("main"); expect(activate).not.toHaveBeenCalled();
    expect(layout.isHidden("schedule")).toBe(false); expect(layout.isHidden("details")).toBe(false);
  });
  it("cancels when a native redraw removes the original handle and never resurrects it", () => {
    startDrag(); const parent = panel.parentElement; panel.remove(); pointer(document, "pointermove", 200, 100); pointer(document, "pointerup", 200, 100);
    expect(panel.isConnected).toBe(false); expect(parent?.contains(panel)).toBe(false); expect(document.querySelector(".pl-panel-drag-ghost")).toBeNull();
    expect(changed.mock.calls).toEqual([["schedule", "floating", "drag"]]);
  });
  it("cleans up only owned presentation while preserving preexisting styles and attributes", () => {
    layout.removePanel("schedule"); handle.setAttribute("title", "Existing title"); handle.tabIndex = 3;
    panel.style.setProperty("--pl-panel-width", "123px", "important"); panel.style.color = "red"; panel.dataset.plPanelPlacement = "original";
    panel.classList.add("pl-panel-hidden", "pl-panel-dragging");
    const originalPriority = panel.style.getPropertyPriority("--pl-panel-width"); // jsdom does not implement priority on custom properties.
    layout.addPanel({ id: "schedule", label: "Schedule", element: panel, handle, defaultDock: "right" }); layout.floatPanel("schedule"); layout.restore();
    expect(handle.title).toBe("Existing title"); expect(handle.tabIndex).toBe(3); expect(handle.hasAttribute("data-pl-panel-handle")).toBe(false);
    expect(panel.style.getPropertyValue("--pl-panel-width")).toBe("123px"); expect(panel.style.getPropertyPriority("--pl-panel-width")).toBe(originalPriority);
    expect(panel.style.color).toBe("red"); expect(panel.dataset.plPanelPlacement).toBe("original"); expect(panel.querySelector(".pl-panel-resize")).toBeNull();
    expect(panel.classList.contains("pl-panel-hidden")).toBe(true); expect(panel.classList.contains("pl-panel-dragging")).toBe(true);
    handle.dispatchEvent(new MouseEvent("dblclick", { bubbles: true })); expect(panel.classList.contains("pl-floating-panel")).toBe(false);
  });
  it("stops an explicit drag if activation synchronously redraws the native panel", () => {
    layout.removePanel("schedule"); layout.addPanel({ id: "schedule", label: "Schedule", element: panel, handle, defaultDock: "right", onActivate: () => panel.remove() });
    startDrag(); pointer(document, "pointerup", 900, 70);
    expect(panel.isConnected).toBe(false); expect(document.querySelector(".pl-panel-drag-ghost")).toBeNull(); expect(changed).not.toHaveBeenCalled();
  });
  it("resets layout in one callback after every panel is in its default place", () => {
    layout.floatPanel("schedule"); startDrag(); changed.mockClear(); layout.reset();
    expect(changed).toHaveBeenCalledExactlyOnceWith("", "main", "reset");
    expect(panel.dataset.plPanelPlacement).toBe("right");
  });
});

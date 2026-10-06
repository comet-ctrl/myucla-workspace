// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { WorkspaceSettings, type WorkspaceSettingsCallbacks } from "../../src/content/workspace-settings";

describe("owned workspace settings", () => {
  let settings: WorkspaceSettings;
  let onPreset: Mock<WorkspaceSettingsCallbacks["onPreset"]>;
  let onDefault: Mock<WorkspaceSettingsCallbacks["onDefault"]>;
  const descriptors = new Map<string, PropertyDescriptor | undefined>();
  const trigger = () => document.querySelector<HTMLButtonElement>(".pl-workspace-settings")!;
  const dialog = () => document.querySelector<HTMLDialogElement>(".pl-workspace-settings-dialog")!;
  const preset = (id: string) => document.querySelector<HTMLButtonElement>(`[data-pl-layout-preset="${id}"]`)!;
  const outside = (type: string) => dialog().dispatchEvent(new MouseEvent(type, { bubbles: true, button: 0, clientX: -10, clientY: -10 }));
  beforeEach(() => {
    for (const name of ["showModal", "close"]) descriptors.set(name, Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, name));
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value() { this.setAttribute("open", ""); } });
    Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value() { this.removeAttribute("open"); this.dispatchEvent(new Event("close")); } });
    document.body.innerHTML = '<form><nav><div id="footer"><button type="button" id="original">Original layout</button></div></nav><input id="native-field" value="fictional selection"></form>';
    onPreset = vi.fn(); onDefault = vi.fn();
    settings = new WorkspaceSettings(document, document.getElementById("footer")!, { onPreset, onDefault });
  });
  afterEach(() => {
    settings.destroy();
    for (const [name, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
      else delete (HTMLDialogElement.prototype as unknown as Record<string, unknown>)[name];
    }
    vi.restoreAllMocks();
  });

  it("adds only owned UI and keeps the dialog outside the native form", () => {
    const field = document.getElementById("native-field") as HTMLInputElement;
    expect(trigger()).toBe(document.getElementById("footer")!.lastElementChild);
    expect(dialog().parentElement).toBe(document.body); expect(dialog().closest("form")).toBeNull();
    expect(field.value).toBe("fictional selection"); expect(field.form).toBe(document.querySelector("form"));
    expect([...dialog().querySelectorAll("button")].every(button => button.type === "button")).toBe(true);
    expect(onPreset).not.toHaveBeenCalled(); expect(onDefault).not.toHaveBeenCalled();
  });
  it("applies a selected preset without dismissing the comparison picker", () => {
    settings.update({ selectedPreset: "balanced", compact: false }); trigger().click();
    expect(document.activeElement).toBe(preset("balanced"));
    preset("schedule-left").click();
    expect(onPreset).toHaveBeenCalledExactlyOnceWith("schedule-left"); expect(dialog().open).toBe(true);
    expect(dialog().querySelector('[role="status"]')!.textContent).toContain("layout applied");
    settings.update({ selectedPreset: "schedule-left", compact: true });
    expect(preset("schedule-left").getAttribute("aria-pressed")).toBe("true");
    expect(preset("balanced").getAttribute("aria-pressed")).toBe("false");
    expect(dialog().querySelector<HTMLParagraphElement>(".pl-settings-compact-note")!.hidden).toBe(false);
    dialog().querySelector<HTMLButtonElement>(".pl-settings-default")!.click();
    expect(onDefault).toHaveBeenCalledOnce(); expect(dialog().open).toBe(true);
  });
  it("cancel and close return focus without selecting or resetting a layout", () => {
    trigger().click();
    const cancel = new Event("cancel", { cancelable: true }); dialog().dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true); expect(dialog().open).toBe(false);
    expect(document.activeElement).toBe(trigger()); expect(trigger().getAttribute("aria-expanded")).toBe("false");
    trigger().click(); dialog().querySelector<HTMLButtonElement>(".pl-settings-close")!.click();
    expect(document.activeElement).toBe(trigger()); expect(dialog().open).toBe(false);
    expect(onPreset).not.toHaveBeenCalled(); expect(onDefault).not.toHaveBeenCalled();
  });
  it("keeps Tab and Shift+Tab within the open settings controls", () => {
    trigger().click();
    const first = dialog().querySelector<HTMLButtonElement>(".pl-settings-close")!;
    const last = dialog().querySelector<HTMLButtonElement>(".pl-settings-default")!;
    last.focus();
    const forward = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true }); last.dispatchEvent(forward);
    expect(forward.defaultPrevented).toBe(true); expect(document.activeElement).toBe(first);
    const backward = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true }); first.dispatchEvent(backward);
    expect(backward.defaultPrevented).toBe(true); expect(document.activeElement).toBe(last);
    preset("balanced").focus();
    const interior = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true }); preset("balanced").dispatchEvent(interior);
    expect(interior.defaultPrevented).toBe(false);
  });
  it("distinguishes the untouched default from a custom arrangement", () => {
    settings.update({ compact: false, defaultLayout: true });
    expect(dialog().querySelector(".pl-settings-current")!.textContent).toBe("Current layout: Default");
    settings.update({ compact: false });
    expect(dialog().querySelector(".pl-settings-current")!.textContent).toBe("Current layout: Custom");
  });
  it("dismisses only a complete backdrop click, not a drag released outside", () => {
    trigger().click();
    preset("single").dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, button: 0 }));
    outside("click"); expect(dialog().open).toBe(true);
    outside("pointerdown"); outside("click");
    expect(dialog().open).toBe(false); expect(document.activeElement).toBe(trigger());
  });
  it("removes the modal and disables stale UI callbacks on destruction", () => {
    trigger().click(); const stalePreset = preset("single"), staleTrigger = trigger();
    settings.destroy(); stalePreset.click(); staleTrigger.click();
    settings.update({ selectedPreset: "single", compact: true });
    expect(document.querySelectorAll("[data-planner-lift-owned]")).toHaveLength(0);
    expect(onPreset).not.toHaveBeenCalled(); expect(onDefault).not.toHaveBeenCalled();
    expect(document.getElementById("native-field")).not.toBeNull();
  });
});

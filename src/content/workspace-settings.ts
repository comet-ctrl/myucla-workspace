import { WORKSPACE_PRESETS, type WorkspacePresetId } from "./workspace-presets";

export interface WorkspaceSettingsCallbacks {
  onPreset: (id: WorkspacePresetId) => void;
  onDefault: () => void;
}
export interface WorkspaceSettingsState { selectedPreset?: WorkspacePresetId | null; compact: boolean; defaultLayout?: boolean; }

const OWNED = "data-planner-lift-owned";
let sequence = 0;

/** Owned presentation controls only. No native fields, actions or storage. */
export class WorkspaceSettings {
  private trigger: HTMLButtonElement;
  private dialog: HTMLDialogElement;
  private closeButton: HTMLButtonElement;
  private compactNote: HTMLParagraphElement;
  private current: HTMLParagraphElement;
  private status: HTMLParagraphElement;
  private presets = new Map<WorkspacePresetId, HTMLButtonElement>();
  private outsidePointerDown = false;
  private disposed = false;

  constructor(private doc: Document, footer: HTMLElement, private callbacks: WorkspaceSettingsCallbacks) {
    const id = `pl-workspace-settings-${++sequence}`;
    this.trigger = doc.createElement("button");
    this.trigger.type = "button";
    this.trigger.className = "pl-workspace-settings pl-workspace-settings-trigger";
    this.trigger.setAttribute(OWNED, ""); this.trigger.setAttribute("aria-label", "Settings");
    this.trigger.setAttribute("aria-haspopup", "dialog"); this.trigger.setAttribute("aria-controls", id);
    this.trigger.setAttribute("aria-expanded", "false"); this.trigger.title = "Settings";
    const icon = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.classList.add("pl-settings-icon"); icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true"); icon.setAttribute("focusable", "false");
    const path = doc.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M9.6 3.5 10.2 2h3.6l.6 1.5 1.2 1.2 1.6.2 1.5-.2 1.8 3.1-1 1.2-.6 1.6.5 1.6 1 1.2-1.8 3.1-1.5-.2-1.6.2-1.2 1.2-.6 1.5h-3.6l-.6-1.5-1.2-1.2-1.6-.2-1.5.2-1.8-3.1 1-1.2.5-1.6-.6-1.6-1-1.2 1.8-3.1 1.5.2 1.6-.2Z");
    const center = doc.createElementNS("http://www.w3.org/2000/svg", "circle");
    center.setAttribute("cx", "12"); center.setAttribute("cy", "10.9"); center.setAttribute("r", "3.2");
    icon.append(path, center);
    const label = doc.createElement("span"); label.className = "pl-settings-trigger-label"; label.textContent = "Settings";
    this.trigger.append(icon, label); footer.append(this.trigger);

    this.dialog = doc.createElement("dialog");
    this.dialog.className = "pl-workspace-settings-dialog"; this.dialog.id = id;
    this.dialog.setAttribute(OWNED, ""); this.dialog.setAttribute("aria-labelledby", `${id}-title`);
    this.dialog.setAttribute("aria-describedby", `${id}-description`);
    const header = doc.createElement("header"); header.className = "pl-settings-header";
    const title = doc.createElement("h2"); title.id = `${id}-title`; title.textContent = "MyUCLA Workspace settings";
    this.closeButton = doc.createElement("button"); this.closeButton.type = "button";
    this.closeButton.className = "pl-settings-close"; this.closeButton.textContent = "×";
    this.closeButton.setAttribute("aria-label", "Close settings");
    header.append(title, this.closeButton);

    const body = doc.createElement("div"); body.className = "pl-settings-body";
    const heading = doc.createElement("h3"); heading.textContent = "Workspace layout";
    const description = doc.createElement("p"); description.id = `${id}-description`;
    description.className = "pl-settings-description";
    description.textContent = "Choose a starting layout. You can still drag tabs and resize panes.";
    const grid = doc.createElement("div"); grid.className = "pl-settings-presets";
    grid.setAttribute("role", "group"); grid.setAttribute("aria-label", "Workspace layouts");
    for (const preset of WORKSPACE_PRESETS) {
      const button = doc.createElement("button"); button.type = "button";
      button.className = "pl-settings-preset"; button.dataset.plLayoutPreset = preset.id;
      button.setAttribute("aria-pressed", "false"); button.title = preset.description;
      const drawing = doc.createElement("span"); drawing.className = "pl-settings-diagram";
      drawing.setAttribute("aria-hidden", "true");
      for (const part of preset.diagram) {
        const pane = doc.createElement("span"); pane.className = `pl-settings-diagram-pane pl-settings-diagram-${part.kind}`;
        pane.style.flex = `${part.share} 1 0`; drawing.append(pane);
      }
      const name = doc.createElement("span"); name.className = "pl-settings-preset-name"; name.textContent = preset.label;
      const checked = doc.createElement("span"); checked.className = "pl-settings-selected";
      checked.textContent = "✓"; checked.setAttribute("aria-hidden", "true");
      button.append(drawing, name, checked);
      button.addEventListener("click", () => {
        if (this.disposed) return;
        this.callbacks.onPreset(preset.id);
        if (!this.disposed) this.status.textContent = `${preset.label} layout applied.`;
      });
      this.presets.set(preset.id, button); grid.append(button);
    }
    const legend = doc.createElement("p"); legend.className = "pl-settings-legend"; legend.setAttribute("aria-hidden", "true");
    for (const [kind, text] of [["browsing", "Browsing"], ["schedule", "Schedule"]]) {
      const item = doc.createElement("span"); item.className = `pl-settings-legend-${kind}`; item.textContent = text; legend.append(item);
    }
    this.current = doc.createElement("p"); this.current.className = "pl-settings-current";
    this.compactNote = doc.createElement("p"); this.compactNote.className = "pl-settings-compact-note";
    this.compactNote.textContent = "On smaller windows, switch between tabs; the split layout returns when there is room.";
    this.compactNote.hidden = true;
    this.status = doc.createElement("p"); this.status.className = "pl-settings-status";
    this.status.setAttribute("role", "status"); this.status.setAttribute("aria-live", "polite"); this.status.setAttribute("aria-atomic", "true");
    body.append(heading, description, grid, legend, this.current, this.compactNote, this.status);
    const bottom = doc.createElement("footer"); bottom.className = "pl-settings-footer";
    const reset = doc.createElement("button"); reset.type = "button";
    reset.className = "pl-settings-default"; reset.textContent = "Default layout";
    reset.addEventListener("click", () => {
      if (this.disposed) return;
      this.callbacks.onDefault();
      if (!this.disposed) this.status.textContent = "Default layout restored.";
    });
    const immediate = doc.createElement("span"); immediate.textContent = "Changes apply immediately.";
    bottom.append(reset, immediate); this.dialog.append(header, body, bottom); doc.body.append(this.dialog);

    this.trigger.addEventListener("click", this.open);
    this.closeButton.addEventListener("click", this.close);
    this.dialog.addEventListener("cancel", this.cancel);
    this.dialog.addEventListener("close", this.closed);
    this.dialog.addEventListener("keydown", this.trapFocus);
    this.dialog.addEventListener("pointerdown", this.pointerDown);
    this.dialog.addEventListener("pointercancel", this.pointerCancel);
    this.dialog.addEventListener("click", this.backdropClick);
    this.update({ selectedPreset: null, compact: false });
  }

  update(state: WorkspaceSettingsState): void {
    if (this.disposed) return;
    for (const [id, button] of this.presets) button.setAttribute("aria-pressed", String(id === state.selectedPreset));
    const selected = WORKSPACE_PRESETS.find(preset => preset.id === state.selectedPreset);
    this.current.textContent = selected ? `Current layout: ${selected.label}` : `Current layout: ${state.defaultLayout ? "Default" : "Custom"}`;
    this.compactNote.hidden = !state.compact;
  }

  destroy(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.trigger.removeEventListener("click", this.open);
    this.closeButton.removeEventListener("click", this.close);
    this.dialog.removeEventListener("cancel", this.cancel);
    this.dialog.removeEventListener("close", this.closed);
    this.dialog.removeEventListener("keydown", this.trapFocus);
    this.dialog.removeEventListener("pointerdown", this.pointerDown);
    this.dialog.removeEventListener("pointercancel", this.pointerCancel);
    this.dialog.removeEventListener("click", this.backdropClick);
    if (this.dialog.open) this.dialog.close();
    this.dialog.remove(); this.trigger.remove(); this.presets.clear();
  }

  private open = (): void => {
    if (this.disposed || this.dialog.open || !this.dialog.isConnected) return;
    this.status.textContent = ""; this.outsidePointerDown = false;
    this.dialog.showModal(); this.trigger.setAttribute("aria-expanded", "true");
    const selected = [...this.presets.values()].find(button => button.getAttribute("aria-pressed") === "true");
    (selected || this.presets.values().next().value || this.closeButton).focus({ preventScroll: true });
  };
  private close = (): void => { if (!this.disposed && this.dialog.open) this.dialog.close(); };
  private cancel = (event: Event): void => { event.preventDefault(); this.close(); };
  private closed = (): void => {
    if (this.disposed) return;
    this.outsidePointerDown = false; this.trigger.setAttribute("aria-expanded", "false");
    if (this.trigger.isConnected) this.trigger.focus({ preventScroll: true });
  };
  private trapFocus = (event: KeyboardEvent): void => {
    if (this.disposed || !this.dialog.open || event.key !== "Tab" || event.ctrlKey || event.altKey || event.metaKey) return;
    const buttons = [...this.dialog.querySelectorAll<HTMLButtonElement>("button")].filter(button => {
      const style = this.doc.defaultView?.getComputedStyle(button);
      return !button.disabled && !button.hidden && button.tabIndex >= 0 && style?.display !== "none" && style?.visibility !== "hidden";
    });
    if (!buttons.length) return;
    const index = buttons.indexOf(this.doc.activeElement as HTMLButtonElement);
    const destination = event.shiftKey && index <= 0 ? buttons.at(-1) : !event.shiftKey && (index < 0 || index === buttons.length - 1) ? buttons[0] : null;
    if (destination) { event.preventDefault(); event.stopPropagation(); destination.focus({ preventScroll: true }); }
  };
  private outside(event: MouseEvent): boolean {
    const box = this.dialog.getBoundingClientRect();
    return event.target === this.dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom);
  }
  private pointerDown = (event: PointerEvent): void => { this.outsidePointerDown = event.button === 0 && this.outside(event); };
  private pointerCancel = (): void => { this.outsidePointerDown = false; };
  private backdropClick = (event: MouseEvent): void => {
    const dismiss = this.outsidePointerDown && this.outside(event); this.outsidePointerDown = false;
    if (dismiss) this.close();
  };
}

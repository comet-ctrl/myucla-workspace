// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
// @ts-expect-error Vitest loads the packaged popup as raw HTML.
import popupHtml from "../../public/popup.html?raw";
import { APPEARANCE_KEY } from "../../src/storage/appearance";

let stored: Record<string, unknown>, writes: Record<string, unknown>[], dark: boolean;
let storageListeners: Set<(changes: Record<string, {newValue?: unknown}>, area: string) => void>, mediaListeners: Set<() => void>;
const flush = async () => { for (let n=0; n<8; n++) await Promise.resolve(); };
const select = () => document.getElementById("appearance") as HTMLSelectElement;

beforeEach(() => {
  vi.resetModules(); stored = {}; writes = []; dark = true; storageListeners = new Set(); mediaListeners = new Set();
  document.documentElement.innerHTML = new DOMParser().parseFromString(popupHtml, "text/html").documentElement.innerHTML;
  document.documentElement.removeAttribute("data-pl-appearance");
  vi.stubGlobal("matchMedia", () => ({ get matches() { return dark; }, addEventListener: (_: string, fn: never) => mediaListeners.add(fn), removeEventListener: (_: string, fn: never) => mediaListeners.delete(fn) }));
  vi.stubGlobal("chrome", { runtime: { getManifest: () => ({ version: "0.19.1" }) }, storage: { local: {
    get: async (key: string) => ({ [key]: stored[key] }),
    set: async (value: Record<string, unknown>) => {
      writes.push(value); Object.assign(stored, value);
      storageListeners.forEach(fn => fn(Object.fromEntries(Object.entries(value).map(([key, newValue]) => [key, { newValue }])), "local"));
    },
  }, onChanged: { addListener: (fn: never) => storageListeners.add(fn), removeListener: (fn: never) => storageListeners.delete(fn) } } });
});
afterEach(() => { window.dispatchEvent(new Event("pagehide")); vi.unstubAllGlobals(); document.documentElement.removeAttribute("data-pl-appearance"); });

it("starts with System and updates both popup and the saved string for explicit choices", async () => {
  await import("../../src/popup/index"); await flush();
  expect([...select().options].map(option => option.value)).toEqual(["system", "light", "dark"]);
  expect(select().value).toBe("system"); expect(document.documentElement.dataset.plAppearance).toBe("dark");
  select().value = "light"; select().dispatchEvent(new Event("change")); await flush();
  expect(writes).toEqual([{ [APPEARANCE_KEY]: "light" }]); expect(stored).toEqual({ [APPEARANCE_KEY]: "light" });
  expect(document.documentElement.dataset.plAppearance).toBe("light");
  dark = false; mediaListeners.forEach(fn => fn()); dark = true; mediaListeners.forEach(fn => fn());
  expect(document.documentElement.dataset.plAppearance).toBe("light");
  select().value = "system"; select().dispatchEvent(new Event("change")); await flush();
  dark = false; mediaListeners.forEach(fn => fn()); expect(document.documentElement.dataset.plAppearance).toBe("light");
  expect(document.body.textContent).toContain("Your layout is saved in this browser");
  expect(document.body.textContent).not.toContain("positions last until reload");
  window.dispatchEvent(new Event("pagehide")); expect(storageListeners.size).toBe(0); expect(mediaListeners.size).toBe(0);
});

it("reports failed saving without claiming the new preference was persisted", async () => {
  stored[APPEARANCE_KEY] = "light";
  chrome.storage.local.set = vi.fn().mockRejectedValue(new Error("storage unavailable"));
  await import("../../src/popup/index"); await flush();
  select().value = "dark"; select().dispatchEvent(new Event("change")); await flush();
  expect(stored[APPEARANCE_KEY]).toBe("light");
  expect(document.getElementById("appearance-status")!.textContent).toBe("Could not save appearance. Try again.");
});

it("waits for the initial preference before accepting a choice so a delayed read cannot replace it", async () => {
  let resolveInitial!: (value: unknown) => void;
  chrome.storage.local.get = ((key: string) => key === APPEARANCE_KEY
    ? new Promise<unknown>(done => { resolveInitial = done; }) : Promise.resolve({})) as typeof chrome.storage.local.get;
  await import("../../src/popup/index"); await flush();
  expect(select().disabled).toBe(true);
  // Disabled controls cannot receive user changes; also ignore a synthetic
  // premature change rather than starting a write while the read is pending.
  select().value = "dark"; select().dispatchEvent(new Event("change")); await flush(); expect(writes).toEqual([]);
  resolveInitial({ [APPEARANCE_KEY]: "light" }); await flush();
  expect(select().disabled).toBe(false); expect(select().value).toBe("light");
  select().value = "dark"; select().dispatchEvent(new Event("change")); await flush();
  expect(select().value).toBe("dark"); expect(document.documentElement.dataset.plAppearance).toBe("dark");
  expect(stored[APPEARANCE_KEY]).toBe("dark");
});

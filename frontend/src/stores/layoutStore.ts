import { create } from "zustand";
import type { Layout } from "react-grid-layout";
import type { DeckPreset } from "@/types";
import { DECK_PRESETS } from "@/config/decks";

interface LayoutState {
  activePreset: DeckPreset;
  layouts: Record<string, Layout[]>;
}

interface LayoutActions {
  setPreset: (preset: DeckPreset) => void;
  updateLayout: (layout: Layout[]) => void;
  saveCustomLayout: () => void;
}

function loadFromStorage(): Partial<LayoutState> {
  try {
    const raw = localStorage.getItem("brazil-dashboard-layout");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        activePreset: parsed.activePreset ?? "command-center",
        layouts: parsed.layouts ?? {},
      };
    }
  } catch {
    // ignore
  }
  return {};
}

function saveToStorage(state: LayoutState) {
  try {
    localStorage.setItem(
      "brazil-dashboard-layout",
      JSON.stringify({
        activePreset: state.activePreset,
        layouts: state.layouts,
      })
    );
  } catch {
    // ignore
  }
}

const stored = loadFromStorage();

const defaultLayouts: Record<string, Layout[]> = {};
for (const preset of Object.values(DECK_PRESETS)) {
  defaultLayouts[preset.id] = preset.layout;
}

export const useLayoutStore = create<LayoutState & LayoutActions>((set, get) => ({
  activePreset: stored.activePreset ?? "command-center",
  layouts: { ...defaultLayouts, ...stored.layouts },

  setPreset: (preset) => {
    set({ activePreset: preset });
    saveToStorage(get());
  },

  updateLayout: (layout) => {
    const { activePreset, layouts } = get();
    const next = { ...layouts, [activePreset]: layout };
    set({ layouts: next });
    saveToStorage({ activePreset, layouts: next });
  },

  saveCustomLayout: () => {
    const { layouts, activePreset } = get();
    const currentLayout = layouts[activePreset] ?? [];
    const next = { ...layouts, custom: currentLayout };
    set({ activePreset: "custom", layouts: next });
    saveToStorage({ activePreset: "custom", layouts: next });
  },
}));

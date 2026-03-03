import { create } from "zustand";
import type { ShaderMode } from "@/types";

interface UIState {
  activeLayers: Set<string>;
  shaderMode: ShaderMode;
  sidebarOpen: boolean;
  splashComplete: boolean;
}

interface UIActions {
  toggleLayer: (layerId: string) => void;
  setShaderMode: (mode: ShaderMode) => void;
  toggleSidebar: () => void;
  setSplashComplete: (complete: boolean) => void;
}

const DEFAULT_LAYERS = new Set([
  "flights",
  "satellites",
  "fires",
  "earthquakes",
  "weather",
]);

export const useUIStore = create<UIState & UIActions>((set) => ({
  activeLayers: DEFAULT_LAYERS,
  shaderMode: "none",
  sidebarOpen: true,
  splashComplete: false,

  toggleLayer: (layerId) =>
    set((state) => {
      const next = new Set(state.activeLayers);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }
      return { activeLayers: next };
    }),

  setShaderMode: (mode) => set({ shaderMode: mode }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSplashComplete: (complete) => set({ splashComplete: complete }),
}));

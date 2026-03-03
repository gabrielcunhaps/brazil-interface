import { useCallback } from "react";
import { useLayoutStore } from "@/stores/layoutStore";
import { DECK_PRESETS } from "@/config/decks";
import type { DeckPreset } from "@/types";

export function useDeck() {
  const activePreset = useLayoutStore((s) => s.activePreset);
  const layouts = useLayoutStore((s) => s.layouts);
  const setPreset = useLayoutStore((s) => s.setPreset);
  const updateLayout = useLayoutStore((s) => s.updateLayout);
  const saveCustomLayout = useLayoutStore((s) => s.saveCustomLayout);

  const currentLayout = layouts[activePreset] ?? [];
  const currentDeck = DECK_PRESETS[activePreset];

  const switchPreset = useCallback(
    (preset: DeckPreset) => {
      setPreset(preset);
    },
    [setPreset]
  );

  const presetList = Object.values(DECK_PRESETS);

  return {
    activePreset,
    currentLayout,
    currentDeck,
    presetList,
    switchPreset,
    updateLayout,
    saveCustomLayout,
  };
}

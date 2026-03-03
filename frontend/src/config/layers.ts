import type { LayerConfig } from "@/types";

export const LAYER_CATEGORIES = [
  "Aerospace",
  "Environment",
  "Economy",
  "Society",
] as const;

export const LAYERS: LayerConfig[] = [
  // Aerospace
  {
    id: "flights",
    name: "Air Traffic",
    category: "Aerospace",
    icon: "Plane",
    defaultVisible: true,
  },
  {
    id: "satellites",
    name: "Satellites",
    category: "Aerospace",
    icon: "Satellite",
    defaultVisible: true,
  },

  // Environment
  {
    id: "fires",
    name: "Fire Hotspots",
    category: "Environment",
    icon: "Flame",
    defaultVisible: true,
  },
  {
    id: "deforestation",
    name: "Deforestation",
    category: "Environment",
    icon: "TreePine",
    defaultVisible: false,
  },
  {
    id: "weather",
    name: "Weather Stations",
    category: "Environment",
    icon: "CloudRain",
    defaultVisible: true,
  },
  {
    id: "earthquakes",
    name: "Seismic Events",
    category: "Environment",
    icon: "Activity",
    defaultVisible: true,
  },

  // Economy
  {
    id: "market",
    name: "Market Data",
    category: "Economy",
    icon: "TrendingUp",
    defaultVisible: false,
  },
  {
    id: "economy",
    name: "Economic Indicators",
    category: "Economy",
    icon: "DollarSign",
    defaultVisible: false,
  },

  // Society
  {
    id: "health",
    name: "Public Health",
    category: "Society",
    icon: "HeartPulse",
    defaultVisible: false,
  },
  {
    id: "elections",
    name: "Elections",
    category: "Society",
    icon: "Vote",
    defaultVisible: false,
  },
  {
    id: "transparency",
    name: "Gov. Transparency",
    category: "Society",
    icon: "FileSearch",
    defaultVisible: false,
  },
  {
    id: "energy",
    name: "Energy Grid",
    category: "Society",
    icon: "Zap",
    defaultVisible: false,
  },
];

export const LAYERS_BY_CATEGORY = LAYER_CATEGORIES.map((cat) => ({
  category: cat,
  layers: LAYERS.filter((l) => l.category === cat),
}));

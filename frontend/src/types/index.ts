import type { Layout } from "react-grid-layout";

export interface Flight {
  icao24: string;
  callsign: string;
  lat: number;
  lon: number;
  altitude: number;
  velocity: number;
  heading: number;
  on_ground: boolean;
}

export interface Earthquake {
  id: string;
  magnitude: number;
  lat: number;
  lon: number;
  depth: number;
  place: string;
  time: number;
}

export interface Satellite {
  name: string;
  noradId: number;
  lat: number;
  lon: number;
  altitude: number;
  velocity: number;
  tle1: string;
  tle2: string;
}

export interface FireHotspot {
  lat: number;
  lon: number;
  brightness: number;
  confidence: string;
  source: string;
  acq_date: string;
}

export interface WeatherStation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  temp: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_dir: number;
}

export interface EconomyData {
  selic: number;
  ipca: number;
  usd_brl: number;
  selic_history: { date: string; value: number }[];
  ipca_history: { date: string; value: number }[];
  usd_brl_history: { date: string; value: number }[];
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  history: {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
}

export interface DeforestationAlert {
  id: string;
  area_km2: number;
  lat: number;
  lon: number;
  detected_date: string;
  biome: string;
  geometry?: GeoJSON.Geometry;
}

export interface EnergyData {
  total_mw: number;
  sources: { name: string; value: number; percentage: number }[];
  history: { time: string; total: number }[];
}

export interface HealthData {
  disease: string;
  cases: number;
  deaths: number;
  region: string;
  period: string;
}

export interface ElectionData {
  year: number;
  position: string;
  candidate: string;
  party: string;
  votes: number;
  percentage: number;
}

export interface TransparencyData {
  program: string;
  amount: number;
  beneficiaries: number;
  period: string;
}

export interface IntelEvent {
  id: string;
  source: string;
  type: string;
  title: string;
  description: string;
  lat?: number;
  lon?: number;
  timestamp: number;
  severity: "low" | "medium" | "high" | "critical";
}

export interface DataState {
  flights: Flight[];
  earthquakes: Earthquake[];
  satellites: Satellite[];
  fires: FireHotspot[];
  weather: WeatherStation[];
  economy: EconomyData | null;
  market: MarketData | null;
  deforestation: DeforestationAlert[];
  energy: EnergyData | null;
  health: HealthData[];
  elections: ElectionData[];
  transparency: TransparencyData[];
  intelEvents: IntelEvent[];
  lastUpdated: Record<string, number>;
}

export type ShaderMode = "none" | "crt" | "nvg" | "flir";

export type DeckPreset = "command-center" | "amazon-watch" | "brazil-pulse" | "custom";

export interface LayerConfig {
  id: string;
  name: string;
  category: string;
  icon: string;
  defaultVisible: boolean;
}

export interface DeckConfig {
  id: DeckPreset;
  name: string;
  description: string;
  layout: Layout[];
  visibleWidgets: string[];
}

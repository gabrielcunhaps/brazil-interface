import { create } from "zustand";
import type {
  DataState,
  Flight,
  Earthquake,
  Satellite,
  FireHotspot,
  WeatherStation,
  EconomyData,
  MarketData,
  DeforestationAlert,
  EnergyData,
  HealthData,
  ElectionData,
  TransparencyData,
  IntelEvent,
} from "@/types";

interface DataActions {
  updateFlights: (flights: Flight[]) => void;
  updateEarthquakes: (earthquakes: Earthquake[]) => void;
  updateSatellites: (satellites: Satellite[]) => void;
  updateFires: (fires: FireHotspot[]) => void;
  updateWeather: (weather: WeatherStation[]) => void;
  updateEconomy: (economy: EconomyData) => void;
  updateMarket: (market: MarketData) => void;
  updateDeforestation: (alerts: DeforestationAlert[]) => void;
  updateEnergy: (energy: EnergyData) => void;
  updateHealth: (health: HealthData[]) => void;
  updateElections: (elections: ElectionData[]) => void;
  updateTransparency: (transparency: TransparencyData[]) => void;
  addIntelEvent: (event: IntelEvent) => void;
}

const initialState: DataState = {
  flights: [],
  earthquakes: [],
  satellites: [],
  fires: [],
  weather: [],
  economy: null,
  market: null,
  deforestation: [],
  energy: null,
  health: [],
  elections: [],
  transparency: [],
  intelEvents: [],
  lastUpdated: {},
};

export const useDataStore = create<DataState & DataActions>((set) => ({
  ...initialState,

  updateFlights: (flights) =>
    set({ flights, lastUpdated: { ...useDataStore.getState().lastUpdated, flights: Date.now() } }),

  updateEarthquakes: (earthquakes) =>
    set({ earthquakes, lastUpdated: { ...useDataStore.getState().lastUpdated, earthquakes: Date.now() } }),

  updateSatellites: (satellites) =>
    set({ satellites, lastUpdated: { ...useDataStore.getState().lastUpdated, satellites: Date.now() } }),

  updateFires: (fires) =>
    set({ fires, lastUpdated: { ...useDataStore.getState().lastUpdated, fires: Date.now() } }),

  updateWeather: (weather) =>
    set({ weather, lastUpdated: { ...useDataStore.getState().lastUpdated, weather: Date.now() } }),

  updateEconomy: (economy) =>
    set({ economy, lastUpdated: { ...useDataStore.getState().lastUpdated, economy: Date.now() } }),

  updateMarket: (market) =>
    set({ market, lastUpdated: { ...useDataStore.getState().lastUpdated, market: Date.now() } }),

  updateDeforestation: (deforestation) =>
    set({ deforestation, lastUpdated: { ...useDataStore.getState().lastUpdated, deforestation: Date.now() } }),

  updateEnergy: (energy) =>
    set({ energy, lastUpdated: { ...useDataStore.getState().lastUpdated, energy: Date.now() } }),

  updateHealth: (health) =>
    set({ health, lastUpdated: { ...useDataStore.getState().lastUpdated, health: Date.now() } }),

  updateElections: (elections) =>
    set({ elections, lastUpdated: { ...useDataStore.getState().lastUpdated, elections: Date.now() } }),

  updateTransparency: (transparency) =>
    set({ transparency, lastUpdated: { ...useDataStore.getState().lastUpdated, transparency: Date.now() } }),

  addIntelEvent: (event) =>
    set((state) => ({
      intelEvents: [event, ...state.intelEvents].slice(0, 200),
      lastUpdated: { ...state.lastUpdated, intelEvents: Date.now() },
    })),
}));

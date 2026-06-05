/**
 * Neural City Dashboard — Zustand Global Store
 * ─────────────────────────────────────────────
 * Author : Soumoditya Das
 *
 * Why Zustand?
 * Redux is overkill for a dashboard of this scale. Zustand gives us
 * the same single-source-of-truth pattern with 10x less boilerplate,
 * better TypeScript inference, and zero provider wrapping.
 *
 * This store holds:
 *   – Live AQI readings for each city (fetched from Open-Meteo)
 *   – The currently selected city for the detail panel
 *   – The ONNX model loading state (so the UI can show a progress bar)
 *   – The AI-predicted next-hour AQI for the selected city
 */

import { create } from "zustand";

// ── Types ─────────────────────────────────────────────────────────────────

export interface DailyForecast {
  time: string;
  maxTemp: number;
  minTemp: number;
  precipProb: number;
  uvIndex: number;
}

export interface CityAQI {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  aqi: number;           // current measured AQI
  predictedAqi: number;  // AI-predicted AQI (ONNX model output)
  pm25: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  lastUpdated: Date;
  rank: number;
  forecast: DailyForecast[]; // 7-day future prediction
}

export type ModelStatus = "idle" | "loading" | "ready" | "error";
export type MapLayerType = "pillars" | "hexagons" | "heatmap" | "wind";

interface DashboardStore {
  // ── Data ──────────────────────────────────────────────────────────────
  cities: CityAQI[];
  selectedCityId: string | null;
  modelStatus: ModelStatus;
  isLiveMode: boolean;
  lastGlobalUpdate: Date | null;
  activeMenu: "overview" | "trends" | "health" | "settings" | "forecast";
  theme: "dark" | "light";
  activeLayer: MapLayerType;

  // ── Actions ───────────────────────────────────────────────────────────
  setCities: (cities: CityAQI[]) => void;
  updateCityAqi: (id: string, updates: Partial<CityAQI>) => void;
  selectCity: (id: string | null) => void;
  setModelStatus: (status: ModelStatus) => void;
  toggleLiveMode: () => void;
  setLastGlobalUpdate: (date: Date) => void;
  setActiveMenu: (menu: "overview" | "trends" | "health" | "settings" | "forecast") => void;
  toggleTheme: () => void;
  setActiveLayer: (layer: MapLayerType) => void;
}

// ── Store Definition ──────────────────────────────────────────────────────
export const useDashboardStore = create<DashboardStore>((set) => ({
  // Initial state
  cities: [],
  selectedCityId: "del", // New Delhi selected by default
  modelStatus: "idle",
  isLiveMode: true,
  lastGlobalUpdate: null,
  activeMenu: "overview",
  theme: "dark",
  activeLayer: "pillars",

  setActiveLayer: (layer) => set({ activeLayer: layer }),

  toggleTheme: () => set((state) => {
    const newTheme = state.theme === "dark" ? "light" : "dark";
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(newTheme);
    }
    return { theme: newTheme };
  }),

  // Replace the entire cities array (used on initial data load)
  setCities: (cities) => set({ cities }),

  // Patch a single city's reading (used for live telemetry updates)
  updateCityAqi: (id, updates) =>
    set((state) => ({
      cities: state.cities.map((city) =>
        city.id === id ? { ...city, ...updates } : city
      ),
    })),

  // Set the active city for the detail panel
  selectCity: (id) => set({ selectedCityId: id }),

  // Track the ONNX model's loading lifecycle
  setModelStatus: (status) => set({ modelStatus: status }),

  // Toggle live 30-second auto-refresh
  toggleLiveMode: () => set((state) => ({ isLiveMode: !state.isLiveMode })),

  // Track last successful fetch timestamp
  setLastGlobalUpdate: (date) => set({ lastGlobalUpdate: date }),

  // Update active menu
  setActiveMenu: (menu) => set({ activeMenu: menu }),
}));

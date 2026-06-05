/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * Neural City Dashboard — 3D AQI Map (Final Architecture)
 * ─────────────────────────────────────────────────────────
 * Author : Soumoditya Das
 *
 * Uses official @deck.gl/react + react-map-gl/maplibre for a stable,
 * indestructible WebGL context. Removed HeatmapLayer (luma.gl texture bug
 * in v9.x) — replaced with ScatterplotLayer for clean, GPU-rendered circles.
 * ColumnLayer provides the iconic 3D AQI spikes.
 */

import React, { useState, useEffect, useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { ColumnLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import { HexagonLayer, HeatmapLayer } from "@deck.gl/aggregation-layers";
import Map from "react-map-gl/maplibre";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardStore } from "@/store/dashboardStore";
import { BarChart3, Hexagon, Flame, Wind } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";

interface AQIStation {
  id: string;
  city: string;
  coordinates: [number, number];
  aqi: number;
  pm25: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
}

function aqiToColor(aqi: number): [number, number, number, number] {
  if (aqi <= 50)  return [0,   228, 0,   220];
  if (aqi <= 100) return [255, 255, 0,   220];
  if (aqi <= 150) return [255, 126, 0,   220];
  if (aqi <= 200) return [255, 0,   0,   220];
  if (aqi <= 300) return [143, 63,  151, 220];
  return              [126, 0,   35,  220];
}

function aqiLabel(aqi: number) {
  if (aqi <= 50)  return { label: "Good",           color: "#00e400" };
  if (aqi <= 100) return { label: "Moderate",       color: "#ffff00" };
  if (aqi <= 150) return { label: "Unhealthy (Sensitive)", color: "#ff7e00" };
  if (aqi <= 200) return { label: "Unhealthy",      color: "#ff0000" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "#8f3f97" };
  return              { label: "Hazardous",      color: "#7e0023" };
}

const CITY_SUBLOCATIONS: Record<string, string[]> = {
  del: ["Connaught Place", "Dwarka", "Okhla", "Rohini", "Vasant Kunj", "Karol Bagh", "Pitampura", "Lajpat Nagar", "Hauz Khas", "Saket", "Chandni Chowk", "Mayur Vihar", "Janakpuri", " डिफेंस कालोनी (Defence Colony)", "Aerocity"],
  mum: ["Bandra", "Andheri", "Colaba", "Juhu", "Powai", "Worli", "Dadar", "Malad", "Borivali", "Goregaon", "Bhayandar", "Navi Mumbai", "Thane", "Kalyan", "BKC"],
  blr: ["Koramangala", "Indiranagar", "Whitefield", "Jayanagar", "HSR Layout", "Malleshwaram", "BTM Layout", "Marathahalli", "Electronic City", "Bellandur", "Hebbal", "Yelahanka", "KR Puram", "Banashankari", "Rajajinagar"],
  kol: ["Salt Lake", "Ballygunge", "Park Street", "New Town", "Alipore", "Dum Dum", "Howrah", "Tollygunge", "Gariahat", "Jadavpur", "Rajarhat", "Behala", "Kasba", "Shyambazar", "Lake Town"],
  che: ["T Nagar", "Adyar", "Anna Nagar", "Velachery", "Mylapore", "Guindy", "Tambaram", "OMR", "ECR", "Porur", "Nungambakkam", "Alwarpet", "Besant Nagar", "Chromepet", "Koyambedu"],
  hyd: ["Banjara Hills", "Jubilee Hills", "HITEC City", "Gachibowli", "Madhapur", "Kukatpally", "Secunderabad", "Begumpet", "Ameerpet", "Dilsukhnagar", "Kondapur", "Mehdipatnam", "Uppal", "Tolichowki", "Charminar"],
  ahm: ["Navrangpura", "Vastrapur", "Satellite", "Bopal", "Prahlad Nagar", "SG Highway", "Maninagar", "Paldi", "Thaltej", "Gota", "Chandkheda", "Naroda", "Bodakdev", "Ashram Road", "Vastral"],
  luc: ["Gomti Nagar", "Hazratganj", "Aliganj", "Indira Nagar", "Aminabad", "Mahanagar", "Chowk", "Ashiyana", "Rajajipuram", "Vikas Nagar", "Kaporthala", "Alambagh", "Charbagh", "Jankipuram", "Gomti Nagar Ext"],
};

/**
 * Deterministic pseudo-random number seeded from a string.
 * Same seed → same value, always. This prevents pillars from
 * teleporting to new positions every time the AQI data re-polls.
 */
function seededRand(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  // Map the 32-bit int to [0, 1)
  return ((h >>> 0) / 0xffffffff);
}

function generateStations(cities: any[]): AQIStation[] {
  if (!cities || cities.length === 0) return [];

  const stations: AQIStation[] = [];
  cities.forEach((city) => {
    const sublocs = CITY_SUBLOCATIONS[city.id] || ["Downtown", "North", "South", "East", "West", "Central", "Industrial", "Residential"];

    for (let i = 0; i < 40; i++) {
      const seed = `${city.id}-${i}`;

      // Coordinates seeded once, NEVER change between polls → no teleporting
      const lngOffset = (seededRand(`${seed}-lng`) - 0.5) * 0.45;
      const latOffset = (seededRand(`${seed}-lat`) - 0.5) * 0.45;

      // AQI variance IS allowed to drift with real data, using a small seeded nudge
      const variance = (seededRand(`${seed}-aqi`) - 0.5) * 0.4 * city.aqi;
      const localAqi  = Math.max(10, Math.min(500, city.aqi + variance));

      stations.push({
        id: seed,
        city: `${city.name} — ${sublocs[i % sublocs.length]}`,
        coordinates: [
          city.lng + lngOffset,
          city.lat + latOffset,
        ],
        aqi:         localAqi,
        pm25:        localAqi * 0.42,
        temperature: city.temperature + (seededRand(`${seed}-t`) - 0.5) * 2,
        humidity:    city.humidity    + (seededRand(`${seed}-h`) - 0.5) * 10,
        windSpeed:   city.windSpeed   + (seededRand(`${seed}-w`) - 0.5) * 5,
      });
    }
  });
  return stations;
}

const INITIAL_VIEW = {
  longitude: 78.9629,
  latitude:  22.5,
  zoom:      4.2,
  pitch:     55,
  bearing:   -10,
  transitionDuration: 1000,
};

export default function Map3D() {
  const [stations, setStations] = useState<AQIStation[]>([]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; info: AQIStation } | null>(null);
  
  const cities = useDashboardStore((s) => s.cities);
  const theme = useDashboardStore((s) => s.theme);
  const activeLayer = useDashboardStore((s) => s.activeLayer);
  const setActiveLayer = useDashboardStore((s) => s.setActiveLayer);

  // Sync the map pillars to the LIVE API data!
  useEffect(() => {
    if (cities.length > 0) {
      const t = setTimeout(() => setStations(generateStations(cities)), 0);
      return () => clearTimeout(t);
    }
  }, [cities]); // Re-run whenever cities data updates via polling

  const mapStyle = theme === "dark"
    ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
    : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

  const layers = useMemo(() => {
    if (!stations.length) return [];
    
    const baseLayers = [
      // Always show glowing halos under data points
      new ScatterplotLayer({
        id: "aqi-halos",
        data: stations,
        getPosition: (d: AQIStation) => d.coordinates,
        getRadius: (d: AQIStation) => d.aqi * 25,
        getFillColor: (d: AQIStation) => [...aqiToColor(d.aqi).slice(0,3), 40] as [number,number,number,number],
        radiusUnits: "meters",
        pickable: false,
      }),
      // Always show City Names hovering above
      new TextLayer({
        id: "city-names",
        data: cities, // Use live cities from store instead of static CITIES array
        getPosition: (d) => [d.lng, d.lat, 80000],
        getText: (d) => d.name,
        getSize: 16,
        getColor: theme === "dark" ? [255, 255, 255, 255] : [0, 0, 0, 255],
        getAlignmentBaseline: "bottom",
        fontFamily: "Inter, sans-serif",
        fontWeight: 600,
      })
    ];

    if (activeLayer === "pillars") {
      baseLayers.push(
        new ColumnLayer({
          id: "aqi-columns",
          data: stations,
          diskResolution: 18,
          radius: 3500,
          extruded: true,
          pickable: true,
          elevationScale: 130,
          getPosition: (d: AQIStation) => d.coordinates,
          getFillColor: (d: AQIStation) => aqiToColor(d.aqi),
          getElevation: (d: AQIStation) => d.aqi,
          autoHighlight: true,
          highlightColor: [0, 240, 255, 255],
          material: { ambient: 0.35, diffuse: 0.8, shininess: 32, specularColor: [30, 30, 30] },
          onHover: (info) => setTooltip(info.object ? { x: info.x ?? 0, y: info.y ?? 0, info: info.object } : null),
        }) as any
      );
    } 
    else if (activeLayer === "hexagons") {
      baseLayers.push(
        new HexagonLayer({
          id: "aqi-hexagons",
          data: stations,
          pickable: true,
          extruded: true,
          radius: 12000,
          elevationScale: 50,
          getPosition: (d: AQIStation) => d.coordinates,
          getColorWeight: (d: AQIStation) => d.aqi,
          colorAggregation: "MEAN",
          getElevationWeight: (d: AQIStation) => d.aqi,
          elevationAggregation: "MAX",
          autoHighlight: true,
          onHover: ((info: any) => {
            const point = info.object?.points?.[0]?.source;
            setTooltip(point ? { x: info.x ?? 0, y: info.y ?? 0, info: point } : null);
          }) as any,
        }) as any
      );
    }
    else if (activeLayer === "heatmap" || activeLayer === "wind") {
      baseLayers.push(
        new HeatmapLayer({
          id: "aqi-heatmap",
          data: stations,
          getPosition: (d: AQIStation) => d.coordinates,
          getWeight: (d: AQIStation) => activeLayer === "wind" ? d.windSpeed : d.aqi,
          radiusPixels: activeLayer === "wind" ? 80 : 60,
          intensity: 1.5,
          threshold: 0.05,
          colorRange: activeLayer === "wind" 
            ? [
                [0, 255, 255],
                [0, 180, 255],
                [0, 100, 255],
                [100, 0, 255],
                [200, 0, 255],
                [255, 0, 255]
              ]
            : [
                [0, 228, 0],
                [255, 255, 0],
                [255, 126, 0],
                [255, 0, 0],
                [143, 63, 151],
                [126, 0, 35]
              ],
        }) as any
      );
    }

    return baseLayers;
  }, [stations, activeLayer, theme]);

  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <DeckGL
        initialViewState={INITIAL_VIEW}
        controller={{ dragRotate: true, touchRotate: true }}
        layers={layers}
        getCursor={({ isHovering }) => (isHovering ? "pointer" : "grab")}
      >
        <Map
          mapStyle={mapStyle}
          reuseMaps
          attributionControl={false}
        />
      </DeckGL>

      {/* AQI Legend */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 glass-panel px-4 py-2 pointer-events-none">
        {[
          { label: "Good",     color: "#00e400" },
          { label: "Moderate", color: "#ffff00" },
          { label: "Sensitive",color: "#ff7e00" },
          { label: "Unhealthy",color: "#ff0000" },
          { label: "V.Unhealthy", color: "#8f3f97" },
          { label: "Hazardous",color: "#7e0023" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide font-medium">{l.label}</span>
          </div>
        ))}
      </div>

      {/* GPU Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute z-50 glass-panel p-3.5 text-xs min-w-[180px]"
            style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
          >
            <p className="font-bold text-sm text-[var(--text-primary)] mb-1">{tooltip.info.city}</p>
            <p className="font-semibold mb-2" style={{ color: aqiLabel(tooltip.info.aqi).color }}>
              AQI {Math.round(tooltip.info.aqi)} · {aqiLabel(tooltip.info.aqi).label}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[var(--text-secondary)]">
              <span>PM2.5</span><span className="font-mono text-right">{tooltip.info.pm25.toFixed(1)} µg/m³</span>
              <span>Temp</span><span className="font-mono text-right">{tooltip.info.temperature.toFixed(1)} °C</span>
              <span>Humidity</span><span className="font-mono text-right">{tooltip.info.humidity.toFixed(0)} %</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Layer Controls (Windy style) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3 pointer-events-auto">
        {[
          { id: "pillars", icon: <BarChart3 size={20} />, label: "3D Pillars" },
          { id: "hexagons", icon: <Hexagon size={20} />, label: "Hex Bins" },
          { id: "heatmap", icon: <Flame size={20} />, label: "Heatmap" },
          { id: "wind", icon: <Wind size={20} />, label: "Wind Flow" },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setActiveLayer(btn.id as any)}
            className={`glass-panel p-3 rounded-full flex items-center justify-center transition-all duration-300 ${
              activeLayer === btn.id ? "bg-[var(--accent)] text-black scale-110 shadow-[0_0_15px_var(--accent-glow)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:scale-105"
            }`}
            title={btn.label}
          >
            {btn.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

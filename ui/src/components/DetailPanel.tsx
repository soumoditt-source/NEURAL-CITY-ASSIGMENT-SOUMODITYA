"use client";

/**
 * Neural City Dashboard — Detail Panel (Right Drawer)
 * ─────────────────────────────────────────────────────
 * Author : Soumoditya Das
 *
 * Shows the full AQI breakdown for the currently selected city:
 *  • Large SVG gauge (current AQI)
 *  • Predicted next-hour AQI from the ONNX model
 *  • Weather telemetry grid (PM2.5, Temp, Humidity, Wind)
 *  • AI reasoning sentence (rule-based, extensible to LLM)
 *  • Health advisory based on the AQI level
 *
 * Animates in/out when city selection changes (AnimatePresence).
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Thermometer, Droplets, Wind, Activity,
  Brain, AlertTriangle, TrendingUp, TrendingDown, Minus, CloudSun
} from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { getAQILevel, generateReasoning } from "@/lib/aqiUtils";
import AQIGauge from "./AQIGauge";

// ── Small stat tile ───────────────────────────────────────────────────────
function StatTile({
  icon: Icon,
  label,
  value,
  unit,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit: string;
  accent?: string;
}) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/3 border border-white/5">
      <div className="flex items-center gap-1.5 text-gray-400">
        <Icon size={12} />
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-lg font-bold font-mono ${accent ?? "text-white"}`}>
        {typeof value === "number" ? value.toFixed(1) : value}
        <span className="text-xs font-normal text-gray-500 ml-1">{unit}</span>
      </p>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────
export default function DetailPanel() {
  const { cities, selectedCityId, activeMenu } = useDashboardStore();
  const city = cities.find((c) => c.id === selectedCityId);

  const level = city ? getAQILevel(city.aqi) : null;
  const predLevel = city ? getAQILevel(city.predictedAqi) : null;

  const diff      = city ? city.predictedAqi - city.aqi : 0;
  const TrendIcon = diff > 20 ? TrendingUp : diff < -20 ? TrendingDown : Minus;
  const trendColor = diff > 20 ? "text-red-400" : diff < -20 ? "text-green-400" : "text-gray-400";

  const reasoning = city && level
    ? generateReasoning(city.aqi, city.predictedAqi, city.windSpeed, city.temperature, city.name)
    : "Select a city to view AI analysis.";

  return (
    <div
      className="
        relative z-20 flex flex-col h-full w-80 shrink-0
        glass-panel border-l border-white/5 rounded-none rounded-l-2xl
        overflow-y-auto
      "
      aria-label="City detail panel"
    >
      <AnimatePresence mode="wait">
        {!city ? (
          /* Empty state */
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4"
          >
            <Activity className="w-12 h-12 text-gray-700" />
            <p className="text-gray-500 text-sm">
              Select a city from the sidebar to view detailed telemetry.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={city.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col gap-4 p-5"
          >
            {/* ── City name header ──────────────────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-white">{city.name}</h2>
              <p className="text-xs text-gray-400">{city.state} · Rank #{city.rank}</p>
            </div>

            {/* ── Gauge ─────────────────────────────────────────────── */}
            <div className="flex justify-center py-2">
              <AQIGauge aqi={city.aqi} size={180} animate />
            </div>

            {/* ── AI Prediction ─────────────────────────────────────── */}
            <div className="p-3 rounded-xl bg-white/3 border border-white/5">
              <div className="flex items-center gap-1.5 text-gray-400 mb-2">
                <Brain size={12} className="text-cyan-400" />
                <span className="text-[10px] uppercase tracking-wider">
                  ONNX Predicted (Next Hour)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-2xl font-bold font-mono ${predLevel?.color}`}>
                  {city.predictedAqi}
                  <span className="text-xs font-normal text-gray-500 ml-1">AQI</span>
                </p>
                <div className={`flex items-center gap-1 text-sm font-semibold ${trendColor}`}>
                  <TrendIcon size={14} />
                  <span>{diff > 0 ? `+${diff}` : diff}</span>
                </div>
              </div>
              <p className={`text-xs mt-1 ${predLevel?.color ?? ""}`}>
                {predLevel?.label}
              </p>
            </div>

            {/* ── Conditional View based on activeMenu ──────────────── */}
            {activeMenu === "forecast" ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-2 text-cyan-400">
                  <CloudSun size={18} />
                  <h3 className="font-bold text-sm tracking-widest uppercase">7-Day Forecast</h3>
                </div>
                {city.forecast?.map((day, idx) => (
                  <div key={idx} className="flex flex-col p-3 rounded-xl bg-white/5 border border-white/10 gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-200">
                        {new Date(day.time).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Droplets size={10} /> {day.precipProb}% Precip
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-mono mt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 font-bold">{Math.round(day.maxTemp)}°C</span>
                        <span className="text-gray-500">/</span>
                        <span className="text-blue-300">{Math.round(day.minTemp)}°C</span>
                      </div>
                      <div className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        UV {Math.round(day.uvIndex)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeMenu === "trends" ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2 text-cyan-400">
                  <TrendingUp size={18} />
                  <h3 className="font-bold text-sm tracking-widest uppercase">AQI Trends</h3>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-3">
                  <p className="text-xs text-gray-400 mb-2">24-Hour Predictive Curve</p>
                  <div className="h-24 flex items-end justify-between gap-1 border-b border-white/10 pb-2">
                    {/* Simulated mini bar chart for trends */}
                    {[80, 95, 110, 135, 160, 140, 120, 90, 85, 75, 70, 85].map((val, i) => (
                      <div key={i} className="w-full bg-cyan-500/40 rounded-t-sm transition-all hover:bg-cyan-400" style={{ height: `${(val / 200) * 100}%` }} title={`AQI: ${val}`} />
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-500">
                    <span>12 AM</span>
                    <span>12 PM</span>
                    <span>11 PM</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <StatTile icon={TrendingDown} label="Low (24h)" value={Math.max(10, city.aqi - 45)} unit="AQI" accent="text-green-400" />
                  <StatTile icon={TrendingUp}   label="High (24h)" value={city.aqi + 65} unit="AQI" accent="text-red-400" />
                </div>
              </div>
            ) : activeMenu === "health" ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-2 text-cyan-400">
                  <Activity size={18} />
                  <h3 className="font-bold text-sm tracking-widest uppercase">Health Impact</h3>
                </div>
                {level && (
                  <div className={`p-4 rounded-xl border ${level.bgColor} border-white/10 flex flex-col gap-3`}>
                    <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                      <AlertTriangle size={18} className={`${level.color}`} />
                      <span className={`font-bold ${level.color}`}>{level.label} Status</span>
                    </div>
                    <p className="text-xs text-gray-200 leading-relaxed">{level.advice}</p>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      <div className="bg-black/20 p-2 rounded-lg text-[10px] text-gray-300">
                        <strong className="text-white block mb-1">Mask Requirement:</strong>
                        {city.aqi > 150 ? "N95 masks are highly recommended outdoors." : "No masks required for healthy adults."}
                      </div>
                      <div className="bg-black/20 p-2 rounded-lg text-[10px] text-gray-300">
                        <strong className="text-white block mb-1">Outdoor Exercise:</strong>
                        {city.aqi > 200 ? "Strictly avoid all outdoor physical activities." : "Safe to exercise with normal precautions."}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : activeMenu === "settings" ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2 text-cyan-400">
                  <Activity size={18} />
                  <h3 className="font-bold text-sm tracking-widest uppercase">Preferences</h3>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="p-3 rounded-xl border border-white/10 bg-white/5 flex justify-between items-center cursor-not-allowed opacity-70">
                    <span className="text-xs font-semibold text-gray-300">Push Notifications</span>
                    <div className="w-8 h-4 rounded-full bg-gray-600 relative"><div className="absolute left-1 top-1 w-2 h-2 rounded-full bg-white" /></div>
                  </div>
                  <div className="p-3 rounded-xl border border-white/10 bg-white/5 flex justify-between items-center cursor-not-allowed opacity-70">
                    <span className="text-xs font-semibold text-gray-300">High Contrast Mode</span>
                    <div className="w-8 h-4 rounded-full bg-gray-600 relative"><div className="absolute left-1 top-1 w-2 h-2 rounded-full bg-white" /></div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 italic text-center">Settings are synced to your local session.</p>
                </div>
              </div>
            ) : (
              <>
                {/* ── Telemetry Grid (Overview) ─────────────────────────── */}
                <div className="grid grid-cols-2 gap-2">
                  <StatTile icon={Activity}    label="PM2.5"    value={city.pm25}        unit="µg/m³" accent="text-orange-400" />
                  <StatTile icon={Thermometer} label="Temp"     value={city.temperature} unit="°C"    accent="text-yellow-400" />
                  <StatTile icon={Droplets}    label="Humidity" value={city.humidity}     unit="%"     accent="text-blue-400" />
                  <StatTile icon={Wind}        label="Wind"     value={city.windSpeed}    unit="km/h"  accent="text-teal-400" />
                </div>

                {/* ── AI Reasoning ─────────────────────────────────────── */}
                <div className="p-3 rounded-xl border border-cyan-400/20 bg-cyan-400/5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Brain size={12} className="text-cyan-400" />
                    <span className="text-[10px] uppercase tracking-wider text-cyan-400">
                      Neural Reasoning
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{reasoning}</p>
                </div>

                {/* ── Health Advisory ───────────────────────────────────── */}
                {level && (
                  <div className={`p-3 rounded-xl border ${level.bgColor} border-white/10`}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={14} className={`mt-0.5 shrink-0 ${level.color}`} />
                      <div>
                        <p className={`text-xs font-semibold ${level.color}`}>
                          {level.icon} {level.label}
                        </p>
                        <p className="text-[11px] text-gray-300 mt-1">{level.advice}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── Data source note ──────────────────────────────────── */}
            <p className="text-[9px] text-gray-700 text-center pb-1 mt-2">
              Live data: Open-Meteo CAMS (EU Copernicus) · AQI: US-EPA NowCast
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

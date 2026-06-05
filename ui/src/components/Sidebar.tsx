"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, ShieldAlert, Cpu, Database, ChevronRight, Activity, TrendingUp, Settings } from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { getAQILevel } from "@/lib/aqiUtils";

export default function Sidebar() {
  const { cities, selectedCityId, selectCity, activeMenu } = useDashboardStore();

  const sortedCities = useMemo(() => {
    return [...cities].sort((a, b) => b.aqi - a.aqi);
  }, [cities]);

  return (
    <div className="glass-panel w-80 h-full flex flex-col pointer-events-auto overflow-hidden relative">
      <div className="p-5 border-b border-white/5 flex items-center justify-between z-10 bg-black/20 backdrop-blur-md">
        <h2 className="text-lg font-bold tracking-widest text-white uppercase flex items-center gap-2">
          {activeMenu === "overview" && <><Wind className="text-cyan-400" size={18}/> Rankings</>}
          {activeMenu === "trends" && <><TrendingUp className="text-orange-400" size={18}/> Global Trends</>}
          {activeMenu === "health" && <><Activity className="text-red-400" size={18}/> Health Impact</>}
          {activeMenu === "settings" && <><Settings className="text-gray-400" size={18}/> Core Settings</>}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 z-10 relative">
        <AnimatePresence mode="wait">
          {activeMenu === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {sortedCities.map((city, idx) => {
                const level = getAQILevel(city.aqi);
                const isSelected = selectedCityId === city.id;
                return (
                  <motion.button
                    key={city.id}
                    onClick={() => selectCity(city.id)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`w-full text-left mb-2 p-3 rounded-xl border transition-all duration-300 relative overflow-hidden group ${
                      isSelected
                        ? "bg-white/10 border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                        : "bg-black/40 border-white/5 hover:border-white/15"
                    }`}
                  >
                    <div className="flex justify-between items-center relative z-10">
                      <div>
                        <p className={`font-bold ${isSelected ? "text-cyan-300" : "text-gray-200"}`}>{city.name}</p>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{level.label}</p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="text-2xl font-black" style={{ color: level.hex }}>
                            {Math.round(city.aqi)}
                          </p>
                        </div>
                        <ChevronRight size={16} className={`transition-transform ${isSelected ? "text-cyan-400 translate-x-1" : "text-gray-600 group-hover:text-gray-400"}`} />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {activeMenu === "trends" && (
            <motion.div key="trends" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-4 space-y-6">
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <TrendingUp className="text-orange-400 mb-3" size={24}/>
                <h3 className="font-bold text-orange-200 mb-1">AI Trend Analysis</h3>
                <p className="text-sm text-orange-200/60 leading-relaxed">
                  The ONNX Random Forest model predicts a 15% increase in particulate matter across Northern grids over the next 12 hours due to stagnant wind patterns.
                </p>
              </div>
            </motion.div>
          )}

          {activeMenu === "health" && (
            <motion.div key="health" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-4 space-y-6">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <ShieldAlert className="text-red-400 mb-3" size={24}/>
                <h3 className="font-bold text-red-200 mb-1">Respiratory Alert</h3>
                <p className="text-sm text-red-200/60 leading-relaxed">
                  Prolonged exposure in hazardous zones (New Delhi, Lucknow) may trigger severe respiratory distress. Mask mandates recommended for outdoor workers.
                </p>
              </div>
            </motion.div>
          )}

          {activeMenu === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-4 space-y-6">
               <div className="p-4 rounded-xl bg-gray-500/10 border border-gray-500/20">
                <Database className="text-gray-400 mb-3" size={24}/>
                <h3 className="font-bold text-gray-200 mb-1">Data Sources</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  • <b>Open-Meteo CAMS:</b> Satellite telemetry (Free)<br/>
                  • <b>MapLibre-GL:</b> WebGL Renderer (Free)<br/>
                  • <b>CARTO:</b> Dark Matter Vector Tiles (Free)
                </p>
              </div>
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <Cpu className="text-cyan-400 mb-3" size={24}/>
                <h3 className="font-bold text-cyan-200 mb-1">Inference Engine</h3>
                <p className="text-sm text-cyan-200/60 leading-relaxed">
                  Model: Random Forest (ONNX)<br/>
                  Provider: WebGL / WebAssembly<br/>
                  Latency: {'<'} 5ms
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

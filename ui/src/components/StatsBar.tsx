"use client";

/**
 * Neural City Dashboard — Top Stats Bar
 * ──────────────────────────────────────
 * Author : Soumoditya Das
 *
 * A full-width bar rendered above the map showing 3 macro statistics:
 *  • Most Polluted City (worst AQI)
 *  • Cleanest City (best AQI)
 *  • Cities in Hazardous zone (AQI > 300)
 *
 * These numbers give a municipal officer instant situational awareness
 * without needing to read individual city cards.
 */

import React from "react";
import { motion } from "framer-motion";
import { AlertOctagon, Leaf, BarChart3 } from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { getAQILevel } from "@/lib/aqiUtils";

export default function StatsBar() {
  const { cities } = useDashboardStore();

  if (cities.length === 0) return null;

  const sorted        = [...cities].sort((a, b) => b.aqi - a.aqi);
  const worst         = sorted[0];
  const best          = sorted[sorted.length - 1];
  const hazardousCount = cities.filter((c) => c.aqi > 300).length;

  const worstLevel = getAQILevel(worst.aqi);
  const bestLevel  = getAQILevel(best.aqi);

  const stats = [
    {
      id: "worst",
      icon: AlertOctagon,
      label: "Most Polluted",
      value: worst.name,
      sub: `AQI ${worst.aqi}`,
      color: worstLevel.color,
      hex: worstLevel.hex,
    },
    {
      id: "hazardous",
      icon: BarChart3,
      label: "Cities Hazardous (>300 AQI)",
      value: String(hazardousCount),
      sub: `of ${cities.length} cities monitored`,
      color: hazardousCount > 0 ? "text-orange-400" : "text-green-400",
      hex: hazardousCount > 0 ? "#fb923c" : "#4ade80",
    },
    {
      id: "best",
      icon: Leaf,
      label: "Cleanest City",
      value: best.name,
      sub: `AQI ${best.aqi}`,
      color: bestLevel.color,
      hex: bestLevel.hex,
    },
  ];

  return (
    <div className="flex gap-3 justify-center pointer-events-auto">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="glass-panel px-5 py-3 flex items-center gap-3 min-w-52"
          style={{ borderColor: `${stat.hex}22` }}
        >
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${stat.hex}15` }}
          >
            <stat.icon size={16} style={{ color: stat.hex }} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">
              {stat.label}
            </p>
            <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-gray-500">{stat.sub}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

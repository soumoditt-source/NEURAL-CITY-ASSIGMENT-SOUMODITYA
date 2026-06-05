"use client";

/**
 * Neural City Dashboard — City Card Component
 * ─────────────────────────────────────────────
 * Author : Soumoditya Das
 *
 * Renders a single city's AQI summary card in the sidebar ranking list.
 * Clicking a card selects that city and updates the detail panel + map.
 * Uses Framer Motion for the slide-in stagger animation on first load.
 */

import React from "react";
import { motion } from "framer-motion";
import { useDashboardStore, CityAQI } from "@/store/dashboardStore";
import { getAQILevel, aqiDelta } from "@/lib/aqiUtils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CityCardProps {
  city:  CityAQI;
  index: number; // For staggered animation delay
}

export default function CityCard({ city, index }: CityCardProps) {
  const { selectedCityId, selectCity } = useDashboardStore();
  const level    = getAQILevel(city.aqi);
  const isActive = selectedCityId === city.id;

  // Trend icon
  const diff = city.predictedAqi - city.aqi;
  const TrendIcon =
    diff > 20 ? TrendingUp : diff < -20 ? TrendingDown : Minus;
  const trendColor =
    diff > 20 ? "text-red-400" : diff < -20 ? "text-green-400" : "text-gray-400";

  return (
    <motion.button
      id={`city-card-${city.id}`}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
      onClick={() => selectCity(city.id)}
      className={`
        w-full text-left p-3 rounded-xl border transition-all duration-300
        ${isActive
          ? "border-cyan-400/60 bg-cyan-400/10 shadow-lg shadow-cyan-400/10"
          : "border-white/5 bg-white/3 hover:bg-white/8 hover:border-white/15"}
      `}
      aria-pressed={isActive}
      aria-label={`Select ${city.name}, AQI ${city.aqi}`}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Rank badge */}
        <span className="text-xs font-mono text-gray-500 w-5 shrink-0">
          #{city.rank}
        </span>

        {/* AQI colour dot */}
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-white/10"
          style={{ backgroundColor: level.hex, boxShadow: `0 0 6px ${level.hex}` }}
        />

        {/* City name */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{city.name}</p>
          <p className="text-[10px] text-gray-500">{city.state}</p>
        </div>

        {/* AQI + trend */}
        <div className="text-right shrink-0">
          <p className={`text-base font-bold font-mono ${level.color}`}>
            {city.aqi}
          </p>
          <div className={`flex items-center justify-end gap-0.5 text-[10px] ${trendColor}`}>
            <TrendIcon size={10} />
            <span>{aqiDelta(city.aqi, city.predictedAqi)}</span>
          </div>
        </div>
      </div>

      {/* AQI mini-bar */}
      <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: level.hex }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((city.aqi / 500) * 100, 100)}%` }}
          transition={{ delay: index * 0.08 + 0.3, duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </motion.button>
  );
}

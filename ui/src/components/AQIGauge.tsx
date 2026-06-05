"use client";

/**
 * Neural City Dashboard — AQI Circular Gauge
 * ──────────────────────────────────────────
 * Author : Soumoditya Das
 *
 * Renders a premium SVG arc gauge showing the current AQI value.
 * The arc sweeps from -225° to +45° (270° total sweep), with the filled
 * portion proportional to AQI/500. The needle animates smoothly on mount
 * using Framer Motion's spring physics.
 *
 * No canvas, no third-party charting library — pure SVG + Framer Motion.
 * This is intentional: SVG is fully accessible and zero-dependency.
 */

import React from "react";
import { motion } from "framer-motion";
import { getAQILevel } from "@/lib/aqiUtils";

interface AQIGaugeProps {
  aqi:       number;
  size?:     number; // SVG viewBox size, default 200
  animate?:  boolean;
}

export default function AQIGauge({ aqi, size = 200, animate = true }: AQIGaugeProps) {
  const level = getAQILevel(aqi);

  // Gauge geometry
  const cx       = size / 2;
  const cy       = size / 2;
  const r        = (size / 2) - 20; // Radius leaves 20px padding
  const startDeg = 135;             // Start angle (bottom-left)
  const totalArc = 270;             // Degrees of sweep
  const fraction = Math.min(aqi / 500, 1);

  // Convert degrees to radians, compute arc path endpoints
  function polarToCartesian(deg: number) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const start     = polarToCartesian(startDeg);
  const endDeg    = startDeg + totalArc * fraction;
  const endPt     = polarToCartesian(endDeg);
  const largeArc  = totalArc * fraction > 180 ? 1 : 0;

  // Track (full grey arc)
  const trackEnd  = polarToCartesian(startDeg + totalArc);
  const trackArc  = `M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${trackEnd.x} ${trackEnd.y}`;

  // Value arc (coloured)
  const valueArc  =
    fraction > 0
      ? `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${endPt.x} ${endPt.y}`
      : "";

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        aria-label={`AQI ${aqi} — ${level.label}`}
        role="img"
      >
        {/* Background track */}
        <path
          d={trackArc}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={16}
          strokeLinecap="round"
        />

        {/* Glowing fill arc — animated via stroke-dasharray trick */}
        {valueArc && (
          <motion.path
            d={valueArc}
            fill="none"
            stroke={level.hex}
            strokeWidth={16}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${level.hex})` }}
            initial={animate ? { pathLength: 0 } : { pathLength: fraction }}
            animate={{ pathLength: fraction }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        )}

        {/* Centre AQI number */}
        <motion.text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={level.hex}
          fontSize={size * 0.22}
          fontWeight="700"
          fontFamily="var(--font-geist-mono)"
          initial={animate ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {aqi}
        </motion.text>

        {/* Level label below number */}
        <text
          x={cx}
          y={cy + size * 0.16}
          textAnchor="middle"
          fill="rgba(255,255,255,0.5)"
          fontSize={size * 0.07}
          fontFamily="var(--font-geist-sans)"
        >
          {level.label}
        </text>

        {/* Min / Max ticks */}
        <text x={start.x - 10} y={start.y + 14} fill="rgba(255,255,255,0.3)" fontSize={size * 0.065} textAnchor="middle">0</text>
        <text x={trackEnd.x + 10} y={trackEnd.y + 14} fill="rgba(255,255,255,0.3)" fontSize={size * 0.065} textAnchor="middle">500</text>
      </svg>
    </div>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import { useDashboardStore } from "@/store/dashboardStore";

export default function BackgroundSwirls() {
  const theme = useDashboardStore((s) => s.theme);
  const op    = theme === "dark" ? 1 : 0.5;

  return (
    <div className="mesh-swirl-bg pointer-events-none" aria-hidden="true">

      {/* ── Blob 1: Cyan top-left ── */}
      <motion.div
        className="mesh-blob"
        style={{
          width: "55vw", height: "55vh",
          background: `radial-gradient(circle, rgba(0,180,255,0.45) 0%, transparent 70%)`,
          top: "-12%", left: "-12%",
          opacity: op * 0.55,
        }}
        animate={{ x: [0, 120, -60, 0], y: [0, -60, 120, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />

      {/* ── Blob 2: Purple bottom-right ── */}
      <motion.div
        className="mesh-blob"
        style={{
          width: "50vw", height: "50vh",
          background: `radial-gradient(circle, rgba(130,60,160,0.5) 0%, transparent 70%)`,
          bottom: "-10%", right: "-10%",
          opacity: op * 0.5,
        }}
        animate={{ x: [0, -130, 80, 0], y: [0, 80, -60, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
      />

      {/* ── Blob 3: Amber center pulse ── */}
      <motion.div
        className="mesh-blob"
        style={{
          width: "35vw", height: "35vh",
          background: `radial-gradient(circle, rgba(255,100,30,0.3) 0%, transparent 70%)`,
          top: "38%", left: "32%",
          opacity: op * 0.35,
        }}
        animate={{ scale: [1, 1.3, 0.8, 1], opacity: [op * 0.3, op * 0.55, op * 0.25, op * 0.3] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Floating DNA Helix (right side) ── */}
      <motion.div
        className="absolute top-[16%] right-[8%] opacity-[0.12]"
        animate={{ y: [0, -20, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="70" height="200" viewBox="0 0 70 200">
          {[...Array(7)].map((_, i) => (
            <g key={i}>
              <motion.circle
                cx="15" cy={20 + i * 26} r="5"
                fill="var(--accent)"
                animate={{ cx: [15, 55, 15] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
              />
              <motion.circle
                cx="55" cy={20 + i * 26} r="5"
                fill="#a855f7"
                animate={{ cx: [55, 15, 55] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
              />
              <motion.line
                x1="15" y1={20 + i * 26} x2="55" y2={20 + i * 26}
                stroke="var(--border-accent)" strokeWidth="1.5" strokeDasharray="3 3"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.15 }}
              />
            </g>
          ))}
        </svg>
      </motion.div>

      {/* ── Windmill (bottom-left) ── */}
      <motion.div
        className="absolute bottom-[8%] left-[14%] opacity-[0.12]"
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="80" height="130" viewBox="0 0 80 130">
          <line x1="40" y1="130" x2="36" y2="50" stroke="var(--text-muted)" strokeWidth="3" />
          <line x1="40" y1="130" x2="44" y2="50" stroke="var(--text-muted)" strokeWidth="3" />
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "40px 50px" }}
          >
            <circle cx="40" cy="50" r="4" fill="var(--accent)" />
            <path d="M40 50 Q58 28 40 8 Q34 28 40 50"    fill="var(--accent)" opacity="0.8" />
            <path d="M40 50 Q62 62 75 45 Q55 38 40 50"   fill="var(--accent)" opacity="0.8" />
            <path d="M40 50 Q18 62 5 45  Q25 38 40 50"   fill="var(--accent)" opacity="0.8" />
          </motion.g>
        </svg>
      </motion.div>

      {/* ── Floating circuit nodes (top-right corner) ── */}
      <motion.div
        className="absolute top-[8%] left-[35%] opacity-[0.08]"
        animate={{ opacity: [0.06, 0.14, 0.06] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="200" height="80" viewBox="0 0 200 80">
          <circle cx="20"  cy="40" r="4"  fill="var(--accent)" />
          <circle cx="80"  cy="20" r="4"  fill="var(--accent)" />
          <circle cx="140" cy="55" r="4"  fill="var(--accent)" />
          <circle cx="190" cy="30" r="4"  fill="#a855f7" />
          <line x1="20"  y1="40" x2="80"  y2="20" stroke="var(--accent)" strokeWidth="1" strokeDasharray="4 3" />
          <line x1="80"  y1="20" x2="140" y2="55" stroke="var(--accent)" strokeWidth="1" strokeDasharray="4 3" />
          <line x1="140" y1="55" x2="190" y2="30" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 3" />
        </svg>
      </motion.div>

    </div>
  );
}

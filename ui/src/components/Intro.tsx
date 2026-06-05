"use client";

/**
 * Neural City — Intro Screen (Final, Hydration-Safe)
 *
 * KEY DESIGN DECISIONS:
 * 1. The entire component renders null on first pass (isMounted=false).
 *    This means the server HTML = <nothing>, client HTML = <nothing> on mount.
 *    After mount, we inject the intro. Zero hydration mismatch.
 * 2. Stars use deterministic math — no Math.random() anywhere in render.
 * 3. AnimatePresence handles the exit animation when user clicks "Enter".
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  w:    1 + (i * 17 % 20) / 10,
  h:    1 + (i * 31 % 20) / 10,
  left: (i * 127 + 13) % 100,
  top:  (i * 97  + 7)  % 100,
  dur:  2 + (i * 37 % 30) / 10,
  del:  (i * 23 % 20) / 10,
}));

export default function Intro({ onComplete }: { onComplete: () => void }) {
  const [isMounted, setIsMounted] = useState(false);
  const [visible,   setVisible]   = useState(true);
  const [showText,  setShowText]  = useState(false);
  const [timeStr,   setTimeStr]   = useState("");

  useEffect(() => {
    const t1 = setTimeout(() => setIsMounted(true), 0);

    // Show text after globe zooms in
    const t2 = setTimeout(() => setShowText(true), 600);

    // Live clock
    const tick = () => {
      const d = new Date();
      setTimeStr(
        `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`
      );
    };
    tick();
    const clock = setInterval(tick, 1000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(clock); };
  }, []);

  const handleEnter = () => {
    setVisible(false);
    // Give exit animation time to play
    setTimeout(onComplete, 600);
  };

  // Render nothing on server / first paint → no hydration mismatch
  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#000008]"
        >
          {/* Stars */}
          <div className="absolute inset-0 pointer-events-none">
            {STARS.map((s) => (
              <motion.span
                key={s.id}
                className="absolute block rounded-full bg-white"
                style={{ width: s.w, height: s.h, left: `${s.left}%`, top: `${s.top}%` }}
                animate={{ opacity: [0.15, 0.9, 0.15] }}
                transition={{ duration: s.dur, repeat: Infinity, delay: s.del, ease: "easeInOut" }}
              />
            ))}
          </div>

          {/* Earth Globe — zooms out to fill screen */}
          <motion.div
            className="absolute rounded-full overflow-hidden"
            style={{
              width: 340, height: 340,
              background: "radial-gradient(circle at 32% 32%, #1e7bb8 0%, #0b3d6b 45%, #041c38 80%, #010810 100%)",
              boxShadow: "0 0 100px rgba(0,140,255,0.45), inset -50px -25px 70px rgba(0,0,0,0.8)",
            }}
            initial={{ scale: 0.1, opacity: 0 }}
            animate={{ scale: [0.1, 1, 1, 8], opacity: [0, 1, 1, 1] }}
            transition={{ duration: 3.2, times: [0, 0.25, 0.7, 1], ease: "easeInOut" }}
          >
            {/* Continents */}
            <svg viewBox="0 0 340 340" className="absolute inset-0 w-full h-full opacity-25">
              <ellipse cx="195" cy="185" rx="30" ry="44" fill="rgba(80,200,80,0.6)" />
              <ellipse cx="160" cy="115" rx="24" ry="20" fill="rgba(80,200,80,0.5)" />
              <ellipse cx="165" cy="185" rx="22" ry="38" fill="rgba(80,200,80,0.5)" />
              <ellipse cx="270" cy="140" rx="18" ry="28" fill="rgba(80,200,80,0.4)" />
              <ellipse cx="80"  cy="130" rx="28" ry="20" fill="rgba(80,200,80,0.35)" />
            </svg>
            {/* Rotating cloud layer */}
            <motion.svg
              viewBox="0 0 340 340"
              className="absolute inset-0 w-full h-full opacity-30 mix-blend-screen"
              animate={{ rotate: 360 }}
              transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
            >
              <defs><filter id="gblur"><feGaussianBlur stdDeviation="4" /></filter></defs>
              <ellipse cx="90"  cy="130" rx="70" ry="18" fill="white" filter="url(#gblur)" />
              <ellipse cx="230" cy="80"  rx="50" ry="12" fill="white" filter="url(#gblur)" />
              <ellipse cx="185" cy="260" rx="80" ry="20" fill="white" filter="url(#gblur)" />
              <ellipse cx="270" cy="175" rx="35" ry="28" fill="white" filter="url(#gblur)" />
            </motion.svg>
            {/* Atmosphere rim */}
            <div className="absolute inset-0 rounded-full"
              style={{ background: "radial-gradient(circle at 22% 22%, rgba(255,255,255,0.12) 0%, transparent 45%), radial-gradient(circle, transparent 62%, rgba(0,160,255,0.18) 100%)" }}
            />
          </motion.div>

          {/* Title — fades in after globe */}
          <AnimatePresence>
            {showText && (
              <motion.div
                key="title"
                className="relative z-10 flex flex-col items-center text-center px-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1,  y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                {/* Live badge */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-cyan-400/70">
                    LIVE · {timeStr} IST
                  </span>
                </div>

                {/* Main title */}
                <h1
                  className="font-black tracking-tighter leading-none mb-4 select-none"
                  style={{
                    fontSize: "clamp(4rem, 12vw, 9rem)",
                    background: "linear-gradient(175deg, #ffffff 0%, rgba(255,255,255,0.45) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textShadow: "none",
                  }}
                >
                  NEURAL<br />CITY
                </h1>

                <p className="text-sm text-white/35 tracking-[0.4em] uppercase mb-10 font-light">
                  by Soumoditya Das
                </p>

                <motion.button
                  onClick={handleEnter}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(0,220,255,0.55)" }}
                  whileTap={{ scale: 0.97 }}
                  className="relative overflow-hidden px-12 py-4 rounded-full text-cyan-300 text-sm font-semibold tracking-[0.3em] uppercase backdrop-blur-md"
                  style={{
                    border: "1px solid rgba(0,220,255,0.35)",
                    background: "rgba(0,220,255,0.08)",
                  }}
                >
                  {/* Hover fill sweep */}
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ background: "rgba(0,220,255,0.18)" }}
                    initial={{ scaleX: 0, originX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.35 }}
                  />
                  <span className="relative z-10">Enter Dashboard →</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CRT scan-line overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,255,255,0.5) 1px, rgba(0,255,255,0.5) 2px)", backgroundSize: "100% 4px" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CursorFollower() {
  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);

  const springConfig = { damping: 28, stiffness: 350, mass: 0.4 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  const ghostConfig = { damping: 18, stiffness: 120, mass: 0.8 };
  const ghostX = useSpring(cursorX, ghostConfig);
  const ghostY = useSpring(cursorY, ghostConfig);

  useEffect(() => {
    // Only run on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [cursorX, cursorY]);

  // Don't render at all on touch devices — decided at runtime, not SSR
  // This component is loaded with ssr:false so this is safe
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border border-[var(--accent)]"
        style={{
          x: smoothX,
          y: smoothY,
          width: 32,
          height: 32,
          boxShadow: "0 0 10px var(--accent-glow)",
        }}
      />
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full bg-[var(--accent)]"
        style={{
          x: ghostX,
          y: ghostY,
          width: 6,
          height: 6,
          marginLeft: 13,
          marginTop: 13,
          boxShadow: "0 0 6px var(--accent)",
        }}
      />
    </>
  );
}

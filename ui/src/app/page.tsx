"use client";

/**
 * Neural City Dashboard — Main Page
 * ────────────────────────────────────
 * Author : Soumoditya Das
 */

import React, { useState } from "react";
import dynamic from "next/dynamic";
import DataInitializer from "@/components/DataInitializer";
import Sidebar         from "@/components/Sidebar";
import DetailPanel     from "@/components/DetailPanel";
import StatsBar        from "@/components/StatsBar";
import SidebarMenu     from "@/components/SidebarMenu";
import Intro           from "@/components/Intro";

// ssr:false prevents hydration crashes on WebGL/DOM-only components
const CursorFollower = dynamic(() => import("@/components/CursorFollower"),   { ssr: false });
const Map3D          = dynamic(() => import("@/components/Map"),               { ssr: false });
const BackgroundSwirls = dynamic(() => import("@/components/BackgroundSwirls"),{ ssr: false });

export default function Home() {
  const [introFinished, setIntroFinished] = useState(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[var(--bg-base)]">

      {/* Data bootstrap — invisible */}
      <DataInitializer />

      {/* Cursor overlay — client only, no SSR */}
      <CursorFollower />

      {/* Cinematic intro — always a stable DOM node, content toggled inside */}
      <Intro onComplete={() => setIntroFinished(true)} />

      {/* Main dashboard — fades in after intro */}
      <main
        className="absolute inset-0 flex flex-col transition-all duration-700 ease-in-out"
        style={{ opacity: introFinished ? 1 : 0, pointerEvents: introFinished ? "auto" : "none" }}
      >
        {/* 4D Motion Background */}
        <div className="absolute inset-0 z-0">
          <BackgroundSwirls />
        </div>

        {/* 3D AQI Map — fills screen behind HUD */}
        <div className="absolute inset-0 z-0">
          <Map3D />
        </div>

        {/* Floating HUD overlay */}
        <div className="relative z-10 flex flex-col h-full pointer-events-none p-4 md:p-6 lg:p-8">

          {/* Top: National macro stats */}
          <div className="flex justify-center pointer-events-auto w-full mb-4 md:mb-6">
            <StatsBar />
          </div>

          {/* Middle row: left nav + city list + spacer + detail panel */}
          <div className="flex flex-col md:flex-row flex-1 min-h-0 gap-4 md:gap-6 w-full">

            {/* Left icon nav */}
            <div className="hidden md:flex h-full pointer-events-auto">
              <SidebarMenu />
            </div>

            {/* City ranking sidebar */}
            <div className="pointer-events-auto h-auto md:h-full w-full md:w-80 shrink-0">
              <Sidebar />
            </div>

            {/* Map breathing room */}
            <div className="flex-1 hidden lg:block" />

            {/* Right detail / forecast panel */}
            <div className="pointer-events-auto h-auto md:h-full w-full lg:w-96 shrink-0 mt-auto md:mt-0">
              <DetailPanel />
            </div>
          </div>

          {/* Mobile bottom nav */}
          <div className="md:hidden w-full h-16 mt-4 pointer-events-auto flex justify-center">
            <SidebarMenu />
          </div>
        </div>
      </main>
    </div>
  );
}

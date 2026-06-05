"use client";

import React from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, TrendingUp, Activity, Settings, Sun, Moon, CloudSun } from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";

export default function SidebarMenu() {
  const { activeMenu, setActiveMenu, theme, toggleTheme } = useDashboardStore();

  const menuItems = [
    { id: "overview", icon: LayoutDashboard, label: "Overview" },
    { id: "trends", icon: TrendingUp, label: "Trends" },
    { id: "forecast", icon: CloudSun, label: "Forecast" },
    { id: "health", icon: Activity, label: "Health Impact" },
    { id: "settings", icon: Settings, label: "Settings" },
  ] as const;

  return (
    <div className="glass-panel h-full w-20 flex flex-col items-center py-6 gap-8 pointer-events-auto shrink-0 mr-4 md:mr-4">
      {/* Brand Logo */}
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[var(--accent)] to-blue-600 shadow-[0_0_20px_var(--accent-glow)] shrink-0">
        <span className="text-white font-bold text-xl tracking-tighter">NC</span>
      </div>

      {/* Navigation Icons */}
      <div className="flex flex-col gap-6 mt-4 flex-1">
        {menuItems.map((item) => {
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`relative p-3 rounded-xl transition-all duration-300 group`}
            >
              <item.icon
                size={24}
                className={`relative z-10 transition-colors duration-300 ${
                  isActive ? "text-[var(--accent)]" : "text-gray-500 group-hover:text-gray-400"
                }`}
              />
              
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl bg-[var(--accent-dim)] shadow-[0_0_15px_var(--accent-dim)]"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Profile & Theme Toggle */}
      <div className="mt-auto flex flex-col items-center gap-6 shrink-0">
        
        {/* 3D Theme Switch */}
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.1, rotateY: 15 }}
          whileTap={{ scale: 0.9, rotateX: 10 }}
          className="relative w-12 h-12 rounded-full flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-lg overflow-hidden group"
          style={{ perspective: 1000 }}
        >
          <motion.div
            animate={{ rotateY: theme === "dark" ? 0 : 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="absolute inset-0 flex items-center justify-center preserve-3d"
          >
            {theme === "dark" ? (
              <Moon size={20} className="text-gray-300 group-hover:text-white" />
            ) : (
              <Sun size={20} className="text-yellow-500 group-hover:text-yellow-600" style={{ transform: "rotateY(180deg)" }} />
            )}
          </motion.div>
        </motion.button>

        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-400 border-2 border-[var(--border-subtle)] overflow-hidden shadow-[0_0_10px_var(--accent-dim)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Soumoditya" alt="Avatar" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}

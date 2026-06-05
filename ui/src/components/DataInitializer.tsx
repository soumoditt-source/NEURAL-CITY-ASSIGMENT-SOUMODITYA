"use client";

/**
 * Neural City Dashboard — Data Initializer (Client Component)
 * ─────────────────────────────────────────────────────────────
 * Author : Soumoditya Das
 *
 * This invisible component mounts inside the page layout and:
 *  1. Fetches live AQI data for all cities from Open-Meteo on mount
 *  2. Loads the ONNX model and runs predictions for every city
 *  3. Sets up a 30-second polling interval when "Live Mode" is active
 *  4. Writes everything into Zustand so all UI components react automatically
 *
 * Why a separate component and not a Server Component?
 *   – useEffect, setInterval, and onnxruntime-web are all browser-only APIs.
 *   – Next.js App Router runs Server Components on the server (Node.js),
 *     so we must scope this logic to a Client Component.
 */

import { useEffect, useRef } from "react";
import { fetchAllCityAQI }   from "@/lib/aqiService";
import { initOnnxSession, predictAqi, estimateTrafficVolume } from "@/lib/onnxInference";
import { useDashboardStore } from "@/store/dashboardStore";

export default function DataInitializer() {
  const { setCities, updateCityAqi, setModelStatus, isLiveMode, setLastGlobalUpdate } =
    useDashboardStore();
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── One-shot data load + ONNX setup ──────────────────────────────────────
  useEffect(() => {
    async function bootstrap() {
      // 1. Load ONNX model in parallel while fetching AQI data
      setModelStatus("loading");
      const [cities] = await Promise.all([
        fetchAllCityAQI(),
        initOnnxSession(),
      ]);

      // 2. Populate the store with live readings
      setCities(cities);
      setLastGlobalUpdate(new Date());
      setModelStatus("ready");

      // 3. Run ONNX predictions for each city (async, non-blocking)
      for (const city of cities) {
        const traffic  = estimateTrafficVolume(city.id);
        const predicted = await predictAqi(
          city.temperature, city.humidity, city.windSpeed, traffic
        );
        if (predicted !== null) {
          updateCityAqi(city.id, { predictedAqi: predicted });
        }
      }
    }

    bootstrap().catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Live polling — refreshes data every 30 seconds ───────────────────────
  useEffect(() => {
    if (!isLiveMode) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(async () => {
      try {
        const cities = await fetchAllCityAQI();
        setCities(cities);
        setLastGlobalUpdate(new Date());

        // Re-run ONNX predictions on fresh data
        for (const city of cities) {
          const traffic   = estimateTrafficVolume(city.id);
          const predicted = await predictAqi(
            city.temperature, city.humidity, city.windSpeed, traffic
          );
          if (predicted !== null) {
            updateCityAqi(city.id, { predictedAqi: predicted });
          }
        }
      } catch (err) {
        console.error("[DataInitializer] Live update failed:", err);
      }
    }, 30_000); // 30-second cadence — same as CPCB publish rate

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLiveMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // This component renders nothing — it's purely a side-effect manager
  return null;
}

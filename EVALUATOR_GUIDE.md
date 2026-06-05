# 🧪 Evaluator & Testing Guide

Welcome to the **Neural City AQI Dashboard**. This guide is specifically designed for technical recruiters and engineering judges to help you quickly set up the application, verify its features, and understand the underlying architecture.

---

## ⚡ 1. One-Click Quick Start

I have configured the root repository so that you do **not** need to worry about manually changing directories to find the UI code. 

1. Ensure you have **Node.js** installed (v18 or higher recommended).
2. Open your terminal in the root directory of this repository.
3. Run the following command to automatically install all dependencies:
   ```bash
   npm install
   ```
4. Run the following command to start the local development server:
   ```bash
   npm start
   ```

The application will now be running at **[http://localhost:3000](http://localhost:3000)** (or whichever port Next.js assigns).

---

## 🎯 2. What to Look For (Testing Checklist)

When you open the application, please test and observe the following features which highlight the complexity of this submission:

### A. The Cinematic 3D Map Engine (Deck.gl + WebGL)
*   **Test:** Click on different cities in the left sidebar (e.g., switch from New Delhi to Mumbai).
*   **Observe:** The camera will smoothly pan and tilt across India in 3D space. You will see physical 3D "spikes" (pillars) representing the pollution levels across 40 different sub-locations per city. 
*   **Verification:** Hover over the pillars with your mouse to see the highly-specific tooltips (e.g., `Mumbai — Bandra`). Notice that the rendering remains locked at 60 FPS even with hundreds of complex geometries.

### B. Live Satellite Telemetry Sync
*   **Test:** Look at the Telemetry Grid on the right-hand panel (PM2.5, Temp, Humidity, Wind).
*   **Observe:** This is **not mocked data**. The application makes a live background fetch to the Open-Meteo API (Copernicus EU Satellite). 
*   **Verification:** The physical height and color of the 3D pillars on the map are mathematically bound to this live data. If Delhi is highly polluted right now, the pillars will automatically render as tall, dark purple/red spikes.

### C. Client-Side Machine Learning (ONNX)
*   **Test:** In the right-hand panel, look at the **"ONNX Predicted (Next Hour)"** box.
*   **Observe:** This prediction is generated locally on your machine.
*   **Verification:** You can inspect the Network tab in your browser's Developer Tools. You will see that the app downloads a `.onnx` file (`aqi_forecast_model.onnx`). The browser then executes a Random Forest Regression natively using WebAssembly/WebGL to predict the AQI based on the current weather without ever sending your data to an external AI server.

### D. The UI Menus
*   **Test:** On the left navigation bar, click on **Forecast**, **Trends**, and **Health Impact**.
*   **Observe:** The right-hand panel will dynamically swap out its UI components using Framer Motion animations to show specific 7-day weather grids, predictive trend charts, and tailored medical advisories based on that specific city's current pollution level.

---

## 📂 3. Codebase Walkthrough (Where is the magic?)

If you want to review the source code behind specific features, here is where you should look:

*   **`ui/src/lib/onnxInference.ts`**
    *   *What it does:* Loads the ONNX Runtime Web engine and executes the AI predictions directly in the browser.
*   **`ui/src/lib/aqiService.ts`**
    *   *What it does:* The service layer that handles parallel fetching of live telemetry data from Open-Meteo, with graceful fallbacks.
*   **`ui/src/components/Map.tsx`**
    *   *What it does:* The core WebGL engine. It binds the live state data to Deck.gl's `HexagonLayer` and `ColumnLayer` for the volumetric 3D mapping.
*   **`ui/src/store/dashboardStore.ts`**
    *   *What it does:* The ultra-lightweight Zustand state manager that keeps the UI components and the WebGL canvas perfectly synced without React rendering bottlenecks.

---

Thank you for your time reviewing this submission! 
— **Soumoditya Das**

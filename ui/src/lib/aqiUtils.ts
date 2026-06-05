/**
 * Neural City Dashboard — AQI Utility Helpers
 * ─────────────────────────────────────────────
 * Author : Soumoditya Das
 *
 * Pure utility functions shared across all components.
 * No side effects, no API calls — just data transformation.
 */

// ── AQI Level Descriptor ──────────────────────────────────────────────────
export interface AQILevel {
  label: string;
  color: string;       // Tailwind text colour class
  bgColor: string;     // Tailwind background colour class
  hex: string;         // Raw hex for canvas / WebGL use
  icon: string;        // Emoji shorthand
  advice: string;      // One-sentence health advisory
}

/**
 * Maps a numeric AQI to its standardised level descriptor.
 * Follows the US-EPA 2024 AQI breakpoints (matched to Indian CPCB scale).
 */
export function getAQILevel(aqi: number): AQILevel {
  if (aqi <= 50)  return {
    label: "Good",           color: "text-green-400",   bgColor: "bg-green-400/20",
    hex: "#4ade80",          icon: "✅",
    advice: "Air quality is satisfactory. Enjoy outdoor activities.",
  };
  if (aqi <= 100) return {
    label: "Moderate",       color: "text-yellow-300",  bgColor: "bg-yellow-300/20",
    hex: "#fde047",          icon: "⚠️",
    advice: "Unusually sensitive people should limit prolonged exertion.",
  };
  if (aqi <= 150) return {
    label: "Unhealthy (Sensitive)", color: "text-orange-400", bgColor: "bg-orange-400/20",
    hex: "#fb923c",          icon: "😷",
    advice: "Sensitive groups should reduce prolonged outdoor exertion.",
  };
  if (aqi <= 200) return {
    label: "Unhealthy",      color: "text-red-400",     bgColor: "bg-red-400/20",
    hex: "#f87171",          icon: "🚨",
    advice: "Everyone may begin to experience health effects.",
  };
  if (aqi <= 300) return {
    label: "Very Unhealthy", color: "text-purple-400",  bgColor: "bg-purple-400/20",
    hex: "#c084fc",          icon: "☣️",
    advice: "Health alert: everyone may experience serious effects.",
  };
  return {
    label: "Hazardous",      color: "text-rose-600",    bgColor: "bg-rose-600/20",
    hex: "#e11d48",          icon: "💀",
    advice: "Health warning of emergency conditions. Stay indoors.",
  };
}

/**
 * Formats a Date to a human-readable IST string for the telemetry panel.
 * Example: "06 Jun 2026, 11:45 IST"
 */
export function formatIST(date: Date): string {
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }) + " IST";
}

/**
 * Generates a short AI-style reasoning sentence for the telemetry panel.
 * In a production version this would be the ONNX model's attention weights
 * converted to text. Here we use a rule-based system as a smart fallback.
 */
export function generateReasoning(
  aqi: number,
  predictedAqi: number,
  windSpeed: number,
  temperature: number,
  cityName: string
): string {
  const trend    = predictedAqi > aqi + 20 ? "worsening" : predictedAqi < aqi - 20 ? "improving" : "stable";
  const wind     = windSpeed > 15 ? "strong winds are dispersing pollutants" : "low wind is trapping ground-level pollution";
  const heat     = temperature > 35 ? "high temperature is intensifying photochemical smog" : "";
  const heatPart = heat ? ` and ${heat}` : "";
  return `${cityName}'s AQI is currently ${getAQILevel(aqi).label.toLowerCase()} and trending ${trend}. ${wind.charAt(0).toUpperCase() + wind.slice(1)}${heatPart}.`;
}

/**
 * Returns a descriptive delta string for AQI change vs prediction.
 * Example: "+42 from now" or "-18 projected"
 */
export function aqiDelta(current: number, predicted: number): string {
  const diff = predicted - current;
  return diff >= 0 ? `+${diff} projected` : `${diff} projected`;
}

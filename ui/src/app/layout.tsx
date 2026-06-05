/**
 * Neural City Dashboard — Root Layout
 * Author: Soumoditya Das
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Neural City | Live AQI Intelligence Dashboard",
  description:
    "Real-time Air Quality Intelligence for Indian cities — built by Soumoditya Das. " +
    "Featuring GPU-trained ONNX AI predictions, 3D Deck.gl visualization, " +
    "live satellite telemetry from CAMS Open-Meteo, and zero API key cost.",
  keywords: ["AQI", "air quality", "India", "Neural City", "dashboard", "3D map", "Soumoditya Das"],
  authors: [{ name: "Soumoditya Das" }],
  openGraph: {
    title: "Neural City | AQI Intelligence Dashboard",
    description: "3D Air Quality Intelligence Dashboard for Indian Cities",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Load ONNX Runtime via CDN to bypass Turbopack WASM bundler errors */}
        <script src="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.26.0/dist/ort.min.js" async></script>
        {/* Preconnect to CDN origins for faster tile / data loads */}
        <link rel="preconnect" href="https://basemaps.cartocdn.com" />
        <link rel="preconnect" href="https://air-quality-api.open-meteo.com" />
        <link rel="preconnect" href="https://api.open-meteo.com" />
        <link rel="preconnect" href="https://api.dicebear.com" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0f] text-white`}>
        {children}
      </body>
    </html>
  );
}

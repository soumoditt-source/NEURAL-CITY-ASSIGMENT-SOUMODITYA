/**
 * Neural City Dashboard - Next.js Configuration
 * Author: Soumoditya Das
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "mapbox-gl",
    "react-map-gl",
    "deck.gl",
    "@deck.gl/core",
    "@deck.gl/layers",
    "@deck.gl/aggregation-layers",
    "@deck.gl/react",
  ],
  reactStrictMode: false,
};

export default nextConfig;

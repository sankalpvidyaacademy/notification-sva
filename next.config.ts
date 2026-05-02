import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: Remove "output: standalone" for Vercel deployments (it's for Docker)
  // For Vercel, the default build output works best
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;

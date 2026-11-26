import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: false,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;

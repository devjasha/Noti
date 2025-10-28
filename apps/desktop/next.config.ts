import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Disable features not compatible with static export
  trailingSlash: true,
};

export default nextConfig;

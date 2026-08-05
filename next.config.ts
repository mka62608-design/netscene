import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.GITHUB_ACTIONS ? { output: "export" as const } : {}),
  basePath: process.env.GITHUB_ACTIONS ? "/netscene" : "",
  assetPrefix: process.env.GITHUB_ACTIONS ? "/netscene/" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export", // ⭐ THIS IS THE IMPORTANT LINE
  basePath: isProd ? "/ice-breaker" : "",
  assetPrefix: isProd ? "/ice-breaker/" : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
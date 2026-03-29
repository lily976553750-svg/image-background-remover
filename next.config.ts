import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    "43.134.173.145",
    "localhost",
    ".trycloudflare.com",
  ],
};

export default nextConfig;

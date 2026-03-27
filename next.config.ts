import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", // 本地开发时注释掉，部署到 Cloudflare 时需要启用
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

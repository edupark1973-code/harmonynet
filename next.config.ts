import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "harmonynet.kr",
      },
      {
        protocol: "http",
        hostname: "harmonynet.kr",
      },
      {
        protocol: "https",
        hostname: "*.cafe24.com",
      },
    ],
  },
};

export default nextConfig;

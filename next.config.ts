import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "huss.harmonynet.kr",
      },
      {
        protocol: "http",
        hostname: "huss.harmonynet.kr",
      },
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

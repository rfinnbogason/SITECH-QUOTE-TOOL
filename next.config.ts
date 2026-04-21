import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer", "@neondatabase/serverless"],
};

export default nextConfig;

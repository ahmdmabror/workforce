import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: [
    "@workforce/convex",
  ],
};

export default nextConfig;


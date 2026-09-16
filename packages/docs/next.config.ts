import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@ez-gform/core",
    "@ez-gform/react",
    "@ez-gform/codegen",
    "@ez-gform/types",
  ],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['ai-public.mastergo.com'],
  },
};

export default nextConfig;

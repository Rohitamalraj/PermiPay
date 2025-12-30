import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['framer-motion'],
  turbopack: {},
  webpack: (config) => {
    config.externals.push('pino-pretty', 'encoding');
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      '@react-native-async-storage/async-storage': false,
    };
    return config;
  },
  reactStrictMode: true,
};

export default nextConfig;

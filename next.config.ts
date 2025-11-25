import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ingresso-a.akamaihd.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Aceita todos os domínios
      },
    ],
  },
}



export default nextConfig;

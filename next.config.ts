import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/auth/login', destination: '/login', permanent: false },
      { source: '/auth/select-role', destination: '/select-role', permanent: false },
    ]
  },
};

export default nextConfig;

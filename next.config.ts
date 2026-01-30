import type { NextConfig } from "next";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

// Here we use the @cloudflare/next-on-pages next-dev module to allow us to use bindings during local development
// (when running the application with `next dev`)
if (process.env.NODE_ENV === "development") {
  (async () => {
    try {
      await setupDevPlatform();
    } catch (e) {
      console.warn("Failed to setup Cloudflare Dev Platform:", e);
    }
  })();
}

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.bungie.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Rewrite to preserve existing Bungie redirect URL
  async rewrites() {
    return [
      {
        source: '/api/auth/callback',
        destination: '/return',
      },
    ];
  },
};

export default nextConfig;

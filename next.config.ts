import type { NextConfig } from "next";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

// Here we use the @cloudflare/next-on-pages next-dev module to allow us to use bindings during local development
// (when running the application with `next dev`)
if (process.env.NODE_ENV === "development") {
  (async () => {
    await setupDevPlatform();
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
};

export default nextConfig;

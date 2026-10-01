import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async rewrites() {
    return [
      // Universal links: iOS fetches this file to open /i/CODE links in the app.
      { source: "/.well-known/apple-app-site-association", destination: "/api/aasa" },
    ];
  },
};

export default nextConfig;

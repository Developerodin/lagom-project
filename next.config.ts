import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin Turbopack root so HMR doesn't lose `next` during resolve
  // (avoids "Next.js package not found" panics).
  turbopack: {
    root: path.join(__dirname),
  },
  // Uploads live outside the traced bundle; keep the build from scanning them.
  outputFileTracingExcludes: {
    "*": ["./uploads/**/*"],
  },
  reactCompiler: true,
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Serve AVIF/WebP to browsers that support them, with automatic
    // fallback to the original JPEG/PNG for older browsers.
    formats: ["image/avif", "image/webp"],
    qualities: [75, 100],
    // Cache optimized images at the CDN edge for a year so repeat visits
    // in any region are served without re-optimization.
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
      },
    ],
  },
  async headers() {
    return [
      {
        // Static design assets never change at the same URL — cache them
        // immutably in browsers and CDN edges worldwide.
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Crawlers and chat apps still request /favicon.ico by convention.
      {
        source: "/favicon.ico",
        destination: "/icon.png",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
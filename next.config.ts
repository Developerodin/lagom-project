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
  experimental: {
    // Let the proxy pass full upload bodies (up to 55MB) so the route handler
    // can validate and return a clean 400 instead of a mangled 500.
    proxyClientMaxBodySize: "55mb",
    // Turbopack 16.2 can leak multi-GB in long `next dev` sessions; keep these
    // off so accidental `--turbo` runs do not grow an unbounded FS cache / HMR loop.
    turbopackFileSystemCacheForDev: false,
    turbopackServerFastRefresh: false,
    // In development, disable disk persistence for the image LRU cache to
    // prevent 0-byte files from poisoning the singleton after Ctrl+C.
    ...(process.env.NODE_ENV === "development"
      ? { isrFlushToDisk: false }
      : {}),
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
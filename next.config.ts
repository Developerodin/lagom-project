import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Serve AVIF/WebP to browsers that support them, with automatic
    // fallback to the original JPEG/PNG for older browsers.
    formats: ["image/avif", "image/webp"],
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
};

export default nextConfig;
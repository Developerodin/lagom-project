/**
 * Decide when CmsImage should skip `/_next/image`.
 *
 * Raster disk uploads (`/api/uploads/*.webp|jpg|png`) go through the optimizer.
 * SVGs and leftover Vercel Blob URLs stay unoptimized so they still render
 * without hostname config or SVG optimizer footguns.
 */
export function shouldSkipImageOptimizer(src: string): boolean {
  if (isLegacyVercelBlobSrc(src)) {
    return true;
  }

  if (isUserUploadedSrc(src) && isSvgSrc(src)) {
    return true;
  }

  return false;
}

/** Same-origin disk uploads under `/api/uploads/...`. */
export function isUserUploadedSrc(src: string): boolean {
  if (src.startsWith("/api/uploads/")) {
    return true;
  }

  try {
    const url = new URL(src);
    return url.pathname.startsWith("/api/uploads/");
  } catch {
    return false;
  }
}

function isSvgSrc(src: string): boolean {
  try {
    const path = src.startsWith("http")
      ? new URL(src).pathname
      : src.split("?")[0];
    return path.toLowerCase().endsWith(".svg");
  } catch {
    return src.toLowerCase().includes(".svg");
  }
}

function isLegacyVercelBlobSrc(src: string): boolean {
  try {
    const host = src.startsWith("http")
      ? new URL(src).hostname
      : "";
    return host.endsWith(".blob.vercel-storage.com");
  } catch {
    return src.includes(".blob.vercel-storage.com");
  }
}

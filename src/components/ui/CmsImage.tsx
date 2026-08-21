import Image, { type ImageProps } from "next/image";
import { shouldSkipImageOptimizer } from "@/lib/uploaded-src";

/**
 * next/image for CMS/user uploads. Raster `/api/uploads` go through the
 * optimizer; SVGs and leftover Vercel Blob URLs stay unoptimized.
 */
export function CmsImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : null;
  const skipOptimizer = src ? shouldSkipImageOptimizer(src) : false;

  return (
    <Image {...props} unoptimized={props.unoptimized ?? skipOptimizer} />
  );
}

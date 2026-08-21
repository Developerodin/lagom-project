import { mkdir, rm, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import sharp from "sharp";
import { env } from "@/lib/env";

export const ALLOWED_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/svg+xml", "svg"],
]);

export const ALLOWED_CONTENT_TYPES = [...ALLOWED_TYPES.keys()];

export const MAX_BYTES = 50 * 1024 * 1024;
const LOCAL_URL_PREFIX = "/api/uploads/";
const MAX_LONG_EDGE = 1920;
const WEBP_QUALITY = 82;
/** Cap decode size so a pathological file cannot OOM the task. */
const LIMIT_INPUT_PIXELS = 40_000_000;

export class UploadError extends Error {}

export type SaveUploadResult = {
  url: string;
  width: number | null;
  height: number | null;
};

export function getUploadDir() {
  return path.resolve(env.uploadDir);
}

/**
 * Build an absolute upload path without `path.join(dynamic, dynamic)`,
 * which makes Turbopack treat it as a project-wide file glob and bloat the build.
 */
export function getUploadFilePath(filename: string) {
  const safeName = path.basename(filename);
  return `${getUploadDir()}${path.sep}${safeName}`;
}

function makeFilename(extension: string) {
  return `${Date.now()}-${randomBytes(8).toString("hex")}.${extension}`;
}

/**
 * Persist an admin upload. Raster images are resized to max 1920px and
 * written as WebP; SVGs are stored as-is. Fail closed: never write the
 * original if Sharp cannot process the raster.
 */
export async function saveUpload(file: File): Promise<SaveUploadResult> {
  const extension = ALLOWED_TYPES.get(file.type);

  if (!extension) {
    throw new UploadError("Unsupported file type. Use JPEG, PNG, WebP, or SVG.");
  }

  if (file.size > MAX_BYTES) {
    throw new UploadError("File is too large. Maximum size is 50MB.");
  }

  const dir = getUploadDir();
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());

  if (extension === "svg") {
    const filename = makeFilename("svg");
    await writeFile(getUploadFilePath(filename), buffer);
    return {
      url: `${LOCAL_URL_PREFIX}${filename}`,
      width: null,
      height: null,
    };
  }

  let processed: Buffer;
  let width: number | null = null;
  let height: number | null = null;

  try {
    const pipeline = sharp(buffer, {
      failOn: "error",
      limitInputPixels: LIMIT_INPUT_PIXELS,
    })
      .rotate()
      .resize({
        width: MAX_LONG_EDGE,
        height: MAX_LONG_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY });

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
    processed = data;
    width = info.width ?? null;
    height = info.height ?? null;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not process image.";
    throw new UploadError(
      `Image could not be processed. Use a valid JPEG, PNG, or WebP under 50MB. (${message})`,
    );
  }

  const filename = makeFilename("webp");
  await writeFile(getUploadFilePath(filename), processed);

  return {
    url: `${LOCAL_URL_PREFIX}${filename}`,
    width,
    height,
  };
}

export async function deleteUpload(url: string | null | undefined) {
  if (!url) {
    return;
  }

  if (!url.startsWith(LOCAL_URL_PREFIX)) {
    return;
  }

  const filename = path.basename(url.slice(LOCAL_URL_PREFIX.length));

  if (!filename) {
    return;
  }

  await rm(getUploadFilePath(filename), { force: true });
}

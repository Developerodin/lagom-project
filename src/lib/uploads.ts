import { mkdir, rm, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { del, put } from "@vercel/blob";
import { env } from "@/lib/env";

const ALLOWED_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/svg+xml", "svg"],
]);

const MAX_BYTES = 10 * 1024 * 1024;
const LOCAL_URL_PREFIX = "/api/uploads/";
const BLOB_HOST_MARKER = ".blob.vercel-storage.com";

export class UploadError extends Error {}

function useBlobStorage() {
  return Boolean(env.blobReadWriteToken);
}

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

export async function saveUpload(file: File): Promise<{ url: string }> {
  const extension = ALLOWED_TYPES.get(file.type);

  if (!extension) {
    throw new UploadError("Unsupported file type. Use JPEG, PNG, WebP, or SVG.");
  }

  if (file.size > MAX_BYTES) {
    throw new UploadError("File is too large. Maximum size is 10MB.");
  }

  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${extension}`;

  if (useBlobStorage()) {
    const blob = await put(`uploads/${filename}`, file, {
      access: "public",
      contentType: file.type,
      token: env.blobReadWriteToken,
    });
    return { url: blob.url };
  }

  const dir = getUploadDir();
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(getUploadFilePath(filename), buffer);

  return { url: `${LOCAL_URL_PREFIX}${filename}` };
}

function isBlobUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith(BLOB_HOST_MARKER);
  } catch {
    return false;
  }
}

export async function deleteUpload(url: string | null | undefined) {
  if (!url) {
    return;
  }

  if (isBlobUrl(url)) {
    if (!env.blobReadWriteToken) {
      return;
    }
    try {
      await del(url, { token: env.blobReadWriteToken });
    } catch {
      // Blob may already be gone; ignore.
    }
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

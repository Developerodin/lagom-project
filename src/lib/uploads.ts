import { mkdir, rm, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { env } from "@/lib/env";

const ALLOWED_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const MAX_BYTES = 10 * 1024 * 1024;
const URL_PREFIX = "/api/uploads/";

export class UploadError extends Error {}

export function getUploadDir() {
  return path.resolve(env.uploadDir);
}

export async function saveUpload(file: File): Promise<{ url: string }> {
  const extension = ALLOWED_TYPES.get(file.type);

  if (!extension) {
    throw new UploadError("Unsupported file type. Use JPEG, PNG or WebP.");
  }

  if (file.size > MAX_BYTES) {
    throw new UploadError("File is too large. Maximum size is 10MB.");
  }

  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${extension}`;
  const dir = getUploadDir();
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return { url: `${URL_PREFIX}${filename}` };
}

export async function deleteUpload(url: string | null | undefined) {
  if (!url || !url.startsWith(URL_PREFIX)) {
    return;
  }

  const filename = path.basename(url.slice(URL_PREFIX.length));

  if (!filename) {
    return;
  }

  await rm(path.join(getUploadDir(), filename), { force: true });
}

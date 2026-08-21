"use client";

const MAX_BYTES = 50 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]);

export type AdminUploadResult = {
  url: string;
  width: number | null;
  height: number | null;
};

function validateFile(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Unsupported file type. Use JPEG, PNG, WebP, or SVG.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("File is too large. Maximum size is 50MB.");
  }
}

/**
 * Upload a file to disk via FormData (local + AWS UPLOAD_DIR).
 * Raster files are transcoded server-side; response includes processed dims.
 */
export async function adminUploadFile(file: File): Promise<AdminUploadResult> {
  validateFile(file);

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Upload failed.");
  }

  const data = await response.json();
  return {
    url: data.url as string,
    width: typeof data.width === "number" ? data.width : null,
    height: typeof data.height === "number" ? data.height : null,
  };
}

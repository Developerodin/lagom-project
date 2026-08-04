import { readFile } from "node:fs/promises";
import path from "node:path";
import { getUploadFilePath } from "@/lib/uploads";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const filename = path.basename(segments.join("/"));
  const extension = path.extname(filename).toLowerCase();
  const contentType = CONTENT_TYPES[extension];

  if (!contentType) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const data = await readFile(getUploadFilePath(filename));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

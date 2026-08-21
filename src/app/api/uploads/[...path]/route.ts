/**
 * Disk upload reader for local and AWS (UPLOAD_DIR).
 * Streams the file instead of buffering the whole object in memory.
 */
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
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

  const filePath = getUploadFilePath(filename);

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return new Response("Not found", { status: 404 });
    }

    const stream = createReadStream(filePath);
    const body = Readable.toWeb(stream) as ReadableStream;

    return new Response(body, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileStat.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  saveUpload,
  UploadError,
  MAX_BYTES,
  ALLOWED_CONTENT_TYPES,
} from "@/lib/uploads";

/**
 * GET — upload limits and allowed types for the admin client.
 */
export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  return NextResponse.json({
    storage: "disk",
    maxBytes: MAX_BYTES,
    allowedTypes: ALLOWED_CONTENT_TYPES,
  });
}

/**
 * POST — multipart FormData → writeFile under UPLOAD_DIR (local + AWS).
 */
export async function POST(request: Request) {
  const authError = await requireAuth();
  if (authError) return authError;

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Expected multipart/form-data." },
      { status: 400 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not parse the upload. The file may exceed the 50MB limit or the request was truncated.",
      },
      { status: 400 },
    );
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  try {
    const result = await saveUpload(file);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}

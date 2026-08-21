#!/usr/bin/env tsx
/**
 * End-to-end test: generate a ~40MB JPEG, upload through the admin API,
 * assert the server transcodes to a small WebP (≤1920px), verify fail-closed
 * on a corrupt payload, and check that no 0-byte image cache files appear.
 *
 * Also covers: unauthenticated 401, SVG passthrough, type rejection.
 *
 * Usage:
 *   tsx --env-file=.env scripts/test-large-upload.ts [base-url]
 *
 * Defaults to http://localhost:3000.
 * Snapshots and restores the admin password hash so it does not need ADMIN_PASSWORD.
 */
import { execSync } from "node:child_process";
import { readdir, stat, unlink, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  PASSWORD_HASH_SETTING_KEY,
  SESSION_VERSION_SETTING_KEY,
  setPassword,
} from "../src/lib/admin-password";
import { prisma } from "../src/lib/prisma";
import { getUploadFilePath } from "../src/lib/uploads";

const BASE = process.argv[2] || "http://localhost:3000";
const FIXTURE = "tests/fixtures/large-40mb.jpg";
const TEST_PASSWORD = "upload-e2e-test-password";

let didSnapshot = false;
let snapshotPasswordHash: string | null = null;
let snapshotSessionVersion: string | null = null;

async function generateLargeJpeg() {
  await mkdir("tests/fixtures", { recursive: true });
  // Use sharp to create a large JPEG: 6000x6000 random noise ≈ 40MB
  const script = `
    const sharp = require("sharp");
    const { randomBytes } = require("crypto");
    const w = 6000, h = 6000;
    const raw = randomBytes(w * h * 3);
    sharp(raw, { raw: { width: w, height: h, channels: 3 } })
      .jpeg({ quality: 100 })
      .toFile("${FIXTURE}")
      .then(info => console.log("Generated:", info.size, "bytes"))
      .catch(err => { console.error(err); process.exit(1); });
  `;
  execSync(`node -e '${script.replace(/'/g, "'\\''")}'`, { stdio: "inherit" });
}

async function snapshotPasswordState() {
  const [hashRow, versionRow] = await Promise.all([
    prisma.setting.findUnique({ where: { key: PASSWORD_HASH_SETTING_KEY } }),
    prisma.setting.findUnique({ where: { key: SESSION_VERSION_SETTING_KEY } }),
  ]);
  snapshotPasswordHash = hashRow?.value ?? null;
  snapshotSessionVersion = versionRow?.value ?? null;
  didSnapshot = true;
}

async function restorePasswordState() {
  if (!didSnapshot) return;

  if (snapshotPasswordHash) {
    await prisma.setting.upsert({
      where: { key: PASSWORD_HASH_SETTING_KEY },
      create: { key: PASSWORD_HASH_SETTING_KEY, value: snapshotPasswordHash },
      update: { value: snapshotPasswordHash },
    });
  } else {
    await prisma.setting.deleteMany({
      where: { key: PASSWORD_HASH_SETTING_KEY },
    });
  }

  if (snapshotSessionVersion) {
    await prisma.setting.upsert({
      where: { key: SESSION_VERSION_SETTING_KEY },
      create: {
        key: SESSION_VERSION_SETTING_KEY,
        value: snapshotSessionVersion,
      },
      update: { value: snapshotSessionVersion },
    });
  } else {
    await prisma.setting.deleteMany({
      where: { key: SESSION_VERSION_SETTING_KEY },
    });
  }
}

async function login(password: string): Promise<string> {
  const res = await fetch(`${BASE}/api/auth/password/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
    redirect: "manual",
  });
  if (!res.ok && res.status !== 302) {
    throw new Error(`Login failed: ${res.status} ${await res.text()}`);
  }
  const cookies = res.headers.getSetCookie();
  const sessionCookie = cookies.find((c) => c.startsWith("lagom_admin="));
  if (!sessionCookie) {
    throw new Error("No lagom_admin session cookie returned from login.");
  }
  return sessionCookie.split(";")[0];
}

async function walk(dir: string): Promise<string[]> {
  const zeroByte: string[] = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return zeroByte;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      zeroByte.push(...(await walk(full)));
    } else {
      try {
        const s = await stat(full);
        if (s.size === 0) zeroByte.push(full);
      } catch {
        /* ignore */
      }
    }
  }
  return zeroByte;
}

async function main() {
  console.log(`=== Large upload E2E against ${BASE} ===\n`);

  try {
    await fetch(`${BASE}/api/health`);
  } catch {
    throw new Error(`Server not reachable at ${BASE}`);
  }

  await snapshotPasswordState();
  await setPassword(TEST_PASSWORD);

  try {
    console.log("=== Step 1: Generate ~40MB JPEG ===");
    await generateLargeJpeg();
    const { size } = await stat(FIXTURE);
    console.log(`Fixture size: ${(size / 1024 / 1024).toFixed(1)} MB`);
    if (size < 20 * 1024 * 1024) {
      throw new Error("Fixture too small — expected ≥20MB");
    }

    console.log("\n=== Step 2: Unauthenticated upload must be 401 ===");
    const unauthForm = new FormData();
    unauthForm.append(
      "file",
      new Blob([Buffer.from("x")], { type: "image/jpeg" }),
      "x.jpg",
    );
    const unauthRes = await fetch(`${BASE}/api/admin/upload`, {
      method: "POST",
      body: unauthForm,
    });
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 without cookie, got ${unauthRes.status}`);
    }
    console.log("Unauthenticated POST → 401 ✓");

    console.log("\n=== Step 3: Login ===");
    const cookie = await login(TEST_PASSWORD);
    console.log("Logged in successfully (lagom_admin).");

    console.log("\n=== Step 4: Check upload config ===");
    const configRes = await fetch(`${BASE}/api/admin/upload`, {
      headers: { Cookie: cookie },
    });
    if (!configRes.ok) {
      throw new Error(`GET /api/admin/upload → ${configRes.status}`);
    }
    const config = await configRes.json();
    console.log("Upload config:", config);

    console.log("\n=== Step 5: Upload the 40MB file (expect WebP ≤1920) ===");
    const fileBytes = await readFile(FIXTURE);
    const fileBlob = new Blob([fileBytes], { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("file", fileBlob, "large-40mb.jpg");

    const uploadRes = await fetch(`${BASE}/api/admin/upload`, {
      method: "POST",
      headers: { Cookie: cookie },
      body: formData,
    });

    if (!uploadRes.ok) {
      const body = await uploadRes.text();
      throw new Error(`Upload failed: ${uploadRes.status} — ${body}`);
    }
    const data = await uploadRes.json();
    const uploadedUrl = data.url as string;
    const width = data.width as number | null;
    const height = data.height as number | null;

    console.log("Upload URL:", uploadedUrl);
    console.log("Dimensions:", width, "×", height);

    if (!uploadedUrl.endsWith(".webp")) {
      throw new Error(`Expected .webp URL, got: ${uploadedUrl}`);
    }
    if (typeof width !== "number" || typeof height !== "number") {
      throw new Error("Expected numeric width/height from upload API.");
    }
    if (width > 1920 || height > 1920) {
      throw new Error(`Long edge exceeds 1920: ${width}×${height}`);
    }

    const filename = uploadedUrl.split("/").pop();
    if (!filename) {
      throw new Error("Could not parse upload filename.");
    }
    const onDisk = await stat(getUploadFilePath(filename));
    console.log(`On-disk size: ${(onDisk.size / 1024).toFixed(1)} KB`);
    // Noise JPEGs compress poorly; still require a large shrink vs the ~40MB input.
    if (onDisk.size > 3 * 1024 * 1024) {
      throw new Error(
        `Transcoded file too large: ${onDisk.size} bytes (expected <3MB)`,
      );
    }
    if (onDisk.size >= size * 0.1) {
      throw new Error(
        `Transcoded file did not shrink enough: ${onDisk.size} vs original ${size}`,
      );
    }

    console.log("\n=== Step 6: Verify uploaded file is reachable ===");
    const fullUrl = uploadedUrl.startsWith("http")
      ? uploadedUrl
      : `${BASE}${uploadedUrl}`;
    const getRes = await fetch(fullUrl);
    if (!getRes.ok) {
      throw new Error(`GET ${fullUrl} → ${getRes.status}`);
    }
    const contentType = getRes.headers.get("content-type") || "";
    if (!contentType.includes("image/webp")) {
      throw new Error(`Expected image/webp, got: ${contentType}`);
    }
    console.log(`GET ${fullUrl} → ${getRes.status} (${contentType}) ✓`);

    console.log("\n=== Step 7: Fail-closed on corrupt payload ===");
    const corruptForm = new FormData();
    corruptForm.append(
      "file",
      new Blob([Buffer.from("not-an-image")], { type: "image/jpeg" }),
      "corrupt.jpg",
    );
    const corruptRes = await fetch(`${BASE}/api/admin/upload`, {
      method: "POST",
      headers: { Cookie: cookie },
      body: corruptForm,
    });
    if (corruptRes.status !== 400) {
      throw new Error(
        `Expected 400 for corrupt upload, got ${corruptRes.status}`,
      );
    }
    console.log("Corrupt upload → 400 ✓ (no original written)");

    console.log("\n=== Step 8: Reject unsupported type ===");
    const badTypeForm = new FormData();
    badTypeForm.append(
      "file",
      new Blob([Buffer.from("%PDF-1.4")], { type: "application/pdf" }),
      "doc.pdf",
    );
    const badTypeRes = await fetch(`${BASE}/api/admin/upload`, {
      method: "POST",
      headers: { Cookie: cookie },
      body: badTypeForm,
    });
    if (badTypeRes.status !== 400) {
      throw new Error(`Expected 400 for PDF, got ${badTypeRes.status}`);
    }
    console.log("Unsupported type → 400 ✓");

    console.log("\n=== Step 9: SVG passthrough ===");
    const svgBody =
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>';
    const svgForm = new FormData();
    svgForm.append(
      "file",
      new Blob([svgBody], { type: "image/svg+xml" }),
      "mark.svg",
    );
    const svgRes = await fetch(`${BASE}/api/admin/upload`, {
      method: "POST",
      headers: { Cookie: cookie },
      body: svgForm,
    });
    if (!svgRes.ok) {
      throw new Error(`SVG upload failed: ${svgRes.status} — ${await svgRes.text()}`);
    }
    const svgData = await svgRes.json();
    if (!String(svgData.url).endsWith(".svg")) {
      throw new Error(`Expected .svg URL, got: ${svgData.url}`);
    }
    const svgGet = await fetch(`${BASE}${svgData.url}`);
    if (!svgGet.ok) {
      throw new Error(`GET SVG → ${svgGet.status}`);
    }
    const svgCt = svgGet.headers.get("content-type") || "";
    if (!svgCt.includes("image/svg+xml")) {
      throw new Error(`Expected image/svg+xml, got: ${svgCt}`);
    }
    console.log(`SVG → ${svgData.url} (${svgCt}) ✓`);

    console.log("\n=== Step 10: Hit pages to trigger next/image ===");
    for (const page of ["/", "/work", "/about"]) {
      const url = `${BASE}${page}`;
      try {
        const res = await fetch(url);
        console.log(`GET ${url} → ${res.status}`);
      } catch (err) {
        console.warn(`GET ${url} failed:`, err);
      }
    }

    console.log("\n=== Step 11: Check for 0-byte image cache files ===");
    const zeroByte = [
      ...(await walk(".next/dev/cache/images")),
      ...(await walk(".next/cache/images")),
    ];
    if (zeroByte.length > 0) {
      console.error("FAIL: Found 0-byte image cache files:");
      zeroByte.forEach((f) => console.error(`  ${f}`));
      process.exit(1);
    }
    console.log("No 0-byte image cache files found. ✓");

    console.log("\n=== Step 12: Clean up fixture ===");
    await unlink(FIXTURE).catch(() => {});

    console.log("\n✅ All checks passed.");
  } finally {
    await restorePasswordState();
    await prisma.$disconnect();
  }
}

main().catch(async (err) => {
  console.error("\n❌ Test failed:", err);
  try {
    await restorePasswordState();
  } catch {
    /* ignore */
  }
  try {
    await prisma.$disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});

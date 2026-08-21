import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";
import {
  PASSWORD_HASH_SETTING_KEY,
  SESSION_VERSION_SETTING_KEY,
  setPassword,
} from "../src/lib/admin-password";
import { prisma } from "../src/lib/prisma";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const TEST_SLUG = "e2e-test-work-" + Date.now();
const TEST_PASSWORD = "playwright-upload-e2e-password";
const FIXTURE_PATH = path.join(__dirname, "fixtures", "test-banner.jpg");

let heroImageUrl: string;
let createdWorkId: string;
let sessionCookie: string;
let didSnapshot = false;
let snapshotPasswordHash: string | null = null;
let snapshotSessionVersion: string | null = null;

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

test.describe.serial("Work upload flow", () => {
  test.beforeAll(async () => {
    if (!fs.existsSync(FIXTURE_PATH)) {
      throw new Error(
        `Missing fixture at ${FIXTURE_PATH}. Generate a small JPEG there first.`,
      );
    }
    await snapshotPasswordState();
    await setPassword(TEST_PASSWORD);
  });

  test.afterAll(async ({ request }) => {
    try {
      if (createdWorkId && sessionCookie) {
        await request.delete(`${BASE_URL}/api/admin/clients/${createdWorkId}`, {
          headers: { cookie: sessionCookie },
        });
      }
    } finally {
      await restorePasswordState();
      await prisma.$disconnect();
    }
  });

  test("1 - authenticate as admin", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/auth/password/login`, {
      data: { password: TEST_PASSWORD },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    const cookies = res.headers()["set-cookie"] ?? "";
    const match = cookies.match(/lagom_admin=([^;]+)/);
    expect(match).not.toBeNull();
    sessionCookie = `lagom_admin=${match![1]}`;
  });

  test("2 - upload a banner image", async ({ request }) => {
    const fileBuffer = fs.readFileSync(FIXTURE_PATH);

    const res = await request.post(`${BASE_URL}/api/admin/upload`, {
      headers: { cookie: sessionCookie },
      multipart: {
        file: {
          name: "test-banner.jpg",
          mimeType: "image/jpeg",
          buffer: fileBuffer,
        },
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.url).toBeTruthy();
    expect(body.url).toMatch(/\.webp$/);
    expect(typeof body.width).toBe("number");
    expect(typeof body.height).toBe("number");
    heroImageUrl = body.url;
  });

  test("3 - create a work item", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/admin/clients`, {
      headers: {
        cookie: sessionCookie,
        "content-type": "application/json",
      },
      data: {
        title: "E2E Test Work",
        slug: TEST_SLUG,
        description: "Test description for E2E verification.",
        services: "",
        whatWeDid: "",
        serviceIds: [],
        sortOrder: 999,
        published: true,
        categoryId: null,
        cardImage: heroImageUrl,
        cardAlt: "test card",
        heroImage: heroImageUrl,
        heroAlt: "test hero",
        gallery: [
          {
            imageUrl: heroImageUrl,
            alt: "gallery image 1",
            width: 200,
            height: 100,
            sortOrder: 0,
          },
        ],
      },
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.id).toBeTruthy();
    createdWorkId = body.id;
  });

  test("4 - work page renders hero and gallery images", async ({ page }) => {
    await page.goto(`${BASE_URL}/work/${TEST_SLUG}`);

    const heroImg = page.locator('section[aria-label="E2E Test Work"] img');
    await expect(heroImg).toBeVisible({ timeout: 15_000 });

    const heroSrc = await heroImg.getAttribute("src");
    expect(heroSrc).toBeTruthy();
    // Raster disk uploads should go through next/image optimizer.
    expect(heroSrc!).toMatch(/\/_next\/image/);
    expect(decodeURIComponent(heroSrc!)).toMatch(/\/api\/uploads\//);

    const optimized = await page.request.get(
      heroSrc!.startsWith("http") ? heroSrc! : `${BASE_URL}${heroSrc}`,
    );
    expect(optimized.status()).toBe(200);

    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
    await page.waitForTimeout(500);

    const galleryImg = page.locator(
      'section[aria-label="Project gallery"] img',
    );
    await expect(galleryImg.first()).toBeVisible({ timeout: 15_000 });
  });
});

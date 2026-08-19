import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const BASE_URL = "http://localhost:3000";
const TEST_SLUG = "e2e-test-work-" + Date.now();
const TEST_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? "test-password";
const FIXTURE_PATH = path.join(__dirname, "fixtures", "test-banner.jpg");

let heroImageUrl: string;
let createdWorkId: string;
let sessionCookie: string;

test.describe.serial("Work upload flow", () => {
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

    const form = request.createFormData
      ? undefined
      : undefined;

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

    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
    await page.waitForTimeout(500);

    const galleryImg = page.locator(
      'section[aria-label="Project gallery"] img',
    );
    await expect(galleryImg.first()).toBeVisible({ timeout: 15_000 });
  });

  test.afterAll(async ({ request }) => {
    if (!createdWorkId) return;

    await request.delete(`${BASE_URL}/api/admin/clients/${createdWorkId}`, {
      headers: { cookie: sessionCookie },
    });
  });
});

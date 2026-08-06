/**
 * Canonical end-to-end auth tests for OTP-only admin login.
 *
 * Requires: running Next.js server (dev or production)
 * Run: npm run test:auth-e2e
 *
 * Environment:
 * - TEST_BASE_URL (default http://localhost:3000)
 * - TEST_SECOND_BASE_URL (optional second instance for multi-instance cookie test)
 */
import { createHash } from "crypto";
import {
  clearOtp,
  generateOtp,
  OTP_EXPIRES_SETTING_KEY,
  OTP_HASH_SETTING_KEY,
  storeOtp,
} from "../src/lib/admin-otp";
import { prisma } from "../src/lib/prisma";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
const SECOND_BASE = process.env.TEST_SECOND_BASE_URL;
const IS_PRODUCTION_TARGET =
  process.env.TEST_EXPECT_PRODUCTION === "1" ||
  BASE.startsWith("https://");

let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  ✓ ${label}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${label}`);
  }
}

async function fetchStatus(
  path: string,
  init?: RequestInit,
): Promise<{ status: number; body: string; headers: Headers }> {
  const response = await fetch(`${BASE}${path}`, init);
  const body = await response.text();
  return { status: response.status, body, headers: response.headers };
}

function extractCookie(setCookie: string | null): string {
  if (!setCookie) return "";
  const match = setCookie.match(/lagom_admin=[^;]+/);
  return match?.[0] ?? "";
}

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

async function verifyOtpViaApi(otp: string): Promise<{
  status: number;
  data: Record<string, unknown>;
  headers: Headers;
}> {
  const response = await fetch(`${BASE}/api/auth/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otp }),
  });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: response.status, data, headers: response.headers };
}

async function ensureServerReachable() {
  try {
    await fetch(`${BASE}/admin`);
  } catch {
    console.error(`  ✗ server not reachable at ${BASE}`);
    process.exit(1);
  }
}

async function resetAuthTestState() {
  await clearOtp();
  await prisma.setting.deleteMany({
    where: {
      OR: [
        { key: { startsWith: "rate_limit:" } },
        { key: "admin_otp_verify_attempts" },
      ],
    },
  });
}

async function main() {
  console.log(`\nCanonical auth E2E tests against ${BASE}\n`);
  await ensureServerReachable();
  await resetAuthTestState();

  console.log("1) Unauthenticated admin API access (must be 401)");
  const protectedApiRoutes: Array<{ path: string; method: string; body?: string }> = [
    { path: "/api/admin/clients", method: "GET" },
    { path: "/api/admin/clients", method: "POST", body: "{}" },
    { path: "/api/admin/categories", method: "GET" },
    { path: "/api/admin/testimonials", method: "GET" },
    { path: "/api/admin/work-services", method: "GET" },
    { path: "/api/admin/upload", method: "POST" },
  ];

  for (const route of protectedApiRoutes) {
    const { status } = await fetchStatus(route.path, {
      method: route.method,
      headers: route.body ? { "Content-Type": "application/json" } : undefined,
      body: route.body,
    });
    assert(status === 401, `${route.method} ${route.path} → 401 (got ${status})`);
  }

  console.log("\n2) Fake/tampered session cookie rejected");
  const fakeCookie = await fetchStatus("/api/admin/clients", {
    headers: { Cookie: "lagom_admin=not-a-valid-iron-session" },
  });
  assert(fakeCookie.status === 401, `fake cookie → 401 (got ${fakeCookie.status})`);

  console.log("\n3) Protected admin pages redirect to login");
  const protectedPages = [
    "/admin/clients",
    "/admin/settings",
    "/admin/categories",
    "/admin/testimonials",
    "/admin/submissions",
    "/admin/stationary-signups",
  ];

  for (const path of protectedPages) {
    const response = await fetch(`${BASE}${path}`, { redirect: "manual" });
    const location = response.headers.get("location") || "";
    const redirectedToLogin =
      (response.status === 307 || response.status === 308) &&
      location.endsWith("/admin");
    assert(
      redirectedToLogin,
      `${path} redirects unauthenticated user (status=${response.status}, location=${location})`,
    );
  }

  console.log("\n4) Public admin login page accessible without auth");
  const { status: adminStatus } = await fetchStatus("/admin");
  assert(adminStatus === 200, `/admin → 200 (got ${adminStatus})`);

  console.log("\n5) OTP request stores hash only (never plaintext)");
  const knownOtp = generateOtp();
  await storeOtp(knownOtp);
  const [hashRow, expiresRow] = await Promise.all([
    prisma.setting.findUnique({ where: { key: OTP_HASH_SETTING_KEY } }),
    prisma.setting.findUnique({ where: { key: OTP_EXPIRES_SETTING_KEY } }),
  ]);
  assert(Boolean(hashRow?.value), "OTP hash stored in database");
  assert(Boolean(expiresRow?.value), "OTP expiry stored in database");
  assert(hashRow?.value === hashOtp(knownOtp), "stored value is SHA-256 hash");
  assert(hashRow?.value !== knownOtp, "plaintext OTP is not stored");

  console.log("\n6) Wrong OTP rejected");
  const wrongOtp = await verifyOtpViaApi("000000");
  assert(wrongOtp.status === 401, `wrong OTP → 401 (got ${wrongOtp.status})`);
  assert(
    typeof wrongOtp.data.error === "string" &&
      !String(wrongOtp.data.error).toLowerCase().includes("incorrect password"),
    "wrong OTP error is not misleading password text",
  );

  console.log("\n7) Expired OTP rejected");
  const expiredOtp = generateOtp();
  await storeOtp(expiredOtp);
  await prisma.setting.update({
    where: { key: OTP_EXPIRES_SETTING_KEY },
    data: { value: new Date(Date.now() - 60_000).toISOString() },
  });
  const expired = await verifyOtpViaApi(expiredOtp);
  assert(expired.status === 401, `expired OTP → 401 (got ${expired.status})`);

  console.log("\n8) Correct OTP creates session (proxy regression canary)");
  await resetAuthTestState();
  const loginOtp = generateOtp();
  await storeOtp(loginOtp);
  const login = await verifyOtpViaApi(loginOtp);
  assert(login.status === 200, `verify OTP → 200 (got ${login.status})`);
  assert(login.data.success === true, "verify success flag");

  const sessionCookie = extractCookie(login.headers.get("set-cookie"));
  assert(sessionCookie.startsWith("lagom_admin="), "verify sets lagom_admin cookie");

  const setCookieHeader = login.headers.get("set-cookie") || "";
  assert(
    setCookieHeader.toLowerCase().includes("httponly"),
    "session cookie is HttpOnly",
  );
  assert(
    setCookieHeader.toLowerCase().includes("samesite=lax"),
    "session cookie is SameSite=Lax",
  );
  assert(setCookieHeader.includes("Path=/"), "session cookie Path=/");
  if (IS_PRODUCTION_TARGET) {
    assert(
      setCookieHeader.toLowerCase().includes("secure"),
      "session cookie is Secure in production",
    );
  }

  const authedApi = await fetchStatus("/api/admin/clients", {
    headers: { Cookie: sessionCookie },
  });
  assert(
    authedApi.status === 200,
    `authed GET /api/admin/clients → 200 (got ${authedApi.status})`,
  );
  assert(authedApi.body.includes('"clients"'), "authed API returns client data");

  const authedPage = await fetch(`${BASE}/admin/clients`, {
    headers: { Cookie: sessionCookie },
    redirect: "manual",
  });
  assert(
    authedPage.status === 200,
    `authed GET /admin/clients → 200 (got ${authedPage.status})`,
  );

  console.log("\n9) OTP is single-use");
  const replay = await verifyOtpViaApi(loginOtp);
  assert(replay.status === 401, `replayed OTP → 401 (got ${replay.status})`);

  console.log("\n10) Brute force invalidates OTP with rate-limit message");
  const bruteOtp = generateOtp();
  await storeOtp(bruteOtp);
  let lastStatus = 0;
  let lastError = "";
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const result = await verifyOtpViaApi("111111");
    lastStatus = result.status;
    lastError = String(result.data.error || "");
  }
  assert(
    lastStatus === 429,
    `6th wrong OTP attempt → 429 (got ${lastStatus})`,
  );
  assert(
    !lastError.toLowerCase().includes("incorrect password"),
    "rate-limit error is not misleading password text",
  );

  console.log("\n11) Logout clears session");
  await resetAuthTestState();
  const freshOtp = generateOtp();
  await storeOtp(freshOtp);
  const freshLogin = await verifyOtpViaApi(freshOtp);
  assert(
    freshLogin.status === 200,
    `pre-logout login → 200 (got ${freshLogin.status})`,
  );
  const freshCookie = extractCookie(freshLogin.headers.get("set-cookie"));
  assert(
    freshCookie.startsWith("lagom_admin="),
    "pre-logout login returned a session cookie",
  );

  const logoutResponse = await fetch(`${BASE}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: freshCookie },
  });
  assert(logoutResponse.status === 200, `logout → 200 (got ${logoutResponse.status})`);

  const clearedCookie =
    extractCookie(logoutResponse.headers.get("set-cookie")) || "lagom_admin=;";
  const afterLogout = await fetchStatus("/api/admin/clients", {
    headers: { Cookie: clearedCookie },
  });
  assert(
    afterLogout.status === 401,
    `after logout GET /api/admin/clients → 401 (got ${afterLogout.status})`,
  );

  if (SECOND_BASE) {
    console.log(`\n12) Session cookie works on second instance (${SECOND_BASE})`);
    await resetAuthTestState();
    const crossOtp = generateOtp();
    await storeOtp(crossOtp);
    const crossLogin = await verifyOtpViaApi(crossOtp);
    assert(
      crossLogin.status === 200,
      `cross-instance login → 200 (got ${crossLogin.status})`,
    );
    const crossCookie = extractCookie(crossLogin.headers.get("set-cookie"));

    let crossApiStatus = 0;
    try {
      const crossApi = await fetch(`${SECOND_BASE}/api/admin/clients`, {
        headers: { Cookie: crossCookie },
        signal: AbortSignal.timeout(5_000),
      });
      crossApiStatus = crossApi.status;
    } catch (error) {
      assert(
        false,
        `second instance reachable at ${SECOND_BASE} (${error instanceof Error ? error.message : "unknown error"})`,
      );
    }

    assert(
      crossApiStatus === 200,
      `second instance accepts session cookie (got ${crossApiStatus})`,
    );
  } else {
    console.log("\n12) Multi-instance cookie test skipped (set TEST_SECOND_BASE_URL)");
  }

  console.log(
    failed === 0
      ? "\nAll canonical auth E2E tests passed.\n"
      : `\n${failed} canonical auth E2E test(s) failed.\n`,
  );

  await resetAuthTestState();
  await prisma.$disconnect();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});

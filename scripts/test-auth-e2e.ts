/**
 * Canonical end-to-end auth tests for password login plus OTP password reset.
 *
 * Requires: running Next.js server (dev or production)
 * Run: npm run test:auth-e2e
 *
 * Environment:
 * - TEST_BASE_URL (default http://localhost:3000)
 * - TEST_SECOND_BASE_URL (optional second instance for multi-instance cookie test)
 *
 * Password hash and session version are snapshotted and restored in finally
 * so a deployed run cannot leave a test password behind.
 */
import { createHash } from "crypto";
import {
  clearOtp,
  generateOtp,
  OTP_EXPIRES_SETTING_KEY,
  OTP_HASH_SETTING_KEY,
  storeOtp,
} from "../src/lib/admin-otp";
import {
  MIN_PASSWORD_LENGTH,
  PASSWORD_HASH_SETTING_KEY,
  SESSION_VERSION_SETTING_KEY,
} from "../src/lib/admin-password";
import { prisma } from "../src/lib/prisma";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
const SECOND_BASE = process.env.TEST_SECOND_BASE_URL;
const IS_PRODUCTION_TARGET =
  process.env.TEST_EXPECT_PRODUCTION === "1" ||
  BASE.startsWith("https://");

const TEST_PASSWORD = "test-password-one";
const TEST_PASSWORD_NEXT = "test-password-two";

let failed = 0;
let didSnapshotPasswordState = false;
let snapshotPasswordHash: string | null = null;
let snapshotSessionVersion: string | null = null;

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

async function jsonPost(
  path: string,
  body: Record<string, unknown>,
  cookie = "",
): Promise<{
  status: number;
  data: Record<string, unknown>;
  headers: Headers;
}> {
  const response = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: response.status, data, headers: response.headers };
}

async function verifyOtpViaApi(otp: string): Promise<{
  status: number;
  data: Record<string, unknown>;
  headers: Headers;
}> {
  return jsonPost("/api/auth/otp/verify", { otp });
}

async function setPasswordViaApi(
  password: string,
  confirmPassword: string,
  cookie: string,
) {
  return jsonPost(
    "/api/auth/password/set",
    { password, confirmPassword },
    cookie,
  );
}

async function loginViaApi(password: string, cookie = "") {
  return jsonPost("/api/auth/password/login", { password }, cookie);
}

async function ensureServerReachable() {
  try {
    await fetch(`${BASE}/admin`);
  } catch {
    console.error(`  ✗ server not reachable at ${BASE}`);
    process.exit(1);
  }
}

async function snapshotPasswordState() {
  const [hashRow, versionRow] = await Promise.all([
    prisma.setting.findUnique({ where: { key: PASSWORD_HASH_SETTING_KEY } }),
    prisma.setting.findUnique({ where: { key: SESSION_VERSION_SETTING_KEY } }),
  ]);
  snapshotPasswordHash = hashRow?.value ?? null;
  snapshotSessionVersion = versionRow?.value ?? null;
  didSnapshotPasswordState = true;
}

async function restorePasswordState() {
  if (!didSnapshotPasswordState) {
    return;
  }

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

async function resetAuthTestState() {
  await clearOtp();
  await prisma.setting.deleteMany({
    where: {
      OR: [
        { key: { startsWith: "rate_limit:" } },
        { key: "admin_otp_verify_attempts" },
        { key: "admin_password_reset_nonce" },
      ],
    },
  });
}

async function clearStoredPassword() {
  await prisma.setting.deleteMany({
    where: {
      key: { in: [PASSWORD_HASH_SETTING_KEY, SESSION_VERSION_SETTING_KEY] },
    },
  });
}

async function completePasswordReset(password: string): Promise<{
  setStatus: number;
  cookie: string;
}> {
  const otp = generateOtp();
  await storeOtp(otp);
  const verify = await verifyOtpViaApi(otp);
  const cookie = extractCookie(verify.headers.get("set-cookie"));
  const setResult = await setPasswordViaApi(password, password, cookie);
  return { setStatus: setResult.status, cookie };
}

async function main() {
  console.log(`\nCanonical auth E2E tests against ${BASE}\n`);
  await ensureServerReachable();
  await snapshotPasswordState();

  try {
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

    console.log("\n4) Public admin login page shows password chooser");
    const adminPage = await fetchStatus("/admin");
    assert(adminPage.status === 200, `/admin → 200 (got ${adminPage.status})`);
    assert(
      adminPage.body.includes("Enter password"),
      "/admin includes Enter password",
    );
    assert(
      adminPage.body.includes("Forgot password"),
      "/admin includes Forgot password",
    );

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

    console.log("\n8) Correct OTP does not create a login session");
    await resetAuthTestState();
    const resetOtp = generateOtp();
    await storeOtp(resetOtp);
    const otpVerify = await verifyOtpViaApi(resetOtp);
    assert(otpVerify.status === 200, `verify OTP → 200 (got ${otpVerify.status})`);
    assert(otpVerify.data.success === true, "verify success flag");

    const resetCookie = extractCookie(otpVerify.headers.get("set-cookie"));
    assert(resetCookie.startsWith("lagom_admin="), "verify sets lagom_admin cookie");

    const otpAuthedApi = await fetchStatus("/api/admin/clients", {
      headers: { Cookie: resetCookie },
    });
    assert(
      otpAuthedApi.status === 401,
      `OTP cookie must not unlock admin API (got ${otpAuthedApi.status})`,
    );

    console.log("\n9) OTP is single-use");
    const replay = await verifyOtpViaApi(resetOtp);
    assert(replay.status === 401, `replayed OTP → 401 (got ${replay.status})`);

    console.log("\n10) Brute force invalidates OTP with rate-limit message");
    await resetAuthTestState();
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

    console.log("\n11) Set password without OTP verification is rejected");
    await resetAuthTestState();
    const noReset = await setPasswordViaApi(TEST_PASSWORD, TEST_PASSWORD, "");
    assert(
      noReset.status === 401,
      `set password without reset session → 401 (got ${noReset.status})`,
    );

    console.log("\n12) Short and mismatched passwords rejected");
    await resetAuthTestState();
    const policyOtp = generateOtp();
    await storeOtp(policyOtp);
    const policyVerify = await verifyOtpViaApi(policyOtp);
    const policyCookie = extractCookie(policyVerify.headers.get("set-cookie"));
    const shortPassword = "a".repeat(MIN_PASSWORD_LENGTH - 1);
    const short = await setPasswordViaApi(shortPassword, shortPassword, policyCookie);
    assert(short.status === 400, `short password → 400 (got ${short.status})`);
    const mismatch = await setPasswordViaApi(
      TEST_PASSWORD,
      `${TEST_PASSWORD}x`,
      policyCookie,
    );
    assert(mismatch.status === 400, `mismatched passwords → 400 (got ${mismatch.status})`);

    console.log("\n13) Password login before a password exists");
    await clearStoredPassword();
    const noPasswordLogin = await loginViaApi(TEST_PASSWORD);
    assert(
      noPasswordLogin.status === 401,
      `login with no password set → 401 (got ${noPasswordLogin.status})`,
    );
    assert(
      String(noPasswordLogin.data.error || "").toLowerCase().includes("forgot password"),
      "no-password login tells the user to use Forgot password",
    );

    console.log("\n14) OTP then set password stores a hash and does not sign in");
    await resetAuthTestState();
    await clearStoredPassword();
    const created = await completePasswordReset(TEST_PASSWORD);
    assert(created.setStatus === 200, `set password → 200 (got ${created.setStatus})`);

    const storedHash = await prisma.setting.findUnique({
      where: { key: PASSWORD_HASH_SETTING_KEY },
    });
    assert(Boolean(storedHash?.value), "password hash stored in database");
    assert(
      storedHash?.value !== TEST_PASSWORD,
      "plaintext password is not stored",
    );
    assert(
      storedHash?.value?.startsWith("scrypt$") === true,
      "stored value is a scrypt hash",
    );

    const afterSetApi = await fetchStatus("/api/admin/clients", {
      headers: { Cookie: created.cookie },
    });
    assert(
      afterSetApi.status === 401,
      `after set password still logged out (got ${afterSetApi.status})`,
    );

    console.log("\n15) Wrong password rejected; correct password creates session");
    const wrongPassword = await loginViaApi("definitely-wrong-password");
    assert(
      wrongPassword.status === 401,
      `wrong password → 401 (got ${wrongPassword.status})`,
    );

    const login = await loginViaApi(TEST_PASSWORD);
    assert(login.status === 200, `password login → 200 (got ${login.status})`);
    assert(login.data.success === true, "login success flag");

    const sessionCookie = extractCookie(login.headers.get("set-cookie"));
    assert(sessionCookie.startsWith("lagom_admin="), "login sets lagom_admin cookie");

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

    const setAfterLogin = await setPasswordViaApi(
      TEST_PASSWORD_NEXT,
      TEST_PASSWORD_NEXT,
      sessionCookie,
    );
    assert(
      setAfterLogin.status === 401,
      `logged-in session cannot set password without OTP (got ${setAfterLogin.status})`,
    );

    console.log("\n16) Password brute force rate-limited");
    await resetAuthTestState();
    let passwordBruteStatus = 0;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const result = await loginViaApi("wrong-password-brute");
      passwordBruteStatus = result.status;
    }
    assert(
      passwordBruteStatus === 429,
      `6th wrong password → 429 (got ${passwordBruteStatus})`,
    );

    console.log("\n17) Second reset replaces hash; old password fails; still not auto-logged-in");
    await resetAuthTestState();
    const replaced = await completePasswordReset(TEST_PASSWORD_NEXT);
    assert(
      replaced.setStatus === 200,
      `second set password → 200 (got ${replaced.setStatus})`,
    );
    const afterSecondSet = await fetchStatus("/api/admin/clients", {
      headers: { Cookie: replaced.cookie },
    });
    assert(
      afterSecondSet.status === 401,
      `second reset does not auto-login (got ${afterSecondSet.status})`,
    );
    const oldPasswordLogin = await loginViaApi(TEST_PASSWORD);
    assert(
      oldPasswordLogin.status === 401,
      `old password rejected after reset (got ${oldPasswordLogin.status})`,
    );
    const newPasswordLogin = await loginViaApi(TEST_PASSWORD_NEXT);
    assert(
      newPasswordLogin.status === 200,
      `new password login → 200 (got ${newPasswordLogin.status})`,
    );
    const newSessionCookie = extractCookie(newPasswordLogin.headers.get("set-cookie"));

    console.log("\n18) Old session cookie rejected after password change");
    const staleSession = await fetchStatus("/api/admin/clients", {
      headers: { Cookie: sessionCookie },
    });
    assert(
      staleSession.status === 401,
      `pre-reset session rejected after password change (got ${staleSession.status})`,
    );
    const freshSession = await fetchStatus("/api/admin/clients", {
      headers: { Cookie: newSessionCookie },
    });
    assert(
      freshSession.status === 200,
      `new session after reset → 200 (got ${freshSession.status})`,
    );

    console.log("\n19) Logout clears session");
    const logoutResponse = await fetch(`${BASE}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: newSessionCookie },
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
      console.log(`\n20) Session cookie works on second instance (${SECOND_BASE})`);
      await resetAuthTestState();
      const crossLogin = await loginViaApi(TEST_PASSWORD_NEXT);
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
      console.log("\n20) Multi-instance cookie test skipped (set TEST_SECOND_BASE_URL)");
    }
  } finally {
    await resetAuthTestState();
    await restorePasswordState();
    await prisma.$disconnect();
  }

  console.log(
    failed === 0
      ? "\nAll canonical auth E2E tests passed.\n"
      : `\n${failed} canonical auth E2E test(s) failed.\n`,
  );
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(async (error) => {
  console.error(error);
  try {
    await restorePasswordState();
  } catch (restoreError) {
    console.error("Failed to restore password state:", restoreError);
  }
  await prisma.$disconnect();
  process.exit(1);
});

/**
 * End-to-end authorization tests — verifies unauthenticated users cannot
 * access admin APIs or pages, and that session cookies are required.
 *
 * Requires: npm run dev (default http://localhost:3000)
 * Run: npx tsx --env-file=.env scripts/test-auth-security.ts
 */
import { setAdminPasswordHash } from "../src/lib/admin-password";
import { prisma } from "../src/lib/prisma";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
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

async function main() {
  console.log(`\nAuth security tests against ${BASE}\n`);

  // Ensure known password for login tests
  await setAdminPasswordHash("lagom-admin-test");

  try {
    await fetch(`${BASE}/admin`);
  } catch {
    console.error("  ✗ server not reachable — start with npm run dev");
    process.exit(1);
  }

  console.log("1) Unauthenticated admin API access (must be 401)");
  const protectedApiRoutes: Array<{ path: string; method: string; body?: string }> = [
    { path: "/api/admin/clients", method: "GET" },
    { path: "/api/admin/clients", method: "POST", body: "{}" },
    { path: "/api/admin/categories", method: "GET" },
    { path: "/api/admin/testimonials", method: "GET" },
    { path: "/api/admin/work-services", method: "GET" },
    { path: "/api/admin/upload", method: "POST" },
    {
      path: "/api/admin/change-password",
      method: "POST",
      body: JSON.stringify({
        currentPassword: "x",
        newPassword: "newpass12",
        confirmPassword: "newpass12",
      }),
    },
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
      response.status === 307 || response.status === 308
        ? location.includes("/admin") && !location.includes("/admin/clients")
        : false;
    assert(
      redirectedToLogin || (response.status === 307 && location.endsWith("/admin")),
      `${path} redirects unauthenticated user (status=${response.status}, location=${location})`,
    );
  }

  console.log("\n4) Public admin pages accessible without auth");
  for (const path of ["/admin", "/admin/forgot-password"]) {
    const { status } = await fetchStatus(path);
    assert(status === 200, `${path} → 200 (got ${status})`);
  }

  console.log("\n5) Login → authenticated access → logout flow");
  const loginResponse = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "lagom-admin-test" }),
  });
  assert(loginResponse.status === 200, `login → 200 (got ${loginResponse.status})`);

  const sessionCookie = extractCookie(loginResponse.headers.get("set-cookie"));
  assert(sessionCookie.startsWith("lagom_admin="), "login sets lagom_admin cookie");

  const authedApi = await fetchStatus("/api/admin/clients", {
    headers: { Cookie: sessionCookie },
  });
  assert(authedApi.status === 200, `authed GET /api/admin/clients → 200 (got ${authedApi.status})`);
  assert(
    authedApi.body.includes('"clients"'),
    "authed API returns client data",
  );

  const authedPage = await fetch(`${BASE}/admin/clients`, {
    headers: { Cookie: sessionCookie },
    redirect: "manual",
  });
  assert(
    authedPage.status === 200,
    `authed GET /admin/clients → 200 (got ${authedPage.status})`,
  );

  const logoutResponse = await fetch(`${BASE}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: sessionCookie },
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

  console.log("\n6) Wrong password rejected");
  const badLogin = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "definitely-wrong-password" }),
  });
  assert(badLogin.status === 401, `wrong password → 401 (got ${badLogin.status})`);

  console.log(
    failed === 0
      ? "\nAll auth security tests passed.\n"
      : `\n${failed} auth security test(s) failed.\n`,
  );
  await prisma.$disconnect();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});

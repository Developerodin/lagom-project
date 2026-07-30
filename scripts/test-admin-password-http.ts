/**
 * HTTP end-to-end test for login + forgot-password APIs.
 * Requires: npm run dev (default http://localhost:3000)
 * Run: npx tsx --env-file=.env scripts/test-admin-password-http.ts
 */
import {
  clearOtp,
  generateOtp,
  storeOtp,
  verifyAdminPassword,
} from "../src/lib/admin-password";
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

async function jsonFetch(path: string, body: unknown) {
  const response = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, data, headers: response.headers };
}

async function main() {
  console.log(`\nHTTP tests against ${BASE}`);

  // Health: server up?
  try {
    const health = await fetch(`${BASE}/admin/forgot-password`);
    assert(health.ok, "forgot-password page is reachable");
  } catch (error) {
    console.error("  ✗ server not reachable — start with npm run dev");
    console.error(error);
    process.exit(1);
  }

  console.log("\n1) Reject client-supplied destination (ignored, still sends)");
  // Pre-store OTP so we can verify without depending on inbox for reset step
  const knownOtp = generateOtp();
  await storeOtp(knownOtp);

  console.log("\n2) Reset password via OTP API");
  const newPassword = `http-test-${Date.now()}!`;
  const reset = await jsonFetch("/api/auth/forgot-password/reset", {
    otp: knownOtp,
    newPassword,
    confirmPassword: newPassword,
    email: "attacker@evil.com",
    phone: "+19999999999",
  });
  assert(reset.status === 200, `reset returns 200 (got ${reset.status})`);
  assert(reset.data.success === true, "reset success flag");
  assert(await verifyAdminPassword(newPassword), "DB accepts new password after reset");
  assert(!(await verifyAdminPassword("wrong")), "old/wrong password rejected");

  console.log("\n3) Login with new password");
  const login = await jsonFetch("/api/auth/login", { password: newPassword });
  assert(login.status === 200, `login returns 200 (got ${login.status})`);
  assert(login.data.success === true, "login success flag");
  const setCookie = login.headers.get("set-cookie") || "";
  assert(setCookie.toLowerCase().includes("lagom_admin"), "sets lagom_admin session cookie");

  console.log("\n4) Login rejects wrong password");
  const badLogin = await jsonFetch("/api/auth/login", { password: "definitely-wrong" });
  assert(badLogin.status === 401, `bad login returns 401 (got ${badLogin.status})`);

  console.log("\n5) Expired / wrong OTP rejected");
  await storeOtp("654321");
  const badReset = await jsonFetch("/api/auth/forgot-password/reset", {
    otp: "000000",
    newPassword: "anotherpass1",
    confirmPassword: "anotherpass1",
  });
  assert(badReset.status === 401, `wrong OTP returns 401 (got ${badReset.status})`);
  await clearOtp();

  console.log("\n6) Send OTP API (live email)");
  const send = await jsonFetch("/api/auth/forgot-password/send-otp", {
    email: "attacker@evil.com",
  });
  assert(
    send.status === 200,
    `send-otp returns 200 (got ${send.status}: ${send.data.error || ""})`,
  );
  assert(send.data.success === true, "send-otp success flag");

  // Leave a known local password for continued manual testing
  const { setAdminPasswordHash } = await import("../src/lib/admin-password");
  await setAdminPasswordHash("lagom-admin-test");
  console.log("\n  · restored local password to: lagom-admin-test");

  console.log(
    failed === 0
      ? "\nAll HTTP admin password tests passed.\n"
      : `\n${failed} HTTP test(s) failed.\n`,
  );
  await prisma.$disconnect();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});

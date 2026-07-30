/**
 * Rigorous local test for admin password + OTP recovery.
 * Run: npx tsx scripts/test-admin-password.ts
 */
import bcrypt from "bcryptjs";
import {
  ADMIN_RECOVERY_EMAIL,
  clearOtp,
  ensureAdminPasswordSeeded,
  generateOtp,
  getAdminPasswordHash,
  PASSWORD_SETTING_KEY,
  setAdminPasswordHash,
  storeOtp,
  validateNewPassword,
  verifyAdminPassword,
  verifyOtp,
} from "../src/lib/admin-password";
import { normalizeBcryptHash } from "../src/lib/env";
import { sendAdminOtpEmail } from "../src/lib/email";
import { prisma } from "../src/lib/prisma";

let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  ✓ ${label}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${label}`);
  }
}

async function main() {
  console.log("\n1) Hash normalization (deploy-safe)");
  const escaped = "\\$2b\\$10\\$N5Y.Yo6ZoxZ7ZdAG0.GfZOt.NMEnjAcMnlJBhsFqaofnrwY.Oj7Bq";
  const normalized = normalizeBcryptHash(escaped);
  assert(normalized.startsWith("$2b$10$"), "strips backslashes before $");
  assert(!normalized.includes("\\"), "no remaining backslashes");

  console.log("\n2) Password validation");
  assert(validateNewPassword("short", "short") !== null, "rejects short passwords");
  assert(
    validateNewPassword("longenough", "different") !== null,
    "rejects mismatched confirmation",
  );
  assert(validateNewPassword("longenough", "longenough") === null, "accepts valid password");

  console.log("\n3) DB Setting table + password round-trip");
  const testPassword = `test-${Date.now()}-Aa1!`;
  await setAdminPasswordHash(testPassword);
  const stored = await getAdminPasswordHash();
  assert(!!stored && stored.startsWith("$2"), "stores bcrypt hash in Setting");
  assert(await verifyAdminPassword(testPassword), "verifyAdminPassword accepts new password");
  assert(!(await verifyAdminPassword("wrong-password")), "rejects wrong password");

  console.log("\n4) Corrupted-hash self-heal");
  const goodHash = await bcrypt.hash("heal-me-please", 10);
  const corrupted = goodHash.replaceAll("$", "\\$");
  await prisma.setting.upsert({
    where: { key: PASSWORD_SETTING_KEY },
    create: { key: PASSWORD_SETTING_KEY, value: corrupted },
    update: { value: corrupted },
  });
  assert(await verifyAdminPassword("heal-me-please"), "self-heals \\$ corrupted DB hash");
  const healed = await getAdminPasswordHash();
  assert(!!healed && !healed.includes("\\"), "persists healed hash without backslashes");

  console.log("\n5) OTP store / verify / single-use semantics");
  const otp = generateOtp();
  assert(/^\d{6}$/.test(otp), "OTP is 6 digits");
  await storeOtp(otp);
  assert(await verifyOtp(otp), "accepts correct OTP");
  assert(!(await verifyOtp("000000")), "rejects wrong OTP");
  // Re-store and clear
  await storeOtp(otp);
  await clearOtp();
  assert(!(await verifyOtp(otp)), "cleared OTP is invalid");

  console.log("\n6) Expired OTP");
  await storeOtp("123456");
  await prisma.setting.upsert({
    where: { key: "admin_otp_expires_at" },
    create: {
      key: "admin_otp_expires_at",
      value: new Date(Date.now() - 1000).toISOString(),
    },
    update: { value: new Date(Date.now() - 1000).toISOString() },
  });
  assert(!(await verifyOtp("123456")), "rejects expired OTP");

  console.log("\n7) Bootstrap seed path");
  await prisma.setting.deleteMany({
    where: { key: { in: [PASSWORD_SETTING_KEY, "admin_otp_hash", "admin_otp_expires_at"] } },
  });
  // Ensure env bootstrap (if any) or null is handled
  const seeded = await ensureAdminPasswordSeeded();
  if (seeded) {
    assert(seeded.startsWith("$2"), "env bootstrap hash is valid bcrypt");
    assert(!seeded.includes("\\"), "env bootstrap has no backslashes");
  } else {
    console.log("  · no ADMIN_PASSWORD_HASH bootstrap (OTP-only setup is OK)");
  }

  // Restore a known password for continued local use
  await setAdminPasswordHash("lagom-admin-test");
  assert(await verifyAdminPassword("lagom-admin-test"), "restored known local test password");

  console.log("\n8) Resend OTP email (live)");
  console.log(`  · destination locked to ${ADMIN_RECOVERY_EMAIL}`);
  if (!process.env.RESEND_API_KEY?.trim()) {
    console.log("  · skipped (RESEND_API_KEY not set)");
  } else {
    const liveOtp = generateOtp();
    try {
      await sendAdminOtpEmail(liveOtp, ADMIN_RECOVERY_EMAIL);
      console.log(`  ✓ sent OTP email (code ${liveOtp} — check inbox)`);
    } catch (error) {
      failed += 1;
      console.error("  ✗ sendAdminOtpEmail failed:", error);
    }
  }

  console.log(
    failed === 0
      ? "\nAll admin password tests passed.\n"
      : `\n${failed} test(s) failed.\n`,
  );
  await prisma.$disconnect();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});

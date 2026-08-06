import { createHash, randomInt, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

export const OTP_HASH_SETTING_KEY = "admin_otp_hash";
export const OTP_EXPIRES_SETTING_KEY = "admin_otp_expires_at";
export const OTP_VERIFY_ATTEMPTS_KEY = "admin_otp_verify_attempts";

/** Hardcoded login destination — never accept from the client. */
export const ADMIN_LOGIN_EMAIL = "studiolagomdesign@gmail.com";

export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_LENGTH = 6;
export const MAX_OTP_VERIFY_ATTEMPTS = 5;

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

export function generateOtp(): string {
  const max = 10 ** OTP_LENGTH;
  return String(randomInt(0, max)).padStart(OTP_LENGTH, "0");
}

export async function resetOtpVerifyAttempts(): Promise<void> {
  await prisma.setting.deleteMany({
    where: { key: OTP_VERIFY_ATTEMPTS_KEY },
  });
}

export async function getOtpVerifyAttempts(): Promise<number> {
  const row = await prisma.setting.findUnique({
    where: { key: OTP_VERIFY_ATTEMPTS_KEY },
    select: { value: true },
  });
  if (!row?.value) {
    return 0;
  }
  const parsed = Number.parseInt(row.value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

/** Returns true when the active OTP was invalidated after too many failures. */
export async function recordOtpVerifyFailure(): Promise<boolean> {
  const attempts = (await getOtpVerifyAttempts()) + 1;
  await prisma.setting.upsert({
    where: { key: OTP_VERIFY_ATTEMPTS_KEY },
    create: { key: OTP_VERIFY_ATTEMPTS_KEY, value: String(attempts) },
    update: { value: String(attempts) },
  });

  if (attempts >= MAX_OTP_VERIFY_ATTEMPTS) {
    await clearOtp();
    return true;
  }

  return false;
}

export async function storeOtp(otp: string): Promise<void> {
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();
  const otpHash = hashOtp(otp);

  await prisma.$transaction([
    prisma.setting.upsert({
      where: { key: OTP_HASH_SETTING_KEY },
      create: { key: OTP_HASH_SETTING_KEY, value: otpHash },
      update: { value: otpHash },
    }),
    prisma.setting.upsert({
      where: { key: OTP_EXPIRES_SETTING_KEY },
      create: { key: OTP_EXPIRES_SETTING_KEY, value: expiresAt },
      update: { value: expiresAt },
    }),
    prisma.setting.deleteMany({
      where: { key: OTP_VERIFY_ATTEMPTS_KEY },
    }),
  ]);
}

export async function clearOtp(): Promise<void> {
  await prisma.setting.deleteMany({
    where: {
      key: {
        in: [OTP_HASH_SETTING_KEY, OTP_EXPIRES_SETTING_KEY, OTP_VERIFY_ATTEMPTS_KEY],
      },
    },
  });
}

export async function hasActiveOtp(): Promise<boolean> {
  const [hashRow, expiresRow] = await Promise.all([
    prisma.setting.findUnique({
      where: { key: OTP_HASH_SETTING_KEY },
      select: { value: true },
    }),
    prisma.setting.findUnique({
      where: { key: OTP_EXPIRES_SETTING_KEY },
      select: { value: true },
    }),
  ]);

  if (!hashRow?.value || !expiresRow?.value) {
    return false;
  }

  const expiresAt = Date.parse(expiresRow.value);
  return Number.isFinite(expiresAt) && Date.now() <= expiresAt;
}

export async function verifyOtp(otp: string): Promise<boolean> {
  const [hashRow, expiresRow] = await Promise.all([
    prisma.setting.findUnique({
      where: { key: OTP_HASH_SETTING_KEY },
      select: { value: true },
    }),
    prisma.setting.findUnique({
      where: { key: OTP_EXPIRES_SETTING_KEY },
      select: { value: true },
    }),
  ]);

  if (!hashRow?.value || !expiresRow?.value) {
    return false;
  }

  const expiresAt = Date.parse(expiresRow.value);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    await clearOtp();
    return false;
  }

  const candidate = hashOtp(otp);
  const expected = Buffer.from(hashRow.value, "utf8");
  const actual = Buffer.from(candidate, "utf8");
  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

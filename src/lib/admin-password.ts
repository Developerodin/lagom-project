import { createHash, randomInt, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { env, normalizeBcryptHash } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const PASSWORD_SETTING_KEY = "admin_password_hash";
export const OTP_HASH_SETTING_KEY = "admin_otp_hash";
export const OTP_EXPIRES_SETTING_KEY = "admin_otp_expires_at";

/** Hardcoded recovery destination — never accept from the client. */
export const ADMIN_RECOVERY_EMAIL = "studiolagomdesign@gmail.com";

export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_LENGTH = 6;
export const MIN_PASSWORD_LENGTH = 8;

const BCRYPT_HASH_PATTERN = /^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/;

export async function getAdminPasswordHash(): Promise<string | null> {
  const stored = await prisma.setting.findUnique({
    where: { key: PASSWORD_SETTING_KEY },
    select: { value: true },
  });
  if (!stored?.value) {
    return null;
  }

  const normalized = normalizeBcryptHash(stored.value);
  // Self-heal hashes that were seeded with literal backslashes.
  if (normalized !== stored.value && BCRYPT_HASH_PATTERN.test(normalized)) {
    await prisma.setting.update({
      where: { key: PASSWORD_SETTING_KEY },
      data: { value: normalized },
    });
    return normalized;
  }

  return stored.value;
}

/**
 * One-time bootstrap: copy env ADMIN_PASSWORD_HASH into DB when missing.
 * After this, login uses DB only.
 */
export async function ensureAdminPasswordSeeded(): Promise<string | null> {
  const existing = await getAdminPasswordHash();
  if (existing) {
    return existing;
  }

  const bootstrap = env.adminPasswordHash;
  if (!bootstrap || !BCRYPT_HASH_PATTERN.test(bootstrap)) {
    if (bootstrap) {
      console.error(
        "[admin-password] ADMIN_PASSWORD_HASH is not a valid bcrypt hash after normalization. Skipping seed.",
      );
    }
    return null;
  }

  await prisma.setting.upsert({
    where: { key: PASSWORD_SETTING_KEY },
    create: { key: PASSWORD_SETTING_KEY, value: bootstrap },
    update: { value: bootstrap },
  });

  return bootstrap;
}

export async function setAdminPasswordHash(plainPassword: string): Promise<void> {
  const hash = await bcrypt.hash(plainPassword, 10);
  await prisma.setting.upsert({
    where: { key: PASSWORD_SETTING_KEY },
    create: { key: PASSWORD_SETTING_KEY, value: hash },
    update: { value: hash },
  });
}

export async function verifyAdminPassword(plainPassword: string): Promise<boolean> {
  const hash = await ensureAdminPasswordSeeded();
  if (!hash) {
    return false;
  }
  return bcrypt.compare(plainPassword, hash);
}

export function validateNewPassword(
  newPassword: string,
  confirmPassword: string,
): string | null {
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (newPassword !== confirmPassword) {
    return "New password and confirmation do not match.";
  }
  return null;
}

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

export function generateOtp(): string {
  const max = 10 ** OTP_LENGTH;
  return String(randomInt(0, max)).padStart(OTP_LENGTH, "0");
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
  ]);
}

export async function clearOtp(): Promise<void> {
  await prisma.setting.deleteMany({
    where: {
      key: { in: [OTP_HASH_SETTING_KEY, OTP_EXPIRES_SETTING_KEY] },
    },
  });
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

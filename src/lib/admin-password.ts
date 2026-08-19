import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { prisma } from "@/lib/prisma";

export const PASSWORD_HASH_SETTING_KEY = "admin_password_hash";
export const SESSION_VERSION_SETTING_KEY = "admin_session_version";
export const PASSWORD_RESET_NONCE_KEY = "admin_password_reset_nonce";
export const MIN_PASSWORD_LENGTH = 10;

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 32;
const SALT_LEN = 16;

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number },
) => Promise<Buffer>;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LEN);
  const derived = await scryptAsync(password, salt, KEY_LEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });

  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPasswordHash(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") {
    return false;
  }

  const N = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  const salt = Buffer.from(parts[4], "hex");
  const expected = Buffer.from(parts[5], "hex");

  if (
    !Number.isFinite(N) ||
    !Number.isFinite(r) ||
    !Number.isFinite(p) ||
    salt.length === 0 ||
    expected.length === 0
  ) {
    return false;
  }

  const actual = await scryptAsync(password, salt, expected.length, { N, r, p });
  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}

export async function getPasswordHash(): Promise<string | null> {
  const row = await prisma.setting.findUnique({
    where: { key: PASSWORD_HASH_SETTING_KEY },
    select: { value: true },
  });
  return row?.value || null;
}

export async function hasPassword(): Promise<boolean> {
  const hash = await getPasswordHash();
  return Boolean(hash);
}

export async function getSessionVersion(): Promise<number> {
  const row = await prisma.setting.findUnique({
    where: { key: SESSION_VERSION_SETTING_KEY },
    select: { value: true },
  });
  if (!row?.value) {
    return 0;
  }
  const parsed = Number.parseInt(row.value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export async function issuePasswordResetNonce(): Promise<string> {
  const nonce = randomBytes(16).toString("hex");
  await prisma.setting.upsert({
    where: { key: PASSWORD_RESET_NONCE_KEY },
    create: { key: PASSWORD_RESET_NONCE_KEY, value: nonce },
    update: { value: nonce },
  });
  return nonce;
}

export async function consumePasswordResetNonce(nonce: string): Promise<boolean> {
  if (!nonce) {
    return false;
  }

  const row = await prisma.setting.findUnique({
    where: { key: PASSWORD_RESET_NONCE_KEY },
    select: { value: true },
  });
  if (!row?.value) {
    return false;
  }

  const expected = Buffer.from(row.value, "utf8");
  const actual = Buffer.from(nonce, "utf8");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return false;
  }

  await prisma.setting.deleteMany({
    where: { key: PASSWORD_RESET_NONCE_KEY },
  });
  return true;
}

export async function setPassword(password: string): Promise<void> {
  const hash = await hashPassword(password);
  const nextVersion = (await getSessionVersion()) + 1;
  await prisma.$transaction([
    prisma.setting.upsert({
      where: { key: PASSWORD_HASH_SETTING_KEY },
      create: { key: PASSWORD_HASH_SETTING_KEY, value: hash },
      update: { value: hash },
    }),
    prisma.setting.upsert({
      where: { key: SESSION_VERSION_SETTING_KEY },
      create: { key: SESSION_VERSION_SETTING_KEY, value: String(nextVersion) },
      update: { value: String(nextVersion) },
    }),
  ]);
}

export async function verifyPassword(password: string): Promise<boolean> {
  const stored = await getPasswordHash();
  if (!stored) {
    return false;
  }
  return verifyPasswordHash(password, stored);
}

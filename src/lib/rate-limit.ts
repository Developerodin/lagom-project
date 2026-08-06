import { prisma } from "@/lib/prisma";

type RateLimitOptions = {
  windowMs: number;
  maxAttempts: number;
};

function settingKey(key: string) {
  return `rate_limit:${key}`;
}

async function readTimestamps(key: string, windowMs: number): Promise<number[]> {
  const row = await prisma.setting.findUnique({
    where: { key: settingKey(key) },
    select: { value: true },
  });

  if (!row?.value) {
    return [];
  }

  try {
    const parsed = JSON.parse(row.value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    const now = Date.now();
    return parsed
      .filter((value): value is number => typeof value === "number")
      .filter((timestamp) => now - timestamp < windowMs);
  } catch {
    return [];
  }
}

async function writeTimestamps(key: string, timestamps: number[]): Promise<void> {
  const dbKey = settingKey(key);
  if (timestamps.length === 0) {
    await prisma.setting.deleteMany({ where: { key: dbKey } });
    return;
  }

  await prisma.setting.upsert({
    where: { key: dbKey },
    create: { key: dbKey, value: JSON.stringify(timestamps) },
    update: { value: JSON.stringify(timestamps) },
  });
}

export async function isRateLimited(
  key: string,
  options: RateLimitOptions,
): Promise<boolean> {
  const timestamps = await readTimestamps(key, options.windowMs);
  return timestamps.length >= options.maxAttempts;
}

export async function recordAttempt(
  key: string,
  options: RateLimitOptions,
): Promise<void> {
  const timestamps = await readTimestamps(key, options.windowMs);
  timestamps.push(Date.now());
  await writeTimestamps(key, timestamps);
}

export async function clearAttempts(key: string): Promise<void> {
  await prisma.setting.deleteMany({ where: { key: settingKey(key) } });
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

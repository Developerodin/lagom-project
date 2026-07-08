import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const PASSWORD_SETTING_KEY = "admin_password_hash";

const recentAttempts = new Map<string, number[]>();

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const previous = (recentAttempts.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );

  if (previous.length >= MAX_ATTEMPTS) {
    recentAttempts.set(ip, previous);
    return true;
  }

  return false;
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const previous = (recentAttempts.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );
  previous.push(now);
  recentAttempts.set(ip, previous);
}

async function getActiveAdminPasswordHash() {
  try {
    const stored = await prisma.setting.findUnique({
      where: { key: PASSWORD_SETTING_KEY },
      select: { value: true },
    });
    return stored?.value ?? env.adminPasswordHash;
  } catch {
    return env.adminPasswordHash;
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Incorrect password." },
      { status: 429 },
    );
  }

  let password: unknown;

  try {
    const body = await request.json();
    password = body?.password;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const hash = await getActiveAdminPasswordHash();

  if (!hash) {
    return NextResponse.json(
      { error: "Admin password is not configured." },
      { status: 500 },
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return NextResponse.json(
      { error: "Password is required." },
      { status: 400 },
    );
  }

  const valid = await bcrypt.compare(password, hash);

  if (!valid) {
    recordFailedAttempt(ip);
    return NextResponse.json(
      { error: "Incorrect password." },
      { status: 401 },
    );
  }

  recentAttempts.delete(ip);

  const session = await getSession();
  session.isLoggedIn = true;
  await session.save();

  return NextResponse.json({ success: true });
}

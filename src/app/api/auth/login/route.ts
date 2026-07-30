import { NextResponse } from "next/server";
import { ensureAdminPasswordSeeded, verifyAdminPassword } from "@/lib/admin-password";
import { getSession } from "@/lib/auth";
import {
  clearAttempts,
  getClientIp,
  isRateLimited,
  recordAttempt,
} from "@/lib/rate-limit";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateKey = `login:${ip}`;

  if (isRateLimited(rateKey, { windowMs: WINDOW_MS, maxAttempts: MAX_ATTEMPTS })) {
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

  if (typeof password !== "string" || password.length === 0) {
    return NextResponse.json(
      { error: "Password is required." },
      { status: 400 },
    );
  }

  let hashExists: string | null;
  try {
    hashExists = await ensureAdminPasswordSeeded();
  } catch (error) {
    console.error("[login] Failed to load admin password:", error);
    return NextResponse.json(
      { error: "Admin password is not configured." },
      { status: 500 },
    );
  }

  if (!hashExists) {
    return NextResponse.json(
      {
        error:
          "Admin password is not configured. Use Forgot password to set one via email OTP.",
      },
      { status: 500 },
    );
  }

  const valid = await verifyAdminPassword(password);

  if (!valid) {
    recordAttempt(rateKey, { windowMs: WINDOW_MS, maxAttempts: MAX_ATTEMPTS });
    return NextResponse.json(
      { error: "Incorrect password." },
      { status: 401 },
    );
  }

  clearAttempts(rateKey);

  const session = await getSession();
  session.isLoggedIn = true;
  await session.save();

  return NextResponse.json({ success: true });
}

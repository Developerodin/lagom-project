import { NextResponse } from "next/server";
import { ensureAdminPasswordSeeded, verifyAdminPassword } from "@/lib/admin-password";
import { getSession } from "@/lib/auth";
import {
  clearAttempts,
  getClientIp,
  isRateLimited,
  recordAttempt,
} from "@/lib/rate-limit";
import { withTimeout } from "@/lib/with-timeout";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
/** Cap DB work so a hung MySQL connection cannot leave the client spinning forever. */
const LOGIN_DB_TIMEOUT_MS = 12_000;

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
  let valid: boolean;

  try {
    hashExists = await withTimeout(
      ensureAdminPasswordSeeded(),
      LOGIN_DB_TIMEOUT_MS,
      "Database timed out while loading admin password",
    );

    if (!hashExists) {
      return NextResponse.json(
        {
          error:
            "Admin password is not configured. Use Forgot password to set one via email OTP.",
        },
        { status: 500 },
      );
    }

    valid = await withTimeout(
      verifyAdminPassword(password),
      LOGIN_DB_TIMEOUT_MS,
      "Database timed out while verifying password",
    );
  } catch (error) {
    console.error("[login] Failed to verify admin password:", error);
    return NextResponse.json(
      {
        error:
          "Sign-in is temporarily unavailable. Please try again in a moment.",
      },
      { status: 503 },
    );
  }

  if (!valid) {
    recordAttempt(rateKey, { windowMs: WINDOW_MS, maxAttempts: MAX_ATTEMPTS });
    return NextResponse.json(
      { error: "Incorrect password." },
      { status: 401 },
    );
  }

  clearAttempts(rateKey);

  try {
    const session = await getSession();
    session.isLoggedIn = true;
    await session.save();
  } catch (error) {
    console.error("[login] Failed to create session:", error);
    return NextResponse.json(
      { error: "Could not create session. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

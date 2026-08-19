import { NextResponse } from "next/server";
import { getSessionVersion, hasPassword, verifyPassword } from "@/lib/admin-password";
import { clearPasswordReset, getSession } from "@/lib/auth";
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
  const rateKey = `password-login:${ip}`;

  if (
    await isRateLimited(rateKey, {
      windowMs: WINDOW_MS,
      maxAttempts: MAX_ATTEMPTS,
    })
  ) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait before trying again." },
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
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  if (!(await hasPassword())) {
    return NextResponse.json(
      { error: "No password is set yet. Use Forgot password to create one." },
      { status: 401 },
    );
  }

  const passwordValid = await verifyPassword(password);
  if (!passwordValid) {
    await recordAttempt(rateKey, {
      windowMs: WINDOW_MS,
      maxAttempts: MAX_ATTEMPTS,
    });

    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  try {
    await clearAttempts(rateKey);

    const session = await getSession();
    session.isLoggedIn = true;
    session.sessionVersion = await getSessionVersion();
    clearPasswordReset(session);
    await session.save();
  } catch (error) {
    console.error("[password/login] Failed to create session:", error);
    return NextResponse.json(
      { error: "Could not create session. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

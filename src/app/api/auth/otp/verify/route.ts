import { NextResponse } from "next/server";
import {
  clearOtp,
  getOtpVerifyAttempts,
  MAX_OTP_VERIFY_ATTEMPTS,
  recordOtpVerifyFailure,
  verifyOtp,
} from "@/lib/admin-otp";
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
  const rateKey = `otp-verify:${ip}`;

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

  let otp: unknown;

  try {
    const body = await request.json();
    otp = body?.otp;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (typeof otp !== "string" || otp.trim().length === 0) {
    return NextResponse.json({ error: "Login code is required." }, { status: 400 });
  }

  const normalizedOtp = otp.trim();

  const otpValid = await verifyOtp(normalizedOtp);
  if (!otpValid) {
    const invalidated = await recordOtpVerifyFailure();
    await recordAttempt(rateKey, {
      windowMs: WINDOW_MS,
      maxAttempts: MAX_ATTEMPTS,
    });

    if (invalidated) {
      return NextResponse.json(
        {
          error:
            "Too many incorrect codes. Request a new login code and try again.",
        },
        { status: 429 },
      );
    }

    const remaining = Math.max(
      0,
      MAX_OTP_VERIFY_ATTEMPTS - (await getOtpVerifyAttempts()),
    );

    return NextResponse.json(
      {
        error:
          remaining > 0
            ? `Invalid or expired login code. ${remaining} attempt(s) remaining.`
            : "Invalid or expired login code.",
      },
      { status: 401 },
    );
  }

  try {
    await clearOtp();
    await clearAttempts(rateKey);

    const session = await getSession();
    session.isLoggedIn = true;
    await session.save();
  } catch (error) {
    console.error("[otp/verify] Failed to create session:", error);
    return NextResponse.json(
      { error: "Could not create session. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

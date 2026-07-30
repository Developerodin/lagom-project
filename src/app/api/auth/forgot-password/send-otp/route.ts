import { NextResponse } from "next/server";
import {
  ADMIN_RECOVERY_EMAIL,
  clearOtp,
  generateOtp,
  storeOtp,
} from "@/lib/admin-password";
import { sendAdminOtpEmail } from "@/lib/email";
import {
  clearAttempts,
  getClientIp,
  isRateLimited,
  recordAttempt,
} from "@/lib/rate-limit";

const SHORT_WINDOW_MS = 60 * 1000;
const SHORT_MAX = 1;
const HOUR_WINDOW_MS = 60 * 60 * 1000;
const HOUR_MAX = 5;

const GENERIC_SUCCESS = {
  success: true,
  message: "If recovery is available, a code has been sent to the studio email.",
};

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const shortKey = `otp-send-short:${ip}`;
  const hourKey = `otp-send-hour:${ip}`;

  if (
    isRateLimited(shortKey, { windowMs: SHORT_WINDOW_MS, maxAttempts: SHORT_MAX }) ||
    isRateLimited(hourKey, { windowMs: HOUR_WINDOW_MS, maxAttempts: HOUR_MAX })
  ) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429 },
    );
  }

  // Intentionally ignore any client-supplied email/phone — destination is fixed.
  await request.json().catch(() => null);

  if (!process.env.RESEND_API_KEY?.trim()) {
    return NextResponse.json(
      {
        error:
          "Email is not configured. Set RESEND_API_KEY on the server, then try again.",
      },
      { status: 503 },
    );
  }

  try {
    const otp = generateOtp();
    await storeOtp(otp);
    await sendAdminOtpEmail(otp, ADMIN_RECOVERY_EMAIL);
  } catch (error) {
    await clearOtp().catch(() => undefined);
    console.error("[forgot-password] Failed to send OTP:", error);

    const message =
      error instanceof Error ? error.message : "Unknown email error";
    const isConfigIssue =
      message.toLowerCase().includes("not configured") ||
      message.toLowerCase().includes("domain") ||
      message.toLowerCase().includes("api key") ||
      message.toLowerCase().includes("invalid");

    return NextResponse.json(
      {
        error: isConfigIssue
          ? `Could not send recovery code: ${message}`
          : "Could not send recovery code. Please try again later.",
      },
      { status: 500 },
    );
  }

  recordAttempt(shortKey, { windowMs: SHORT_WINDOW_MS, maxAttempts: SHORT_MAX });
  recordAttempt(hourKey, { windowMs: HOUR_WINDOW_MS, maxAttempts: HOUR_MAX });
  clearAttempts(`otp-verify:${ip}`);

  return NextResponse.json(GENERIC_SUCCESS);
}

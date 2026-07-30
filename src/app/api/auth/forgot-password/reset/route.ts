import { NextResponse } from "next/server";
import {
  clearOtp,
  setAdminPasswordHash,
  validateNewPassword,
  verifyOtp,
} from "@/lib/admin-password";
import { getSession } from "@/lib/auth";
import {
  clearAttempts,
  getClientIp,
  isRateLimited,
  recordAttempt,
} from "@/lib/rate-limit";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type RequestBody = {
  otp?: unknown;
  newPassword?: unknown;
  confirmPassword?: unknown;
};

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateKey = `otp-verify:${ip}`;

  if (isRateLimited(rateKey, { windowMs: WINDOW_MS, maxAttempts: MAX_ATTEMPTS })) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const otp = typeof body.otp === "string" ? body.otp.trim() : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  const confirmPassword =
    typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!otp) {
    return NextResponse.json({ error: "Recovery code is required." }, { status: 400 });
  }

  const passwordError = validateNewPassword(newPassword, confirmPassword);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  const otpValid = await verifyOtp(otp);
  if (!otpValid) {
    recordAttempt(rateKey, { windowMs: WINDOW_MS, maxAttempts: MAX_ATTEMPTS });
    return NextResponse.json(
      { error: "Invalid or expired recovery code." },
      { status: 401 },
    );
  }

  try {
    await setAdminPasswordHash(newPassword);
    await clearOtp();
  } catch (error) {
    console.error("[forgot-password] Failed to reset password:", error);
    return NextResponse.json(
      { error: "Could not reset password. Please try again." },
      { status: 500 },
    );
  }

  clearAttempts(rateKey);
  clearAttempts(`login:${ip}`);

  const session = await getSession();
  session.isLoggedIn = true;
  await session.save();

  return NextResponse.json({ success: true });
}

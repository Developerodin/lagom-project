import { NextResponse } from "next/server";
import { clearOtp } from "@/lib/admin-otp";
import {
  consumePasswordResetNonce,
  MIN_PASSWORD_LENGTH,
  setPassword,
} from "@/lib/admin-password";
import { getSession, hasValidPasswordReset } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();

  if (!hasValidPasswordReset(session)) {
    return NextResponse.json(
      { error: "Reset the password with a valid email code first." },
      { status: 401 },
    );
  }

  let password: unknown;
  let confirmPassword: unknown;

  try {
    const body = await request.json();
    password = body?.password;
    confirmPassword = body?.confirmPassword;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (typeof password !== "string" || typeof confirmPassword !== "string") {
    return NextResponse.json(
      { error: "Password and confirmation are required." },
      { status: 400 },
    );
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
      { status: 400 },
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match." },
      { status: 400 },
    );
  }

  const nonceConsumed = await consumePasswordResetNonce(
    session.passwordResetNonce || "",
  );
  if (!nonceConsumed) {
    return NextResponse.json(
      { error: "Reset the password with a valid email code first." },
      { status: 401 },
    );
  }

  try {
    await setPassword(password);
    await clearOtp();
    session.destroy();
  } catch (error) {
    console.error("[password/set] Failed to save password:", error);
    return NextResponse.json(
      { error: "Could not save password. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

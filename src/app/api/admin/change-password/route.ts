import { NextResponse } from "next/server";
import {
  setAdminPasswordHash,
  validateNewPassword,
  verifyAdminPassword,
} from "@/lib/admin-password";
import { requireAuth } from "@/lib/auth";

type RequestBody = {
  currentPassword?: unknown;
  newPassword?: unknown;
  confirmPassword?: unknown;
};

export async function POST(request: Request) {
  const authError = await requireAuth();
  if (authError) return authError;

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const currentPassword = body.currentPassword;
  const newPassword = body.newPassword;
  const confirmPassword = body.confirmPassword;

  if (typeof currentPassword !== "string" || currentPassword.length === 0) {
    return NextResponse.json({ error: "Current password is required." }, { status: 400 });
  }
  if (typeof newPassword !== "string" || newPassword.length === 0) {
    return NextResponse.json({ error: "New password is required." }, { status: 400 });
  }
  if (typeof confirmPassword !== "string" || confirmPassword.length === 0) {
    return NextResponse.json(
      { error: "Please confirm the new password." },
      { status: 400 },
    );
  }

  const newPasswordError = validateNewPassword(newPassword, confirmPassword);
  if (newPasswordError) {
    return NextResponse.json({ error: newPasswordError }, { status: 400 });
  }

  const valid = await verifyAdminPassword(currentPassword);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  try {
    await setAdminPasswordHash(newPassword);
  } catch {
    return NextResponse.json(
      { error: "Could not update password. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

const PASSWORD_SETTING_KEY = "admin_password_hash";

type RequestBody = {
  currentPassword?: unknown;
  newPassword?: unknown;
  confirmPassword?: unknown;
};

async function getActiveAdminPasswordHash() {
  try {
    const stored = await prisma.setting.findUnique({
      where: { key: PASSWORD_SETTING_KEY },
      select: { value: true },
    });
    return stored?.value ?? env.adminPasswordHash ?? null;
  } catch {
    return env.adminPasswordHash ?? null;
  }
}

function validateNewPassword(newPassword: string, confirmPassword: string) {
  if (newPassword.length < 8) {
    return "New password must be at least 8 characters.";
  }
  if (newPassword !== confirmPassword) {
    return "New password and confirmation do not match.";
  }
  return null;
}

export async function POST(request: Request) {
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

  const activeHash = await getActiveAdminPasswordHash();
  if (!activeHash) {
    return NextResponse.json(
      { error: "Admin password is not configured." },
      { status: 500 },
    );
  }

  const valid = await bcrypt.compare(currentPassword, activeHash);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const nextHash = await bcrypt.hash(newPassword, 10);

  try {
    await prisma.setting.upsert({
      where: { key: PASSWORD_SETTING_KEY },
      create: { key: PASSWORD_SETTING_KEY, value: nextHash },
      update: { value: nextHash },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not update password. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}


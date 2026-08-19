import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionVersion, issuePasswordResetNonce } from "@/lib/admin-password";
import { getSessionOptions, type SessionData } from "@/lib/session";

export type { SessionData } from "@/lib/session";
export { getSessionOptions } from "@/lib/session";

export const PASSWORD_RESET_TTL_MS = 5 * 60 * 1000;

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), getSessionOptions());
}

export async function isLoggedInSession(session: SessionData): Promise<boolean> {
  if (session.isLoggedIn !== true) {
    return false;
  }

  try {
    const version = await getSessionVersion();
    return session.sessionVersion === version;
  } catch {
    return false;
  }
}

export async function isAuthenticated() {
  const session = await getSession();
  return isLoggedInSession(session);
}

export function hasValidPasswordReset(session: SessionData): boolean {
  return (
    session.canSetPassword === true &&
    typeof session.passwordResetNonce === "string" &&
    session.passwordResetNonce.length > 0 &&
    typeof session.passwordResetExpiresAt === "number" &&
    Date.now() <= session.passwordResetExpiresAt
  );
}

export async function grantPasswordReset(session: SessionData) {
  session.isLoggedIn = false;
  session.sessionVersion = undefined;
  session.canSetPassword = true;
  session.passwordResetExpiresAt = Date.now() + PASSWORD_RESET_TTL_MS;
  session.passwordResetNonce = await issuePasswordResetNonce();
}

export function clearPasswordReset(session: SessionData) {
  session.canSetPassword = false;
  session.passwordResetExpiresAt = undefined;
  session.passwordResetNonce = undefined;
}

/** Defense-in-depth guard for admin API route handlers. */
export async function requireAuth(): Promise<NextResponse | null> {
  if (!(await isAuthenticated())) {
    return unauthorizedResponse();
  }
  return null;
}

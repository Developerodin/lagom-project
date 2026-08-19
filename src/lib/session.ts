import type { SessionOptions } from "iron-session";
import { env } from "@/lib/env";

export interface SessionData {
  isLoggedIn: boolean;
  sessionVersion?: number;
  canSetPassword?: boolean;
  passwordResetExpiresAt?: number;
  passwordResetNonce?: string;
}

const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export function getSessionOptions(): SessionOptions {
  return {
    password: env.sessionSecret,
    cookieName: "lagom_admin",
    cookieOptions: {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    },
  };
}

import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export interface SessionData {
  isLoggedIn: boolean;
}

const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export const sessionOptions: SessionOptions = {
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

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function isAuthenticated() {
  const session = await getSession();
  return session.isLoggedIn === true;
}

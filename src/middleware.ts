import { getIronSession } from "iron-session";
import { NextResponse, type NextRequest } from "next/server";
import { getSessionOptions, type SessionData } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  const sessionOptions = getSessionOptions();
  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions,
  );
  const isLoggedIn = session.isLoggedIn === true;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return response;
  }

  if (pathname === "/admin") {
    return response;
  }

  if (pathname.startsWith("/admin") && !isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};

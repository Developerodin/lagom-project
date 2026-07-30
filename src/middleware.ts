import { getIronSession } from "iron-session";
import { NextResponse, type NextRequest } from "next/server";
import { sessionOptions, type SessionData } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
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

  const isPublicAdminPage =
    pathname === "/admin" || pathname === "/admin/forgot-password";

  if (isPublicAdminPage) {
    if (isLoggedIn) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/clients";
      return NextResponse.redirect(url);
    }
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

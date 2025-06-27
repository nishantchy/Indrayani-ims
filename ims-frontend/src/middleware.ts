import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Allow root route and static files
  if (
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("auth");
  if (!authCookie) {
    // Not authenticated, redirect to root
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const authData = JSON.parse(authCookie.value);
    if (!authData.isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    const isExpired = Date.now() - authData.loginTime > authData.expiresIn;
    if (isExpired) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api|public).*)"],
};

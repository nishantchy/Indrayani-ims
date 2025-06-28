import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_KEY = "auth";
const EXPIRES_IN_MS = 24 * 60 * 60 * 1000; // 24 hours

export function middleware(request: NextRequest) {
  // Allow access to root page and static assets
  if (
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/favicon") ||
    request.nextUrl.pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // Check authentication cookie
  const authCookie = request.cookies.get(AUTH_COOKIE_KEY);

  if (!authCookie) {
    // No auth cookie, redirect to login
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const authData = JSON.parse(authCookie.value);
    const { isAuthenticated, loginTime, expiresIn } = authData;

    // Check if token is expired
    const isExpired = Date.now() - loginTime > expiresIn;

    if (!isAuthenticated || isExpired) {
      // Invalid or expired token, redirect to login
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete(AUTH_COOKIE_KEY);
      return response;
    }

    // Valid authentication, allow access
    return NextResponse.next();
  } catch (error) {
    // Invalid cookie format, redirect to login
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete(AUTH_COOKIE_KEY);
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - root page (/)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|$).*)",
  ],
};

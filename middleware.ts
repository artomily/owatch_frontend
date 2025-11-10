import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes and API routes
  const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/signup",
    "/terms",
    "/landing",
  ];

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  // Also skip for API routes and static files
  if (
    isPublicRoute ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/")
  ) {
    return NextResponse.next();
  }

  // For protected routes, we'll let the client-side handle the wallet check
  // Since middleware can't access localStorage, we'll redirect to login
  // and let the client-side logic handle the wallet authentication

  // Check if this is a dashboard route
  if (pathname.startsWith("/dashboard")) {
    // We'll let the useWalletRedirect hook handle the authentication check
    // This middleware will just pass through
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

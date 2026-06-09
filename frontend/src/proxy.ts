import { type NextRequest, NextResponse } from "next/server";

const publicRoutes = new Set([
  "/",
  "/auth",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/new-password",
  "/auth/select-type",
]);

function isPublicRoute(pathname: string) {
  return publicRoutes.has(pathname);
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasAccessToken = Boolean(request.cookies.get("accessToken")?.value);
  const hasRefreshToken = Boolean(request.cookies.get("refreshToken")?.value);
  const hasRecoverableSession = hasAccessToken || hasRefreshToken;

  if (!hasAccessToken && hasRefreshToken && !isPublicRoute(pathname)) {
    const refreshUrl = new URL("/api/auth/refresh", request.url);
    refreshUrl.searchParams.set("next", `${pathname}${search}`);

    return NextResponse.redirect(refreshUrl);
  }

  if (!hasRecoverableSession && !isPublicRoute(pathname)) {
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("mode", "login");
    loginUrl.searchParams.set("next", `${pathname}${search}`);

    return NextResponse.redirect(loginUrl);
  }

  if (hasRecoverableSession && isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|images).*)",
  ],
};

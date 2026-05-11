import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/unauthorized",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico") || pathname.includes("/api/public")) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some((publicPath) => pathname === publicPath || pathname.startsWith(publicPath))) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "dev-secret" });

  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && token.role !== "admin") {
    const unauthorizedUrl = req.nextUrl.clone();
    unauthorizedUrl.pathname = "/unauthorized";
    return NextResponse.redirect(unauthorizedUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/forgot-password",
    "/reset-password",
    "/admin/:path*",
    "/dashboard",
    "/vote/:path*",
    "/unauthorized",
    "/login",
    "/register",
    "/api/auth/:path*",
  ],
};

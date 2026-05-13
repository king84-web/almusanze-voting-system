import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const publicRoutes = [
  "/",
  "/login",
  "/admin/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check authentication for protected routes
  const session = await auth()

  if (!session) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

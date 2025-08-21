import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie");

  const token = cookieHeader
    ?.split(";")
    .find((cookie) => cookie.trim().startsWith("token="))
    ?.split("=")[1];

  const { pathname } = req.nextUrl;

  if (!token) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/:path*"],
};

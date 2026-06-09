import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("aa_token");
  const { pathname } = req.nextUrl;

  if (!token?.value) {
    if (pathname.startsWith("/home")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (token?.value) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/home", req.url));
    }

    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/home/:path*", "/post/:path*"],
};
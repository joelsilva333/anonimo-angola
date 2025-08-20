import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
	const cookieHeader = req.headers.get("cookie")
	const token = cookieHeader?.includes("cliente_hash=")

	const { pathname } = req.nextUrl

	if (!token && pathname.startsWith("/home")) {
		return NextResponse.redirect(new URL("/login", req.url))
	}

	if ((token && pathname === "/login") || (token && pathname === "/register")) {
		return NextResponse.redirect(new URL("/home", req.url))
	}

	if (!token && pathname === "/home") {
		return NextResponse.redirect(new URL("/login", req.url))
	}

	if (token && pathname === "/login") {
		return NextResponse.redirect(new URL("/home", req.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ["/login", "/register", "/home/:path*"],
}

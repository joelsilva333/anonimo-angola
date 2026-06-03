import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("aa_token");
  const { pathname } = req.nextUrl;

  // 1. Se NÃO houver token (Utilizador não autenticado / público)
  if (!token?.value) {
    // Tenta aceder à rota restrita /home ou qualquer sub-rota privada
    if (pathname.startsWith("/home")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 2. Se HOUVER token (Utilizador autenticado)
  if (token?.value) {
    // Tenta aceder às páginas de auth (Login / Registro) -> manda direto para a home protegida
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  }

  // Deixa prosseguir normalmente para as rotas públicas: "/", "/post/[postId]", etc.
  return NextResponse.next();
}

export const config = {
  /*
    Mapeamos apenas as rotas principais que o middleware deve intercetar,
    evitando que ele corra em imagens ou ficheiros do Next.js.
  */
  matcher: ["/", "/login", "/register", "/home/:path*", "/post/:path*"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  const { pathname } = request.nextUrl;

  // 🔒 Rotas protegidas (somente logado)
  const rotasProtegidas =
    pathname.startsWith("/dashboard") || pathname.startsWith("/pasta");

  if (rotasProtegidas && !session) {
    // se não tem sessão, manda pro login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/pasta/:path*"],
};

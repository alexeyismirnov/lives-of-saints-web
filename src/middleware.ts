import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected =
    path.startsWith("/edit") || path.startsWith("/api/entries");

  if (!isProtected) {
    return NextResponse.next();
  }

  let token = null;
  try {
    token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });
  } catch {
    token = null;
  }

  if (!token) {
    const login = new URL("/login/", request.url);
    login.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/edit/:path*", "/api/entries/:path*"],
};

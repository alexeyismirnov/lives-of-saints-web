import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { sanitizeAuthEnv } from "@/lib/auth-url";

sanitizeAuthEnv();

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const isProtected =
    path.startsWith("/edit") || path.startsWith("/api/entries");

  if (isProtected && !req.auth) {
    const login = new URL("/login/", req.nextUrl);
    login.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/edit/:path*", "/api/entries/:path*"],
};

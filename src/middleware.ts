import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname, search } = req.nextUrl;

  // Protected route checking
  const isProtected =
    pathname.startsWith("/akun") ||
    pathname.startsWith("/checkout/konfirmasi");

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/akun/:path*",
    "/checkout/konfirmasi/:path*",
  ],
};

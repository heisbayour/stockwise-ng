// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Redirect logged-in users away from auth pages
    const authPages = ["/login", "/register", "/verify", "/forgot-password"];
    if (token && authPages.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Protect admin routes - only ADMIN and SUPERUSER can access
    if (pathname.startsWith("/admin")) {
      if (!token || !["ADMIN", "SUPERUSER"].includes(token.role as string)) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Dashboard requires auth
        if (pathname.startsWith("/dashboard")) {
          return !!token;
        }

        // Admin requires auth (role check handled above)
        if (pathname.startsWith("/admin")) {
          return !!token;
        }

        // Auth pages are accessible to all (redirect handled above for logged-in)
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/verify",
    "/forgot-password",
  ],
};

import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Protected routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    if (!req.auth) {
      // Log for debugging (remove in production)
      if (process.env.NODE_ENV === "development") {
        console.log("[Middleware] No auth found, redirecting to sign-in", {
          pathname,
          hasAuth: !!req.auth,
        })
      }
      const signInUrl = new URL("/sign-in", req.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}


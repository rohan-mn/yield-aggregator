// middleware.ts
import { NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"

// Run updateSession on every request first (refreshes tokens / cookies)
export async function middleware(request: NextRequest) {
  // 1) Always let updateSession do its thing (it handles its own redirects)
  const response = await updateSession(request)

  // 2) Public paths we do NOT want to protect
  const { pathname } = request.nextUrl
  if (
    pathname.startsWith("/login")  || // your login page
    pathname.startsWith("/auth")   || // Supabase’s auth callbacks
    pathname.startsWith("/api")    || // your backend APIs
    pathname.startsWith("/_next")  || // Next.js internals
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml")
  ) {
    return response
  }

  // 3) Everything else stays protected by updateSession’s redirect logic
  return response
}

// Only run this middleware on non–static/auth/api/login routes
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static
     * - _next/image
     * - favicon.ico, sitemap.xml, robots.txt
     * - /api/**
     * - /auth/**
     * - /login
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api|auth|login).*)"
  ]
}

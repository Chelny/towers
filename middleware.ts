import { NextRequest, NextResponse } from "next/server"
import { betterFetch } from "@better-fetch/fetch"
import { PROTECTED_ROUTES, PUBLIC_ROUTES, ROUTE_GAMES, ROUTE_SIGN_IN } from "@/constants/routes"
import type { Session } from "better-auth/types"

export default async function middleware(request: NextRequest) {
  // Content Security Policy (CSP)
  const nonce: string = Buffer.from(crypto.randomUUID()).toString("base64")
  const cspHeader: string = `
    default-src "self";
    script-src "self" "nonce-${nonce}" "strict-dynamic";
    style-src "self" "nonce-${nonce}";
    img-src "self" blob: data:;
    font-src "self";
    object-src "none";
    base-uri "self";
    form-action "self";
    frame-ancestors "none";
    upgrade-insecure-requests;
  `

  const requestHeaders: Headers = new Headers(request.headers)
  requestHeaders.set("X-Nonce", nonce)
  requestHeaders.set("Content-Security-Policy", cspHeader.replace(/\s{2,}/g, " ").trim())

  const response: NextResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Allow access to reset password page only if there is a token parameter
  // if ([ROUTE_RESET_PASSWORD.PATH].includes(request.nextUrl.pathname)) {
  //   const url: NextURL = request.nextUrl.clone()
  //   const token: string | null = url.searchParams.get("token")
  //   const newUrl: URL = new URL(ROUTE_SIGN_IN.PATH, request.nextUrl.origin)
  //   if (!token) return NextResponse.redirect(newUrl)
  // }

  const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
    baseURL: request.nextUrl.origin,
    headers: {
      // Get the cookie from the request
      cookie: request.headers.get("cookie") || "",
    },
  })

  if (session) {
    if (PUBLIC_ROUTES.includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL(ROUTE_GAMES.PATH, request.nextUrl.origin))
    }
  } else {
    if (PROTECTED_ROUTES.includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL(ROUTE_SIGN_IN.PATH, request.nextUrl.origin))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt, manifest.webmanifest (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest).*)",
  ],
}

import { NextURL } from "next/dist/server/web/next-url"
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import {
  API_AUTH_PREFIX,
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
  ROUTE_RESET_PASSWORD,
  ROUTE_ROOMS,
  ROUTE_SIGN_IN,
  ROUTE_TOWERS
} from "@/constants"

const validateToken = async (token: string): Promise<boolean> => {
  const response: Response = await fetch(`${process.env.BASE_URL}/api/reset-password?token=${token}`)
  const data = await response.json()
  return data.valid
}

export default auth(async (request): Promise<NextResponse> => {
  // Content Security Policy (CSP)
  const isDevelopment: boolean = process.env.NODE_ENV === "development"
  const nonce: string = Buffer.from(crypto.randomUUID()).toString("base64")
  const cspHeader: string = `
    default-src 'self';
    script-src 'self' ${isDevelopment ? "'unsafe-eval' 'unsafe-inline'" : `'nonce-${nonce}' 'strict-dynamic'`};
    style-src 'self' ${isDevelopment ? "'unsafe-inline'" : `'nonce-${nonce}'`};
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${isDevelopment ? "" : "upgrade-insecure-requests"};
  `

  const requestHeaders: Headers = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)
  requestHeaders.set("Content-Security-Policy", cspHeader.replace(/\s{2,}/g, " ").trim())

  const response: NextResponse = NextResponse.next({
    headers: requestHeaders,
    request: {
      headers: requestHeaders
    }
  })

  // Allow next-auth paths
  if (request.nextUrl.pathname.startsWith(API_AUTH_PREFIX)) {
    return response
  }

  // Allow access to reset password page only if token is valid
  const url: NextURL = request.nextUrl.clone()
  const token: string | null = url.searchParams.get("token")

  if ([ROUTE_RESET_PASSWORD.PATH].includes(request.nextUrl.pathname)) {
    const newUrl: URL = new URL(ROUTE_SIGN_IN.PATH, request.nextUrl.origin)

    if (!token) return NextResponse.redirect(newUrl)

    const isTokenValid: boolean = await validateToken(token)

    if (!isTokenValid) {
      return NextResponse.redirect(newUrl)
    }
  }

  if (request.auth) {
    if (PUBLIC_ROUTES.includes(request.nextUrl.pathname)) {
      const newUrl: URL = new URL(ROUTE_ROOMS.PATH, request.nextUrl.origin)
      return NextResponse.redirect(newUrl)
    }
  } else {
    if (PROTECTED_ROUTES.includes(request.nextUrl.pathname)) {
      const newUrl: URL = new URL(ROUTE_SIGN_IN.PATH, request.nextUrl.origin)
      return NextResponse.redirect(newUrl)
    }
  }

  // Redirects "/towers" (no params) to "/rooms"
  if (request.nextUrl.pathname === ROUTE_TOWERS.PATH && request.nextUrl.search === "") {
    const newUrl: URL = new URL(ROUTE_ROOMS.PATH, request.nextUrl.origin)
    return NextResponse.redirect(newUrl)
  }

  return response
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" }
      ]
    }
  ]
}

import { NextURL } from "next/dist/server/web/next-url"
import { NextResponse, userAgent } from "next/server"
import axios, { AxiosResponse } from "axios"
import { auth } from "@/auth"
import {
  API_AUTH_PREFIX,
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
  ROUTE_GAMES,
  ROUTE_RESET_PASSWORD,
  ROUTE_SIGN_IN,
  ROUTE_TOWERS
} from "@/constants/routes"

const validateToken = async (token: string): Promise<boolean> => {
  const response: AxiosResponse<ApiResponse> = await axios.get(
    `${process.env.BASE_URL}/api/reset-password?token=${token}`
  )
  return response.data.success
}

export default auth(async (request): Promise<NextResponse> => {
  // Content Security Policy (CSP)
  const nonce: string = Buffer.from(crypto.randomUUID()).toString("base64")
  const cspHeader: string = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `

  const requestHeaders: Headers = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)
  requestHeaders.set("Content-Security-Policy", cspHeader.replace(/\s{2,}/g, " ").trim())

  const response: NextResponse = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  })

  // User agent
  const ipAddress: string = request.headers.get("x-forwarded-for") || request.ip || "[unknown]"
  const { ua } = userAgent(request)

  response.cookies.set("user-ip", ipAddress, { httpOnly: true })
  response.cookies.set("user-agent", ua, { httpOnly: true })

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
      const newUrl: URL = new URL(ROUTE_GAMES.PATH, request.nextUrl.origin)
      return NextResponse.redirect(newUrl)
    }
  } else {
    if (PROTECTED_ROUTES.includes(request.nextUrl.pathname)) {
      const newUrl: URL = new URL(ROUTE_SIGN_IN.PATH, request.nextUrl.origin)
      return NextResponse.redirect(newUrl)
    }
  }

  // Redirects "/games" to "/games/towers" // FIXME: Not working the second time
  if (request.nextUrl.pathname === ROUTE_GAMES.PATH) {
    const newUrl: URL = new URL(ROUTE_TOWERS.PATH, request.nextUrl.origin)
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

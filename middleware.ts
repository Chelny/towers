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

export default auth(async (request) => {
  if (request.nextUrl.pathname.startsWith(API_AUTH_PREFIX)) {
    return NextResponse.next()
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

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}

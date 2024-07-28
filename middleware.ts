import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { API_AUTH_PREFIX, PROTECTED_ROUTES, PUBLIC_ROUTES, ROUTE_ROOMS, ROUTE_SIGN_IN, ROUTE_TOWERS } from "@/constants"

export default auth((request) => {
  if (request.nextUrl.pathname.startsWith(API_AUTH_PREFIX)) {
    return NextResponse.next()
  }

  if (request.auth) {
    if (PUBLIC_ROUTES.includes(request.nextUrl.pathname)) {
      const newUrl: URL = new URL(ROUTE_ROOMS.PATH, request.nextUrl.origin)
      return Response.redirect(newUrl)
    }
  } else {
    if (PROTECTED_ROUTES.includes(request.nextUrl.pathname)) {
      const newUrl: URL = new URL(ROUTE_SIGN_IN.PATH, request.nextUrl.origin)
      return Response.redirect(newUrl)
    }
  }

  // Redirects "/towers" (no params) to "/rooms"
  if (request.nextUrl.pathname === ROUTE_TOWERS.PATH && request.nextUrl.search === "") {
    const newUrl: URL = new URL(ROUTE_ROOMS.PATH, request.nextUrl.origin)
    return Response.redirect(newUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}

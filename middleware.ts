import { NextRequest, NextResponse } from "next/server"
import { betterFetch } from "@better-fetch/fetch"
import Negotiator from "negotiator"
import { PROTECTED_ROUTES, PUBLIC_ROUTES, ROUTE_GAMES, ROUTE_SIGN_IN } from "@/constants/routes"
import { Session } from "@/lib/auth-client"
import { defaultLocale, Language, languages } from "@/translations/languages"

export default async function middleware(request: NextRequest) {
  const requestHeaders: Headers = new Headers(request.headers)

  // Fetch session
  const { data: session } = await fetchSession(request)

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
    connect-src 'self' https://www.google-analytics.com;
    ${process.env.NODE_ENV === "production" ? "upgrade-insecure-requests;" : ""}
  `

  const contentSecurityPolicyHeader: string = cspHeader.replace(/\s{2,}/g, " ").trim()

  requestHeaders.set("x-nonce", nonce)
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicyHeader)

  const response: NextResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  response.headers.set("Content-Security-Policy", contentSecurityPolicyHeader)

  // Localization
  const { origin, pathname } = request.nextUrl
  const userLocale: string | null | undefined = session?.user?.language || null
  const cookieLocale: string | undefined = request.cookies.get("locale")?.value
  const acceptLocale: string = getRequestLocale(request.headers)
  let locale: string = userLocale || cookieLocale || acceptLocale || defaultLocale

  const pathnameLocale: string = pathname.split("/")[1]
  const locales: string[] = languages.map((language: Language) => language.locale)
  const isValidLocale: boolean = locales.includes(pathnameLocale)

  if (!isValidLocale) {
    // Redirect if there is no locale
    request.nextUrl.pathname = `/${locale}${pathname}`
    // e.g. incoming request is /sign-in
    // The new URL is now /en/sign-in
    return NextResponse.redirect(request.nextUrl)
  }

  if (pathnameLocale !== cookieLocale) {
    // If the locale in the cookie doesn't match the pathname locale, update the cookie
    response.cookies.set("towers.locale", pathnameLocale, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // Cache for 30 days,
      secure: process.env.NODE_ENV === "production",
    })
  }

  // Page access
  if (session) {
    if (PUBLIC_ROUTES.includes(pathname)) {
      return NextResponse.redirect(new URL(ROUTE_GAMES.PATH, origin))
    }
  } else {
    if (PROTECTED_ROUTES.includes(pathname)) {
      return NextResponse.redirect(new URL(ROUTE_SIGN_IN.PATH, origin))
    }
  }

  return response
}

/**
 * Determine the locale from the "accept-language" header or fallback to the default locale.
 */
function getRequestLocale(headers: Headers): string {
  const acceptLanguage: string | undefined = headers.get("accept-language") || undefined
  const locales: string[] = languages.map((language: Language) => language.locale)
  const negotiator: Negotiator = new Negotiator({ headers: { "accept-language": acceptLanguage } })
  const preferredLanguages: string[] = negotiator.languages(locales.slice())
  return preferredLanguages[0] || locales[0] || defaultLocale
}

/**
 * Fetch session information using better-fetch.
 */
async function fetchSession(request: NextRequest): Promise<{ data: Session | null }> {
  try {
    const { origin } = request.nextUrl
    return betterFetch<Session>("/api/auth/get-session", {
      baseURL: origin,
      headers: { cookie: request.headers.get("cookie") || "" },
    })
  } catch (error) {
    console.error(`Failed to fetch session: ${error}`)
    return { data: null }
  }
}

export const config = {
  matcher: [
    {
      /*
       * Match all request paths except for the ones starting with:
       * - api (API routes)
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico, sitemap.xml, robots.txt, manifest.webmanifest (metadata files)
       * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
       */
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}

import { NextRequest, NextResponse } from "next/server"
import { getCookieCache } from "better-auth/cookies"
import Negotiator from "negotiator"
import { APP_COOKIES, COOKIE_PREFIX } from "@/constants/app"
import { PROTECTED_ROUTES, PUBLIC_ROUTES, ROUTE_GAMES, ROUTE_SIGN_IN } from "@/constants/routes"
import { Session } from "@/lib/auth"
import { defaultLocale, Language, languages } from "@/translations/languages"

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host: string | null = request.headers.get("host")
  const protocol: string = request.headers.get("x-forwarded-proto") || "http"
  const origin: string = `${protocol}://${host}`

  // Fetch session
  const session: Session | null = await getCookieCache(request, { cookiePrefix: COOKIE_PREFIX })

  // Localization
  const userLocale: string | null | undefined = session?.user?.language
  const cookieLocale: string | undefined = request.cookies.get(APP_COOKIES.LOCALE)?.value
  const acceptLocale: string = getAcceptLanguage(request.headers)
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

  // Access control
  if (session) {
    if (PUBLIC_ROUTES.includes(pathname)) {
      return NextResponse.redirect(new URL(ROUTE_GAMES.PATH, origin))
    }
  } else {
    if (PROTECTED_ROUTES.includes(pathname)) {
      return NextResponse.redirect(new URL(ROUTE_SIGN_IN.PATH, origin))
    }
  }

  // Content Security Policy (CSP)
  const nonce: string = Buffer.from(crypto.randomUUID()).toString("base64")
  const devCspHeader: string = `
    default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
    script-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
    style-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
    connect-src *;
    img-src * data: blob:;
    font-src * data:;
    object-src *;
    frame-ancestors *;
  `
  const prodCspHeader: string = `
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
    upgrade-insecure-requests;
  `
  const cspHeader: string = process.env.NODE_ENV === "production" ? prodCspHeader : devCspHeader
  const contentSecurityPolicyHeader: string = cspHeader.replace(/\s{2,}/g, " ").trim()

  const requestHeaders: Headers = new Headers(request.headers)
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicyHeader)
  requestHeaders.set("x-nonce", nonce)

  const response: NextResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  response.headers.set("Content-Security-Policy", contentSecurityPolicyHeader)

  // CORS
  response.headers.set("Access-Control-Allow-Credentials", "true")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

  const trustedOrigins: string[] = (process.env.TRUSTED_ORIGINS || "").split(",").map((origin) => origin.trim())

  if (origin && trustedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
  } else {
    response.headers.set("Access-Control-Allow-Origin", trustedOrigins[0] || "*")
  }

  if (pathname.startsWith("/api/")) {
    response.headers.set("Content-Type", "application/json")
  }

  // Sync locale cookie
  if (pathnameLocale !== cookieLocale) {
    // If the locale in the cookie doesn't match the pathname locale, update the cookie
    response.cookies.set(APP_COOKIES.LOCALE, pathnameLocale, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // Cache for 30 days
      secure: process.env.NODE_ENV === "production",
    })
  }

  return response
}

/**
 * Determine the locale from the "accept-language" header or fallback to the default locale.
 */
function getAcceptLanguage(headers: Headers): string {
  const acceptLanguage: string | undefined = headers.get("accept-language") || undefined
  const negotiator: Negotiator = new Negotiator({ headers: { "accept-language": acceptLanguage } })
  const locales: string[] = languages.map((language: Language) => language.locale)
  return negotiator.languages(locales.slice())[0]
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
       * - images (.svg, .png, .jpg, .jpeg, .gif, .webp)
       * - videos (.webm)
       */
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}

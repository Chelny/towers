import { NextRequest } from "next/server";
import Negotiator from "negotiator";
import { APP_COOKIE_KEYS } from "@/constants/app";
import { Session } from "@/lib/auth";
import linguiConfig from "@/lingui.config";
import { DEFAULT_LOCALE } from "@/translations/languages";

/**
 * Get the best locale for the user based on session, cookies, or accept-language.
 */
export function getCurrentLocale(request: NextRequest, session?: Session | null): string {
  const userLocale: string | null | undefined = session?.user?.language;
  const cookieLocale: string | undefined = request.cookies.get(APP_COOKIE_KEYS.LOCALE)?.value;
  const acceptLocale: string = getAcceptLanguage(request.headers);
  return userLocale || cookieLocale || acceptLocale || DEFAULT_LOCALE;
}

/**
 * Determine the locale from the "accept-language" header or fallback to the default locale.
 */
function getAcceptLanguage(headers: Headers): string {
  const acceptLanguage: string | undefined = headers.get("accept-language") || undefined;
  const negotiator: Negotiator = new Negotiator({ headers: { "accept-language": acceptLanguage } });
  return negotiator.languages(linguiConfig.locales)[0] || DEFAULT_LOCALE;
}

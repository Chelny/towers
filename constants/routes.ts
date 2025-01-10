import { msg } from "@lingui/core/macro"

export const ROUTE_HOME = { TITLE: msg`Home`, PATH: "/" }
export const ROUTE_SIGN_UP = { TITLE: msg`Sign Up`, PATH: "/sign-up" }
export const ROUTE_NEW_USER = { TITLE: msg`Complete Your Profile`, PATH: "/new-user" }
export const ROUTE_FORGOT_PASSWORD = { TITLE: msg`Forgot Password`, PATH: "/forgot-password" }
export const ROUTE_RESET_PASSWORD = { TITLE: msg`Reset Password`, PATH: "/reset-password" }
export const ROUTE_SIGN_IN = { TITLE: msg`Sign In`, PATH: "/sign-in" }
export const ROUTE_SIGN_IN_WITH_MAGIC_LINK = { TITLE: msg`Sign In with Magic Link`, PATH: "/sign-in-with-magic-link" }
export const ROUTE_ACCOUNT = { TITLE: msg`Account`, PATH: "/account" }
export const ROUTE_PROFILE = { TITLE: msg`Profile`, PATH: `${ROUTE_ACCOUNT.PATH}/profile` }
export const ROUTE_SETTINGS = { TITLE: msg`Settings`, PATH: `${ROUTE_ACCOUNT.PATH}/settings` }
export const ROUTE_DELETE_ACCOUNT = { TITLE: msg`Delete Account`, PATH: `${ROUTE_ACCOUNT.PATH}/delete` }
export const ROUTE_GAMES = { TITLE: msg`Games`, PATH: "/games" }
export const ROUTE_TOWERS = { TITLE: msg`Towers Rooms`, PATH: `${ROUTE_GAMES.PATH}/towers` }
export const ROUTE_ERROR = { TITLE: msg`Error`, PATH: "/error" }
export const ROUTE_TERMS_OF_SERVICE = { TITLE: msg`Terms of Service`, PATH: "/terms-of-service" }
export const ROUTE_PRIVACY_POLICY = { TITLE: msg`Privacy Policy`, PATH: "/privacy-policy" }

export const ROUTES = [
  ROUTE_HOME,
  ROUTE_SIGN_UP,
  ROUTE_NEW_USER,
  ROUTE_FORGOT_PASSWORD,
  ROUTE_RESET_PASSWORD,
  ROUTE_SIGN_IN,
  ROUTE_SIGN_IN_WITH_MAGIC_LINK,
  ROUTE_ACCOUNT,
  ROUTE_PROFILE,
  ROUTE_SETTINGS,
  ROUTE_DELETE_ACCOUNT,
  ROUTE_GAMES,
  ROUTE_TOWERS,
  ROUTE_ERROR,
  ROUTE_TERMS_OF_SERVICE,
  ROUTE_PRIVACY_POLICY,
]

export const PUBLIC_ROUTES = [
  ROUTE_SIGN_UP.PATH,
  ROUTE_FORGOT_PASSWORD.PATH,
  ROUTE_RESET_PASSWORD.PATH,
  ROUTE_SIGN_IN.PATH,
  ROUTE_SIGN_IN_WITH_MAGIC_LINK.PATH,
]

export const PROTECTED_ROUTES = [
  ROUTE_NEW_USER.PATH,
  ROUTE_ACCOUNT.PATH,
  ROUTE_PROFILE.PATH,
  ROUTE_SETTINGS.PATH,
  ROUTE_DELETE_ACCOUNT.PATH,
  ROUTE_GAMES.PATH,
  ROUTE_TOWERS.PATH,
]

export const NEW_USER_CALLBACK_URL = ROUTE_NEW_USER.PATH
export const CALLBACK_URL = ROUTE_GAMES.PATH
export const ERROR_CALLBACK_URL = ROUTE_ERROR.PATH

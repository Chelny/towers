export const ROUTE_HOME = { TITLE: "Home", PATH: "/" }
export const ROUTE_SIGN_UP = { TITLE: "Sign Up", PATH: "/sign-up" }
export const ROUTE_VERIFY_EMAIL = { TITLE: "Verify Email", PATH: "/verify-email" }
export const ROUTE_FORGOT_PASSWORD = { TITLE: "Forgot Password", PATH: "/forgot-password" }
export const ROUTE_RESET_PASSWORD = { TITLE: "Reset Password", PATH: "/reset-password" }
export const ROUTE_SIGN_IN = { TITLE: "Sign In", PATH: "/sign-in" }
export const ROUTE_SIGN_IN_WITH_MAGIC_LINK = { TITLE: "Sign In With Email", PATH: "/sign-in-with-magic-link" }
export const ROUTE_AUTH_ERROR = { TITLE: "Error", PATH: "/error" }
export const ROUTE_ACCOUNT = { TITLE: "Account", PATH: "/account" }
export const ROUTE_PROFILE = { TITLE: "Profile", PATH: `${ROUTE_ACCOUNT.PATH}/profile` }
export const ROUTE_UPDATE_EMAIL = { TITLE: "Update Email", PATH: "/update-email" }
export const ROUTE_UPDATE_PASSWORD = { TITLE: "Update Password", PATH: `${ROUTE_ACCOUNT.PATH}/update-password` }
export const ROUTE_ROOMS = { TITLE: "Rooms", PATH: "/rooms" }
export const ROUTE_TOWERS = { TITLE: "Towers", PATH: "/towers" }

export const API_AUTH_PREFIX = "/api/auth"

export const PUBLIC_ROUTES = [
  ROUTE_HOME.PATH,
  ROUTE_SIGN_UP.PATH,
  ROUTE_VERIFY_EMAIL.PATH,
  ROUTE_FORGOT_PASSWORD.PATH,
  ROUTE_RESET_PASSWORD.PATH,
  ROUTE_SIGN_IN.PATH,
  ROUTE_SIGN_IN_WITH_MAGIC_LINK.PATH,
  ROUTE_AUTH_ERROR.PATH
]

export const PROTECTED_ROUTES = [
  ROUTE_HOME.PATH,
  ROUTE_ACCOUNT.PATH,
  ROUTE_PROFILE.PATH,
  ROUTE_UPDATE_PASSWORD.PATH,
  ROUTE_ROOMS.PATH,
  ROUTE_TOWERS.PATH
]

export const SIGN_IN_REDIRECT = ROUTE_ROOMS.PATH

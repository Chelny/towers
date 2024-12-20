export const ROUTE_HOME = { TITLE: "Home", PATH: "/" }
export const ROUTE_SIGN_UP = { TITLE: "Sign Up", PATH: "/sign-up" }
export const ROUTE_NEW_USER = { TITLE: "Complete Your Profile", PATH: "/new-user" }
export const ROUTE_FORGOT_PASSWORD = { TITLE: "Forgot Password", PATH: "/forgot-password" }
export const ROUTE_RESET_PASSWORD = { TITLE: "Reset Password", PATH: "/reset-password" }
export const ROUTE_SIGN_IN = { TITLE: "Sign In", PATH: "/sign-in" }
export const ROUTE_SIGN_IN_WITH_MAGIC_LINK = { TITLE: "Sign In with Magic Link", PATH: "/sign-in-with-magic-link" }
export const ROUTE_ACCOUNT = { TITLE: "Account", PATH: "/account" }
export const ROUTE_PROFILE = { TITLE: "Profile", PATH: `${ROUTE_ACCOUNT.PATH}/profile` }
export const ROUTE_DELETE_ACCOUNT = { TITLE: "Delete Account", PATH: `${ROUTE_ACCOUNT.PATH}/delete` }
export const ROUTE_GAMES = { TITLE: "Games", PATH: "/games" }
export const ROUTE_TOWERS = { TITLE: "Towers Rooms", PATH: `${ROUTE_GAMES.PATH}/towers` }
export const ROUTE_ERROR = { TITLE: "Error", PATH: "/error" }

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
  ROUTE_DELETE_ACCOUNT.PATH,
  ROUTE_GAMES.PATH,
  ROUTE_TOWERS.PATH,
]

export const REDIRECT_URI = ROUTE_GAMES.PATH
export const ERROR_REDIRECT_URI = ROUTE_ERROR.PATH

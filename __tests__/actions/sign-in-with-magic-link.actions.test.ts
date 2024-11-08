import { AuthError } from "next-auth"
import { Mock } from "vitest"
import { signInWithMagicLink } from "@/app/(auth)/sign-in-with-magic-link/sign-in-with-magic-link.actions"
import { signIn as authSignInWithMagicLink } from "@/auth"
import { ROUTE_GAMES } from "@/constants/routes"
import { mockFormInitialState } from "@/vitest.setup"

vi.mock("resend", () => {
  return {
    Resend: vi.fn().mockImplementation(() => {
      return {
        sendEmail: vi.fn().mockResolvedValue({ success: true }),
      }
    }),
  }
})

vi.mock("@/auth")

describe("Sign In with Magic Link Actions", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return errors if payload is incomplete", async () => {
    const formData: FormData = new FormData()
    formData.append("email", "")

    const result = await signInWithMagicLink(mockFormInitialState, formData)

    expect(result).toEqual({
      success: false,
      error: {
        email: "The email is invalid.",
      },
    })
  })

  it("should return errors if required fields are invalid", async () => {
    const formData: FormData = new FormData()
    formData.append("email", "john.doe.com")

    const result = await signInWithMagicLink(mockFormInitialState, formData)

    expect(result).toEqual({
      success: false,
      error: {
        email: "The email is invalid.",
      },
    })
  })

  it("should handle authentication errors correctly", async () => {
    const formData: FormData = new FormData()
    formData.append("email", "john.doe@example.com")

    const authError = new AuthError("The email or the password is invalid.", { type: "CredentialsSignin" })
    const response = {
      success: false,
      message: authError.cause?.err?.message,
    }
    ;(authSignInWithMagicLink as Mock).mockRejectedValueOnce(authError)

    const result = await signInWithMagicLink(mockFormInitialState, formData)

    expect(authSignInWithMagicLink).toHaveBeenCalledWith("resend", {
      email: "john.doe@example.com",
      redirectTo: ROUTE_GAMES.PATH,
    })
    expect(result).toEqual(response)
  })

  it("should call authSignInWithMagicLink and return success when payload is valid", async () => {
    const formData: FormData = new FormData()
    formData.append("email", "john.doe@example.com")
    ;(authSignInWithMagicLink as Mock).mockResolvedValueOnce({})

    const result = await signInWithMagicLink(mockFormInitialState, formData)

    expect(authSignInWithMagicLink).toHaveBeenCalledWith("resend", {
      email: "john.doe@example.com",
      redirectTo: ROUTE_GAMES.PATH,
    })
    expect(result).toEqual({
      success: true,
      message: "You’re successfully signed in. Welcome back!",
    })
  })
})

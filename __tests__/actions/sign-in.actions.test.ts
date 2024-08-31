import { AuthError } from "next-auth"
import { Mock } from "vitest"
import { signIn } from "@/app/(auth)/sign-in/sign-in.actions"
import { signIn as authSignIn } from "@/auth"
import { ROUTE_ROOMS } from "@/constants"

vi.mock("@/auth", () => ({
  signIn: vi.fn()
}))

describe("Sign In Form Actions", () => {
  it("should return errors if payload is incomplete", async () => {
    const formData = new FormData()
    formData.append("email", "")
    formData.append("password", "")

    const result = await signIn({}, formData)

    expect(result).toEqual({
      success: false,
      message: "The email or the password is invalid.",
      errors: {
        email: "The email is invalid.",
        password: "The password is invalid."
      }
    })
  })

  it("should handle authentication errors correctly", async () => {
    const formData = new FormData()
    formData.append("email", "john.doe@example.com")
    formData.append("password", "wrongpassword")

    const authError = new AuthError("The email or the password is invalid.", { type: "CredentialsSignin" })
    const response = {
      success: false,
      message: authError.cause?.err?.message
    }
    ;(authSignIn as Mock).mockRejectedValueOnce(authError)

    const result = await signIn({}, formData)

    expect(authSignIn).toHaveBeenCalledOnce()
    expect(authSignIn).toHaveBeenCalledWith("credentials", {
      email: "john.doe@example.com",
      password: "wrongpassword",
      redirectTo: ROUTE_ROOMS.PATH
    })
    expect(result).toEqual(response)
  })

  it("should call authSignIn and return success when payload is valid", async () => {
    const formData = new FormData()
    formData.append("email", "john.doe@example.com")
    formData.append("password", "Password123!")

    ;(authSignIn as Mock).mockResolvedValueOnce({})

    const result = await signIn({}, formData)

    expect(authSignIn).toHaveBeenCalledOnce()
    expect(authSignIn).toHaveBeenCalledWith("credentials", {
      email: "john.doe@example.com",
      password: "Password123!",
      redirectTo: ROUTE_ROOMS.PATH
    })
    expect(result).toEqual({
      success: true,
      message: "You’re successfully signed in. Welcome back!"
    })
  })
})

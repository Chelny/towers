import { Mock } from "vitest"
import { resetPassword } from "@/app/(auth)/reset-password/reset-password.actions"
import { PATCH } from "@/app/api/reset-password/route"
import { mockedFormInitialState } from "@/vitest.setup"

vi.mock("@/app/api/reset-password/route", () => ({
  PATCH: vi.fn()
}))

describe("Reset Password Actions", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return errors if required fields are empty", async () => {
    const formData = new FormData()
    formData.append("token", "")
    formData.append("password", "")
    formData.append("confirmPassword", "")

    const response = {
      success: false,
      error: {
        token: "The token is missing or invalid.",
        password: "The password is invalid.",
        confirmPassword: "The password confirmation is invalid."
      }
    }

    ;(PATCH as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await resetPassword(mockedFormInitialState, formData)

    expect(PATCH).not.toHaveBeenCalled()
    expect(result).toEqual(response)
  })

  it("should return errors if required fields are invalid", async () => {
    const formData = new FormData()
    formData.append("token", "d457775d-9123-4922-84de-cf535a63484e")
    formData.append("password", "Password")
    formData.append("confirmPassword", "Password")

    const response = {
      success: false,
      error: {
        password: "The password is invalid.",
        confirmPassword: "The password confirmation is invalid."
      }
    }

    ;(PATCH as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await resetPassword(mockedFormInitialState, formData)

    expect(PATCH).not.toHaveBeenCalled()
    expect(result).toEqual(response)
  })

  it("should return error if passwords do not match", async () => {
    const formData = new FormData()
    formData.append("token", "d457775d-9123-4922-84de-cf535a63484e")
    formData.append("password", "Password123!")
    formData.append("confirmPassword", "Password12345!")

    const response = {
      success: false,
      error: {
        confirmPassword: "The password and password confirmation do not match."
      }
    }

    ;(PATCH as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await resetPassword(mockedFormInitialState, formData)

    expect(PATCH).not.toHaveBeenCalled()
    expect(result).toEqual(response)
  })

  it("should call PATCH and return success if the payload is valid", async () => {
    const formData = new FormData()
    formData.append("token", "d457775d-9123-4922-84de-cf535a63484e")
    formData.append("password", "Password123!")
    formData.append("confirmPassword", "Password123!")

    const response = {
      success: true,
      message: "Your password has been reset."
    }

    ;(PATCH as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await resetPassword(mockedFormInitialState, formData)

    expect(PATCH).toHaveBeenCalledWith({
      token: "d457775d-9123-4922-84de-cf535a63484e",
      password: "Password123!",
      confirmPassword: "Password123!"
    })
    expect(result).toEqual(response)
  })
})

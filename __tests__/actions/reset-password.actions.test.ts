import { Mock } from "vitest"
import { resetPassword } from "@/app/(auth)/reset-password/reset-password.actions"
import { ResetPasswordFormValidationErrors } from "@/app/(auth)/reset-password/reset-password.schema"
import { mockFormInitialState } from "@/vitest.setup"

describe("Reset Password Actions", () => {
  let mockFetch: Mock

  beforeEach(() => {
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return errors if required fields are empty", async () => {
    const formData: FormData = new FormData()
    formData.append("token", "")
    formData.append("password", "")
    formData.append("confirmPassword", "")

    const error: ResetPasswordFormValidationErrors = {
      token: "The token is missing or invalid.",
      password: "The password is invalid.",
      confirmPassword: "The password confirmation is invalid.",
    }

    const result: ApiResponse = await resetPassword(mockFormInitialState, formData)

    expect(mockFetch).not.toHaveBeenCalled()
    expect(result).toEqual({
      success: false,
      error,
    })
  })

  it("should return errors if required fields are invalid", async () => {
    const formData: FormData = new FormData()
    formData.append("token", "d457775d-9123-4922-84de-cf535a63484e")
    formData.append("password", "Password")
    formData.append("confirmPassword", "Password")

    const error: ResetPasswordFormValidationErrors = {
      password: "The password is invalid.",
      confirmPassword: "The password confirmation is invalid.",
    }

    const result: ApiResponse = await resetPassword(mockFormInitialState, formData)

    expect(mockFetch).not.toHaveBeenCalled()
    expect(result).toEqual({
      success: false,
      error,
    })
  })

  it("should return error if passwords do not match", async () => {
    const formData: FormData = new FormData()
    formData.append("token", "d457775d-9123-4922-84de-cf535a63484e")
    formData.append("password", "Password123!")
    formData.append("confirmPassword", "Password12345!")

    const error: ResetPasswordFormValidationErrors = {
      confirmPassword: "The password and password confirmation do not match.",
    }

    const result: ApiResponse = await resetPassword(mockFormInitialState, formData)

    expect(mockFetch).not.toHaveBeenCalled()
    expect(result).toEqual({
      success: false,
      error,
    })
  })

  it("should call PATCH and return success if the payload is valid", async () => {
    const formData: FormData = new FormData()
    formData.append("token", "d457775d-9123-4922-84de-cf535a63484e")
    formData.append("password", "Password123!")
    formData.append("confirmPassword", "Password123!")

    const mockResponse = {
      success: true,
      message: "Your password has been reset.",
    }

    mockFetch.mockResolvedValueOnce({ json: async () => mockResponse })

    const result: ApiResponse = await resetPassword(mockFormInitialState, formData)

    expect(mockFetch).toHaveBeenCalledWith(`${process.env.BASE_URL}/api/reset-password`, {
      method: "PATCH",
      body: JSON.stringify({
        token: "d457775d-9123-4922-84de-cf535a63484e",
        password: "Password123!",
        confirmPassword: "Password123!",
      }),
    })

    expect(result).toEqual(mockResponse)
  })
})

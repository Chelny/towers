import { cookies } from "next/headers"
import { Mock } from "vitest"
import { password } from "@/app/(protected)/account/update-password/update-password.actions"
import { UpdatePasswordFormValidationErrors } from "@/app/(protected)/account/update-password/update-password.schema"
import { mockFormInitialState } from "@/vitest.setup"

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

describe("Update Password Actions", () => {
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
    formData.append("currentPassword", "")
    formData.append("newPassword", "")
    formData.append("confirmNewPassword", "")

    const error: UpdatePasswordFormValidationErrors = {
      currentPassword: "The current password is invalid.",
      newPassword: "The new password is invalid.",
      confirmNewPassword: "The new password confirmation is invalid.",
    }

    const result: ApiResponse = await password(mockFormInitialState, formData)

    expect(mockFetch).not.toHaveBeenCalled()
    expect(result).toEqual({
      success: false,
      error,
    })
  })

  it("should return errors if fields are invalid", async () => {
    const formData: FormData = new FormData()
    formData.append("currentPassword", "pass")
    formData.append("newPassword", "password")
    formData.append("confirmNewPassword", "password")

    const error: UpdatePasswordFormValidationErrors = {
      currentPassword: "The current password is invalid.",
      newPassword: "The new password is invalid.",
      confirmNewPassword: "The new password confirmation is invalid.",
    }

    const result: ApiResponse = await password(mockFormInitialState, formData)

    expect(mockFetch).not.toHaveBeenCalled()
    expect(result).toEqual({
      success: false,
      error,
    })
  })

  it("should return success if payload is valid", async () => {
    ;(cookies as Mock).mockReturnValue({
      get: vi.fn((name) => {
        if (name === "authjs.session-token") {
          return { name: "authjs.session-token", value: "valid-token" }
        }
        return null
      }),
    })

    const formData: FormData = new FormData()
    formData.append("currentPassword", "Password123!")
    formData.append("newPassword", "Password12345!")
    formData.append("confirmNewPassword", "Password12345!")

    const mockResponse = {
      success: true,
      message: "The password has been updated!",
    }

    mockFetch.mockResolvedValueOnce({ json: async () => mockResponse })

    const result: ApiResponse = await password(mockFormInitialState, formData)

    expect(mockFetch).toHaveBeenCalledWith(`${process.env.BASE_URL}/api/account/password`, {
      method: "PATCH",
      headers: {
        Cookie: "authjs.session-token=valid-token",
      },
      body: JSON.stringify({
        currentPassword: "Password123!",
        newPassword: "Password12345!",
        confirmNewPassword: "Password12345!",
      }),
    })

    expect(result).toEqual(mockResponse)
  })
})

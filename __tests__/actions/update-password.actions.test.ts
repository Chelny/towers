import { Mock } from "vitest"
import { password } from "@/app/(protected)/account/update-password/update-password.actions"
import { PATCH } from "@/app/api/account/password/route"
import { mockedFormInitialState } from "@/vitest.setup"

vi.mock("@/app/api/account/password/route", () => ({
  PATCH: vi.fn()
}))

describe("Update Password Actions", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return errors if required fields are empty", async () => {
    const formData = new FormData()
    formData.append("currentPassword", "")
    formData.append("newPassword", "")
    formData.append("confirmNewPassword", "")

    const response = {
      success: false,
      error: {
        currentPassword: "The current password is invalid.",
        newPassword: "The new password is invalid.",
        confirmNewPassword: "The new password confirmation is invalid."
      }
    }

    ;(PATCH as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await password(mockedFormInitialState, formData)

    expect(PATCH).not.toHaveBeenCalled()
    expect(result).toEqual(response)
  })

  it("should return errors if fields are invalid", async () => {
    const formData = new FormData()
    formData.append("currentPassword", "pass")
    formData.append("newPassword", "password")
    formData.append("confirmNewPassword", "password")

    const response = {
      success: false,
      error: {
        currentPassword: "The current password is invalid.",
        newPassword: "The new password is invalid.",
        confirmNewPassword: "The new password confirmation is invalid."
      }
    }

    ;(PATCH as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await password(mockedFormInitialState, formData)

    expect(PATCH).not.toHaveBeenCalled()
    expect(result).toEqual(response)
  })

  it("should return success if payload is valid", async () => {
    const formData = new FormData()
    formData.append("currentPassword", "Password123!")
    formData.append("newPassword", "Password12345!")
    formData.append("confirmNewPassword", "Password12345!")

    const response = {
      success: true,
      message: "The password has been updated!"
    }

    ;(PATCH as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await password(mockedFormInitialState, formData)

    expect(PATCH).toHaveBeenCalledWith({
      currentPassword: "Password123!",
      newPassword: "Password12345!",
      confirmNewPassword: "Password12345!"
    })
    expect(result).toEqual(response)
  })
})

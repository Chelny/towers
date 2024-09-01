import { Mock } from "vitest"
import { resetPassword } from "@/app/(auth)/reset-password/reset-password.actions"
import { POST } from "@/app/api/reset-password/route"

vi.mock("@/app/api/reset-password/route", () => ({
  POST: vi.fn()
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
      errors: {
        token: "The token is missing or invalid.",
        password: "The password is invalid.",
        confirmPassword: "The password confirmation is invalid."
      }
    }

    ;(POST as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await resetPassword({}, formData)

    expect(POST).not.toHaveBeenCalled()
    expect(result).toEqual(response)
  })

  it("should return errors if required fields are invalid", async () => {
    const formData = new FormData()
    formData.append("token", "d457775d-9123-4922-84de-cf535a63484e")
    formData.append("password", "Password")
    formData.append("confirmPassword", "Password")

    const response = {
      success: false,
      errors: {
        password: "The password is invalid.",
        confirmPassword: "The password confirmation is invalid."
      }
    }

    ;(POST as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await resetPassword({}, formData)

    expect(POST).not.toHaveBeenCalled()
    expect(result).toEqual(response)
  })

  it("should return error if passwords do not match", async () => {
    const formData = new FormData()
    formData.append("token", "d457775d-9123-4922-84de-cf535a63484e")
    formData.append("password", "Password123!")
    formData.append("confirmPassword", "Password12345!")

    const response = {
      success: false,
      errors: {
        confirmPassword: "The password and password confirmation do not match."
      }
    }

    ;(POST as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await resetPassword({}, formData)

    expect(POST).not.toHaveBeenCalled()
    expect(result).toEqual(response)
  })

  it("should call POST and return success if the payload is valid", async () => {
    const formData = new FormData()
    formData.append("token", "d457775d-9123-4922-84de-cf535a63484e")
    formData.append("password", "Password123!")
    formData.append("confirmPassword", "Password123!")

    const response = {
      success: true,
      message: "Your password has been reset."
    }

    ;(POST as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await resetPassword({}, formData)

    expect(POST).toHaveBeenCalledOnce()
    expect(POST).toHaveBeenCalledWith({
      token: "d457775d-9123-4922-84de-cf535a63484e",
      password: "Password123!",
      confirmPassword: "Password123!"
    })
    expect(result).toEqual(response)
  })
})

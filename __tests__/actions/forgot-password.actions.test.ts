import { Mock } from "vitest"
import { forgotPassword } from "@/app/(auth)/forgot-password/forgot-password.actions"
import { POST } from "@/app/api/forgot-password/route"

vi.mock("@/app/api/forgot-password/route", () => ({
  POST: vi.fn()
}))

describe("Forgot Password Actions", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return errors if required fields are empty", async () => {
    const formData = new FormData()
    formData.append("email", "")

    const response = {
      success: false,
      errors: {
        email: "The email is required."
      }
    }

    ;(POST as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await forgotPassword({}, formData)

    expect(POST).not.toHaveBeenCalled()
    expect(result).toEqual(response)
  })

  it("should return errors if required fields are invalid", async () => {
    const formData = new FormData()
    formData.append("email", "@example.com")

    const response = {
      success: false,
      errors: {
        email: "The email is required."
      }
    }

    ;(POST as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await forgotPassword({}, formData)

    expect(POST).not.toHaveBeenCalled()
    expect(result).toEqual(response)
  })

  it("should call POST and return success if the payload is valid", async () => {
    const formData = new FormData()
    formData.append("email", "john.doe@example.com")

    const response = {
      success: true,
      message: "A reset password link has been sent in your inbox!"
    }

    ;(POST as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await forgotPassword({}, formData)

    expect(POST).toHaveBeenCalledWith({
      email: "john.doe@example.com"
    })
    expect(result).toEqual(response)
  })
})

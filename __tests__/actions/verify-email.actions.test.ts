import { Mock } from "vitest"
import { verifyEmail } from "@/app/(auth)/verify-email/verify-email.actions"
import { POST } from "@/app/api/verify-email/route"

vi.mock("@/app/api/verify-email/route", () => ({
  POST: vi.fn()
}))

describe("Verify Email Actions", () => {
  it("should return errors if payload is incomplete", async () => {
    const formData = new FormData()
    formData.append("email", "")
    formData.append("token", "")

    const response = {
      success: false,
      message: "The verification link is invalid.",
      errors: {
        email: "The email is missing.",
        token: "The token is missing or invalid."
      }
    }

    ;(POST as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await verifyEmail({}, formData)

    expect(POST).not.toHaveBeenCalled()
    expect(result).toEqual(response)
  })

  it("should call POST and return success when payload is valid", async () => {
    const formData = new FormData()
    formData.append("email", "john.doe@example.com")
    formData.append("token", "2d9d7b17-98a6-463c-9531-4de8e8a0e3c8")

    const response = { success: true, message: "The email has been verified!" }

    ;(POST as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await verifyEmail({}, formData)

    expect(POST).toHaveBeenCalledOnce()
    expect(POST).toHaveBeenCalledWith({
      email: "john.doe@example.com",
      token: "2d9d7b17-98a6-463c-9531-4de8e8a0e3c8"
    })
    expect(result).toEqual(response)
  })
})

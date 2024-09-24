import { Mock } from "vitest"
import { verifyEmail } from "@/app/(auth)/verify-email/verify-email.actions"
import { PATCH } from "@/app/api/verify-email/route"

vi.mock("@/app/api/verify-email/route", () => ({
  PATCH: vi.fn()
}))

describe("Verify Email Actions", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return errors if payload is incomplete", async () => {
    const formData = new FormData()
    formData.append("email", "")
    formData.append("token", "")

    const response = {
      success: false,
      message: "The verification link is invalid.",
      error: {
        email: "The email is missing.",
        token: "The token is missing or invalid."
      }
    }

    ;(PATCH as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await verifyEmail({}, formData)

    expect(PATCH).not.toHaveBeenCalled()
    expect(result).toEqual(response)
  })

  it("should call PATCH and return success when payload is valid", async () => {
    const formData = new FormData()
    formData.append("email", "john.doe@example.com")
    formData.append("token", "2d9d7b17-98a6-463c-9531-4de8e8a0e3c8")

    const response = { success: true, message: "The email has been verified!" }

    ;(PATCH as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await verifyEmail({}, formData)

    expect(PATCH).toHaveBeenCalledWith({
      email: "john.doe@example.com",
      token: "2d9d7b17-98a6-463c-9531-4de8e8a0e3c8"
    })
    expect(result).toEqual(response)
  })
})

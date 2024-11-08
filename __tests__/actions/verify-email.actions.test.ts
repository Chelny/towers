import { Mock } from "vitest"
import { verifyEmail } from "@/app/(auth)/verify-email/verify-email.actions"
import { VerifyEmailFormValidationErrors } from "@/app/(auth)/verify-email/verify-email.schema"
import { mockFormInitialState } from "@/vitest.setup"

describe("Verify Email Actions", () => {
  let mockFetch: Mock

  beforeEach(() => {
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return errors if payload is incomplete", async () => {
    const formData: FormData = new FormData()
    formData.append("token", "")

    const error: VerifyEmailFormValidationErrors = {
      token: "The token is missing or invalid.",
    }

    const result: ApiResponse = await verifyEmail(mockFormInitialState, formData)

    expect(mockFetch).not.toHaveBeenCalled()
    expect(result).toEqual({
      success: false,
      message: "The verification link is invalid.",
      error,
    })
  })

  it("should call PATCH and return success when payload is valid", async () => {
    const formData: FormData = new FormData()
    formData.append("token", "YjY1ZWYwYzEtYWU2My00YWIwLTljZmQtMzcxYjdiY2UwODRifGNoZWxueTFAZXhhbXBsZS5kZXY=")

    const mockResponse = {
      success: true,
      message: "The email has been verified!",
    }

    mockFetch.mockResolvedValueOnce({ json: async () => mockResponse })

    const result: ApiResponse = await verifyEmail(mockFormInitialState, formData)

    expect(mockFetch).toHaveBeenCalledWith(`${process.env.BASE_URL}/api/verify-email`, {
      method: "PATCH",
      body: JSON.stringify({
        token: "YjY1ZWYwYzEtYWU2My00YWIwLTljZmQtMzcxYjdiY2UwODRifGNoZWxueTFAZXhhbXBsZS5kZXY=",
      }),
    })

    expect(result).toEqual(mockResponse)
  })
})

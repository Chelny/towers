import { cookies } from "next/headers"
import { Mock } from "vitest"
import { cancelAccount } from "@/app/(protected)/account/cancel/cancel.actions"
import { CancelAccountFormValidationErrors } from "@/app/(protected)/account/cancel/cancel.schema"
import { mockFormInitialState } from "@/vitest.setup"

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

describe("Cancel Account Actions", () => {
  let mockFetch: Mock

  beforeEach(() => {
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return errors if the email field is empty", async () => {
    const formData: FormData = new FormData()
    formData.append("email", "")

    const error: CancelAccountFormValidationErrors = {
      email: "The email is invalid.",
    }

    const result: ApiResponse = await cancelAccount(mockFormInitialState, formData)

    expect(mockFetch).not.toHaveBeenCalled()
    expect(result).toEqual({
      success: false,
      error,
    })
  })

  it("should return errors if the email is invalid", async () => {
    const formData: FormData = new FormData()
    formData.append("email", "john.doe@example")

    const error: CancelAccountFormValidationErrors = {
      email: "The email is invalid.",
    }

    const result: ApiResponse = await cancelAccount(mockFormInitialState, formData)

    expect(mockFetch).not.toHaveBeenCalled()
    expect(result).toEqual({
      success: false,
      error,
    })
  })

  it("should return success if the email is valid", async () => {
    ;(cookies as Mock).mockReturnValue({
      get: vi.fn((name) => {
        if (name === "authjs.session-token") {
          return { name: "authjs.session-token", value: "valid-token" }
        }
        return null
      }),
    })

    const formData: FormData = new FormData()
    formData.append("email", "john.doe@example.com")

    const mockResponse = {
      success: true,
      message:
        "Your account deletion request has been accepted. Your account will be permanently deleted after 30 days.",
    }

    mockFetch.mockResolvedValueOnce({ json: async () => mockResponse })

    const result: ApiResponse = await cancelAccount(mockFormInitialState, formData)

    expect(mockFetch).toHaveBeenCalledWith(`${process.env.BASE_URL}/api/account`, {
      method: "DELETE",
      headers: {
        Cookie: "authjs.session-token=valid-token",
      },
      body: JSON.stringify({
        email: "john.doe@example.com",
      }),
    })

    expect(result).toEqual(mockResponse)
  })
})

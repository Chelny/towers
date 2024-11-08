import { Mock } from "vitest"
import { forgotPassword } from "@/app/(auth)/forgot-password/forgot-password.actions"
import { ForgotPasswordErrorMessages } from "@/app/(auth)/forgot-password/forgot-password.schema"
import { mockFormInitialState } from "@/vitest.setup"

describe("Forgot Password Actions", () => {
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
    formData.append("email", "")

    const error: ForgotPasswordErrorMessages = {
      email: "The email is required.",
    }

    const result: ApiResponse = await forgotPassword(mockFormInitialState, formData)

    expect(mockFetch).not.toHaveBeenCalled()
    expect(result).toEqual({
      success: false,
      error,
    })
  })

  it("should return errors if required fields are invalid", async () => {
    const formData: FormData = new FormData()
    formData.append("email", "@example.com")

    const error: ForgotPasswordErrorMessages = {
      email: "The email is required.",
    }

    const result: ApiResponse = await forgotPassword(mockFormInitialState, formData)

    expect(mockFetch).not.toHaveBeenCalled()
    expect(result).toEqual({
      success: false,
      error,
    })
  })

  it("should call POST and return success if the payload is valid", async () => {
    const formData: FormData = new FormData()
    formData.append("email", "john.doe@example.com")

    const mockResponse = {
      success: true,
      message: "A reset password link has been sent in your inbox!",
    }

    mockFetch.mockResolvedValueOnce({ json: async () => mockResponse })

    const result: ApiResponse = await forgotPassword(mockFormInitialState, formData)

    expect(mockFetch).toHaveBeenCalledWith(`${process.env.BASE_URL}/api/forgot-password`, {
      method: "POST",
      body: JSON.stringify({
        email: "john.doe@example.com",
      }),
    })

    expect(result).toEqual(mockResponse)
  })
})

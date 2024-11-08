import { Mock } from "vitest"
import { confirmEmailChange } from "@/app/(auth)/confirm-email-change/confirm-email-change.actions"
import { ConfirmEmailChangeFormValidationErrors } from "@/app/(auth)/confirm-email-change/confirm-email-change.schema"
import { mockFormInitialState } from "@/vitest.setup"

describe("Update Email Actions", () => {
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

    const error: ConfirmEmailChangeFormValidationErrors = {
      token: "The token is missing or invalid.",
    }

    const result: ApiResponse = await confirmEmailChange(mockFormInitialState, formData)

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
      message: "The email has been updated!",
    }

    mockFetch.mockResolvedValueOnce({ json: async () => mockResponse })

    const result: ApiResponse = await confirmEmailChange(mockFormInitialState, formData)

    expect(mockFetch).toHaveBeenCalledWith(`${process.env.BASE_URL}/api/confirm-email-change`, {
      method: "PATCH",
      body: JSON.stringify({
        token: "YjY1ZWYwYzEtYWU2My00YWIwLTljZmQtMzcxYjdiY2UwODRifGNoZWxueTFAZXhhbXBsZS5kZXY=",
      }),
    })

    expect(result).toEqual(mockResponse)
  })
})

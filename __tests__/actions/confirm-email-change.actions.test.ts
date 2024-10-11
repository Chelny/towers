import { Mock } from "vitest"
import { confirmEmailChange } from "@/app/(auth)/confirm-email-change/confirm-email-change.actions"
import { PATCH } from "@/app/api/confirm-email-change/route"
import { mockFormInitialState } from "@/vitest.setup"

vi.mock("@/app/api/confirm-email-change/route", () => ({
  PATCH: vi.fn()
}))

describe("Update Email Actions", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return errors if payload is incomplete", async () => {
    const formData = new FormData()
    formData.append("token", "")

    const response = {
      success: false,
      message: "The verification link is invalid.",
      error: {
        token: "The token is missing or invalid."
      }
    }

    ;(PATCH as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await confirmEmailChange(mockFormInitialState, formData)

    expect(PATCH).not.toHaveBeenCalled()
    expect(result).toEqual(response)
  })

  it("should call PATCH and return success when payload is valid", async () => {
    const formData = new FormData()
    formData.append("token", "YjY1ZWYwYzEtYWU2My00YWIwLTljZmQtMzcxYjdiY2UwODRifGNoZWxueTFAZXhhbXBsZS5kZXY=")

    const response = { success: true, message: "The email has been updated!" }

    ;(PATCH as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await confirmEmailChange(mockFormInitialState, formData)

    expect(PATCH).toHaveBeenCalledWith({
      token: "YjY1ZWYwYzEtYWU2My00YWIwLTljZmQtMzcxYjdiY2UwODRifGNoZWxueTFAZXhhbXBsZS5kZXY="
    })
    expect(result).toEqual(response)
  })
})

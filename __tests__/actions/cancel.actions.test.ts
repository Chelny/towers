import { Mock } from "vitest"
import { cancelAccount } from "@/app/(protected)/account/cancel/cancel.actions"
import { DELETE } from "@/app/api/account/route"
import { mockedFormInitialState } from "@/vitest.setup"

vi.mock("@/app/api/account/route", () => ({
  DELETE: vi.fn()
}))

describe("Cancel Account Actions", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return errors if the email field is empty", async () => {
    const formData = new FormData()
    formData.append("email", "")

    const response = {
      success: false,
      error: {
        email: "The email is invalid."
      }
    }

    ;(DELETE as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await cancelAccount(mockedFormInitialState, formData)

    expect(DELETE).not.toHaveBeenCalled()
    expect(result).toEqual(response)
  })

  it("should return errors if the email is invalid", async () => {
    const formData = new FormData()
    formData.append("email", "john.doe@example")

    const response = {
      success: false,
      error: {
        email: "The email is invalid."
      }
    }

    ;(DELETE as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await cancelAccount(mockedFormInitialState, formData)

    expect(DELETE).not.toHaveBeenCalled()
    expect(result).toEqual(response)
  })

  it("should return success if the email is valid", async () => {
    const formData = new FormData()
    formData.append("email", "john.doe@example.com")

    const response = {
      success: true,
      message:
        "Your account deletion request has been accepted. Your account will be permanently deleted after 30 days."
    }

    ;(DELETE as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await cancelAccount(mockedFormInitialState, formData)

    expect(DELETE).toHaveBeenCalledWith({
      email: "john.doe@example.com"
    })
    expect(result).toEqual(response)
  })
})

import { Mock } from "vitest"
import { profile } from "@/app/(protected)/account/profile/profile.actions"
import { PATCH } from "@/app/api/account/profile/route"
import { mockedFormInitialState } from "@/vitest.setup"

vi.mock("@/app/api/account/profile/route", () => ({
  PATCH: vi.fn()
}))

describe("Profile Actions", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return errors if required fields are empty", async () => {
    const formData = new FormData()
    formData.append("name", "")
    formData.append("email", "")
    formData.append("username", "")

    const response = {
      success: false,
      error: {
        name: "The name is invalid.",
        email: "The email is invalid.",
        username: "The username is invalid."
      }
    }

    ;(PATCH as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await profile(mockedFormInitialState, formData)

    expect(PATCH).not.toHaveBeenCalled()
    expect(result).toEqual(response)
  })

  it("should return errors if required fields are invalid", async () => {
    const formData = new FormData()
    formData.append("name", "John Doe #1")
    formData.append("birthdate", "01/01/2000")
    formData.append("email", "john.doe@example")
    formData.append("username", "john.doe.")

    const response = {
      success: false,
      error: {
        name: "The name is invalid.",
        birthdate: "The birthdate is invalid.",
        email: "The email is invalid.",
        username: "The username is invalid."
      }
    }

    ;(PATCH as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await profile(mockedFormInitialState, formData)

    expect(PATCH).not.toHaveBeenCalled()
    expect(result).toEqual(response)
  })

  it("should call PATCH and return success when payload is valid", async () => {
    const formData = new FormData()
    formData.append("name", "John Doe")
    formData.append("birthdate", "2000-01-01")
    formData.append("email", "john.doe@example.com")
    formData.append("username", "john.doe")
    formData.append("image", "http://example.com/image.jpg")

    const response = { success: true, message: "Your profile has been updated!" }

    ;(PATCH as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await profile(mockedFormInitialState, formData)

    expect(PATCH).toHaveBeenCalledWith({
      name: "John Doe",
      birthdate: "2000-01-01",
      email: "john.doe@example.com",
      username: "john.doe",
      image: "http://example.com/image.jpg"
    })
    expect(result).toEqual(response)
  })
})

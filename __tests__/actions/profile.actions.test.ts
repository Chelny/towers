import { cookies } from "next/headers"
import { Mock } from "vitest"
import { profile } from "@/app/(protected)/account/profile/profile.actions"
import { ProfileFormValidationErrors } from "@/app/(protected)/account/profile/profile.schema"
import { mockFormInitialState } from "@/vitest.setup"

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

describe("Profile Actions", () => {
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
    formData.append("name", "")
    formData.append("email", "")
    formData.append("username", "")

    const error: ProfileFormValidationErrors = {
      name: "The name is invalid.",
      email: "The email is invalid.",
      username: "The username is invalid.",
    }

    const result: ApiResponse = await profile(mockFormInitialState, formData)

    expect(mockFetch).not.toHaveBeenCalled()
    expect(result).toEqual({
      success: false,
      error,
    })
  })

  it("should return errors if required fields are invalid", async () => {
    const formData: FormData = new FormData()
    formData.append("name", "John Doe #1")
    formData.append("birthdate", "01/01/2000")
    formData.append("email", "john.doe@example")
    formData.append("username", "john.doe.")

    const error: ProfileFormValidationErrors = {
      name: "The name is invalid.",
      birthdate: "The birthdate is invalid.",
      email: "The email is invalid.",
      username: "The username is invalid.",
    }

    const result: ApiResponse = await profile(mockFormInitialState, formData)

    expect(mockFetch).not.toHaveBeenCalled()
    expect(result).toEqual({
      success: false,
      error,
    })
  })

  it("should call PATCH and return success when payload is valid", async () => {
    ;(cookies as Mock).mockReturnValue({
      get: vi.fn((name) => {
        if (name === "authjs.session-token") {
          return { name: "authjs.session-token", value: "valid-token" }
        }
        return null
      }),
    })

    const formData: FormData = new FormData()
    formData.append("name", "John Doe")
    formData.append("birthdate", "2000-01-01")
    formData.append("email", "john.doe@example.com")
    formData.append("username", "john.doe")
    formData.append("image", "http://example.com/image.jpg")

    const mockResponse = {
      success: true,
      message: "Your profile has been updated!",
    }

    mockFetch.mockResolvedValueOnce({ json: async () => mockResponse })

    const result: ApiResponse = await profile(mockFormInitialState, formData)

    expect(mockFetch).toHaveBeenCalledWith(`${process.env.BASE_URL}/api/account/profile`, {
      method: "PATCH",
      headers: {
        Cookie: "authjs.session-token=valid-token",
      },
      body: JSON.stringify({
        name: "John Doe",
        birthdate: "2000-01-01",
        email: "john.doe@example.com",
        username: "john.doe",
        image: "http://example.com/image.jpg",
      }),
    })

    expect(result).toEqual(mockResponse)
  })
})

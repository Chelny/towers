import { Gender } from "@prisma/client"
import { Mock } from "vitest"
import { profile } from "@/app/(protected)/account/profile/profile.actions"
import { POST } from "@/app/api/account/profile/route"

vi.mock("@/app/api/account/profile/route", () => ({
  POST: vi.fn()
}))

describe("Profile Actions", () => {
  it("should return errors if required fields are empty", async () => {
    const formData = new FormData()
    formData.append("name", "")
    formData.append("email", "")
    formData.append("username", "")

    const response = {
      success: false,
      errors: {
        name: "The name is invalid.",
        email: "The email is invalid.",
        username: "The username is invalid."
      }
    }

    ;(POST as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await profile({}, formData)

    expect(POST).not.toHaveBeenCalled()
    expect(result).toEqual(response)
  })

  it("should return errors if required fields are invalid", async () => {
    const formData = new FormData()
    formData.append("name", "John Doe #1")
    formData.append("gender", "1")
    formData.append("birthdate", "01/01/2000")
    formData.append("email", "john.doe@example")
    formData.append("username", "john.doe.")

    const response = {
      success: false,
      errors: {
        name: "The name is invalid.",
        gender: "The gender is invalid.",
        birthdate: "The birthdate is invalid.",
        email: "The email is invalid.",
        username: "The username is invalid."
      }
    }

    ;(POST as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await profile({}, formData)

    expect(POST).not.toHaveBeenCalled()
    expect(result).toEqual(response)
  })

  it("should call POST and return success when payload is valid", async () => {
    const formData = new FormData()
    formData.append("name", "John Doe")
    formData.append("gender", Gender.M)
    formData.append("birthdate", "2000-01-01")
    formData.append("email", "john.doe@example.com")
    formData.append("username", "john.doe")
    formData.append("image", "http://example.com/image.jpg")

    const response = { success: true, message: "Your profile has been updated!" }

    ;(POST as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await profile({}, formData)

    expect(POST).toHaveBeenCalledOnce()
    expect(POST).toHaveBeenCalledWith({
      name: "John Doe",
      gender: Gender.M,
      birthdate: "2000-01-01",
      email: "john.doe@example.com",
      username: "john.doe",
      image: "http://example.com/image.jpg"
    })
    expect(result).toEqual(response)
  })
})

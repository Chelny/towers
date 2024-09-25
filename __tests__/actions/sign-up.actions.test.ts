import { Gender } from "@prisma/client"
import { Mock } from "vitest"
import { signUp } from "@/app/(auth)/sign-up/sign-up.actions"
import { POST } from "@/app/api/sign-up/route"
import { mockedFormInitialState } from "@/vitest.setup"

vi.mock("@/app/api/sign-up/route", () => ({
  POST: vi.fn()
}))

describe("Sign Up Actions", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return errors if payload is incomplete", async () => {
    const formData = new FormData()
    formData.append("name", "")
    formData.append("email", "")
    formData.append("username", "")
    formData.append("password", "")
    formData.append("confirmPassword", "")

    const response = {
      success: false,
      error: {
        name: "The name is invalid.",
        email: "The email is invalid.",
        username: "The username is invalid.",
        password: "The password is invalid.",
        confirmPassword: "The password confirmation is invalid."
      }
    }

    ;(POST as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await signUp(mockedFormInitialState, formData)

    expect(POST).not.toHaveBeenCalled()
    expect(result).toEqual(response)
  })

  it("should return errors if required fields are invalid", async () => {
    const formData = new FormData()
    formData.append("name", "John Doe #1")
    formData.append("email", "john.doe@@example.com")
    formData.append("username", "john.doe.")
    formData.append("password", "password")
    formData.append("confirmPassword", "password")

    const response = {
      success: false,
      error: {
        name: "The name is invalid.",
        email: "The email is invalid.",
        username: "The username is invalid.",
        password: "The password is invalid.",
        confirmPassword: "The password confirmation is invalid."
      }
    }

    ;(POST as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await signUp(mockedFormInitialState, formData)

    expect(POST).not.toHaveBeenCalled()
    expect(result).toEqual(response)
  })

  it("should return error if passwords do not match", async () => {
    const formData = new FormData()
    formData.append("name", "John Doe")
    formData.append("gender", Gender.M)
    formData.append("birthdate", "2000-01-01")
    formData.append("email", "john.doe@example.com")
    formData.append("username", "john.doe")
    formData.append("password", "Password123!")
    formData.append("confirmPassword", "Password12345!")

    const response = {
      success: false,
      error: {
        confirmPassword: "The password and password confirmation do not match."
      }
    }

    ;(POST as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await signUp(mockedFormInitialState, formData)

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
    formData.append("password", "Password123!")
    formData.append("confirmPassword", "Password123!")

    const response = {
      success: true,
      message: "A confirmation email has been sent to john.doe@example.com."
    }

    ;(POST as Mock).mockResolvedValueOnce({
      json: async () => response
    })

    const result = await signUp(mockedFormInitialState, formData)

    expect(POST).toHaveBeenCalledWith({
      name: "John Doe",
      gender: Gender.M,
      birthdate: "2000-01-01",
      email: "john.doe@example.com",
      username: "john.doe",
      password: "Password123!",
      confirmPassword: "Password123!"
    })
    expect(result).toEqual(response)
  })
})

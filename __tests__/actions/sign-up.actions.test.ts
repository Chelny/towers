import { Mock } from "vitest"
import { signUp } from "@/app/(auth)/sign-up/sign-up.actions"
import { SignUpFormValidationErrors } from "@/app/(auth)/sign-up/sign-up.schema"
import { mockFormInitialState } from "@/vitest.setup"

describe("Sign Up Actions", () => {
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
    formData.append("name", "")
    formData.append("email", "")
    formData.append("username", "")
    formData.append("password", "")
    formData.append("confirmPassword", "")
    // formData.append("termsAndConditions", null)

    const error: SignUpFormValidationErrors = {
      name: "The name is invalid.",
      email: "The email is invalid.",
      username: "The username is invalid.",
      password: "The password is invalid.",
      confirmPassword: "The password confirmation is invalid.",
      termsAndConditions: "You must accept the terms and conditions.",
    }

    const result: ApiResponse = await signUp(mockFormInitialState, formData)

    expect(mockFetch).not.toHaveBeenCalled()
    expect(result).toEqual({
      success: false,
      error,
    })
  })

  it("should return errors if required fields are invalid", async () => {
    const formData: FormData = new FormData()
    formData.append("name", "John Doe #1")
    formData.append("email", "john.doe@@example.com")
    formData.append("username", "john.doe.")
    formData.append("password", "password")
    formData.append("confirmPassword", "password")
    // formData.append("termsAndConditions", null)

    const error: SignUpFormValidationErrors = {
      name: "The name is invalid.",
      email: "The email is invalid.",
      username: "The username is invalid.",
      password: "The password is invalid.",
      confirmPassword: "The password confirmation is invalid.",
      termsAndConditions: "You must accept the terms and conditions.",
    }

    const result: ApiResponse = await signUp(mockFormInitialState, formData)

    expect(mockFetch).not.toHaveBeenCalled()
    expect(result).toEqual({
      success: false,
      error,
    })
  })

  it("should return error if passwords do not match", async () => {
    const formData: FormData = new FormData()
    formData.append("name", "John Doe")
    formData.append("birthdate", "2000-01-01")
    formData.append("email", "john.doe@example.com")
    formData.append("username", "john.doe")
    formData.append("password", "Password123!")
    formData.append("confirmPassword", "Password12345!")
    formData.append("termsAndConditions", "on")

    const error: SignUpFormValidationErrors = {
      confirmPassword: "The password and password confirmation do not match.",
    }

    const result: ApiResponse = await signUp(mockFormInitialState, formData)

    expect(mockFetch).not.toHaveBeenCalled()
    expect(result).toEqual({
      success: false,
      error,
    })
  })

  it("should call POST and return success when payload is valid", async () => {
    const formData: FormData = new FormData()
    formData.append("name", "John Doe")
    formData.append("birthdate", "2000-01-01")
    formData.append("email", "john.doe@example.com")
    formData.append("username", "john.doe")
    formData.append("password", "Password123!")
    formData.append("confirmPassword", "Password123!")
    formData.append("termsAndConditions", "on")

    const mockResponse = {
      success: true,
      message: "A confirmation email has been sent to john.doe@example.com.",
    }

    mockFetch.mockResolvedValueOnce({ json: async () => mockResponse })

    const result: ApiResponse = await signUp(mockFormInitialState, formData)

    expect(mockFetch).toHaveBeenCalledWith(`${process.env.BASE_URL}/api/sign-up`, {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        birthdate: "2000-01-01",
        email: "john.doe@example.com",
        username: "john.doe",
        password: "Password123!",
        confirmPassword: "Password123!",
        termsAndConditions: true,
      }),
    })

    expect(result).toEqual(mockResponse)
  })
})

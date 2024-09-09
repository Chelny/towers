import { useFormState, useFormStatus } from "react-dom"
import { render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import { VerifyEmailForm } from "@/app/(auth)/verify-email/verify-email.form"

const { useRouter, mockedRouterPush, useSearchParams, mockedSearchParams } = vi.hoisted(() => {
  const mockedRouterPush: Mock = vi.fn()
  const mockedSearchParams = {
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    toString: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    entries: vi.fn(),
    forEach: vi.fn(),
    append: vi.fn(),
    delete: vi.fn(),
    set: vi.fn(),
    sort: vi.fn(),
    [Symbol.iterator]: vi.fn()
  }

  return {
    useRouter: () => ({ push: mockedRouterPush }),
    mockedRouterPush,
    useSearchParams: () => mockedSearchParams,
    mockedSearchParams
  }
})

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual("next/navigation")

  return {
    ...actual,
    useRouter,
    useSearchParams
  }
})

vi.mock("react-dom", () => ({
  useFormState: vi.fn(),
  useFormStatus: vi.fn()
}))

describe("Verify Email Form", () => {
  beforeEach(() => {
    vi.mocked(useFormState).mockReturnValue([{ success: false, message: "", errors: {} }, vi.fn(), false])

    vi.mocked(useFormStatus).mockReturnValue({
      pending: false,
      data: null,
      method: null,
      action: null
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should render the form with all elements", () => {
    render(<VerifyEmailForm />)

    expect(screen.getByTestId("verify-email-spinner-icon")).toBeInTheDocument()
    expect(screen.getByTestId("verify-email-email-input")).toBeInTheDocument()
    expect(screen.getByTestId("verify-email-token-input")).toBeInTheDocument()
  })

  it("should pass the email and token from URL params to the hidden input fields", () => {
    const encodedEmail: string = encodeURIComponent("john.doe@example.com")
    const token: string = "2d9d7b17-98a6-463c-9531-4de8e8a0e3c8"

    mockedSearchParams.get.mockImplementation((key: string) => {
      if (key === "email") return encodedEmail
      if (key === "token") return token
      return null
    })

    render(<VerifyEmailForm />)

    const emailInput: HTMLInputElement = screen.getByTestId("verify-email-email-input")
    expect(emailInput).toHaveValue(decodeURIComponent(encodedEmail))

    const tokenInput: HTMLInputElement = screen.getByTestId("verify-email-token-input")
    expect(tokenInput).toHaveValue(token)
  })

  it("should show error message if the verification link is invalid", () => {
    vi.mocked(useFormState).mockReturnValue([
      { success: false, message: "The verification link is invalid!" },
      vi.fn(),
      false
    ])

    render(<VerifyEmailForm />)

    expect(screen.queryByTestId("verify-email-spinner-icon")).not.toBeInTheDocument()
    expect(screen.getByText(/The verification link is invalid/i)).toBeInTheDocument()
  })

  it("should display a success message if email verification is successful", () => {
    vi.mocked(useFormState).mockReturnValue([
      { success: true, message: "The email has been verified!" },
      vi.fn(),
      false
    ])

    render(<VerifyEmailForm />)

    expect(screen.queryByTestId("verify-email-spinner-icon")).not.toBeInTheDocument()
    expect(screen.getByText(/The email has been verified/i)).toBeInTheDocument()
    expect(screen.getByTestId("verify-email-sign-in-button")).toBeInTheDocument()
  })
})

import { useFormState, useFormStatus } from "react-dom"
import { useRouter, useSearchParams } from "next/navigation"
import { render, screen } from "@testing-library/react"
import { VerifyEmailForm } from "@/app/(auth)/verify-email/verify-email.form"
import { mockUseSearchParams } from "@/vitest.setup"

vi.mock("next/navigation")

vi.mock("react-dom", () => ({
  useFormState: vi.fn(),
  useFormStatus: vi.fn()
}))

describe("Verify Email Form", () => {
  beforeEach(() => {
    const mockRouter = {
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn()
    }
    vi.mocked(useRouter).mockReturnValue(mockRouter)

    vi.mocked(useSearchParams).mockReturnValue(mockUseSearchParams({}))

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
    const encodedEmail = encodeURIComponent("john.doe@example.com")

    vi.mocked(useSearchParams).mockReturnValue(
      mockUseSearchParams({
        email: encodedEmail,
        token: "2d9d7b17-98a6-463c-9531-4de8e8a0e3c8"
      })
    )

    render(<VerifyEmailForm />)

    expect(screen.getByTestId("verify-email-email-input")).toHaveValue(decodeURIComponent(encodedEmail))
    expect(screen.getByTestId("verify-email-token-input")).toHaveValue("2d9d7b17-98a6-463c-9531-4de8e8a0e3c8")
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

import { useFormState, useFormStatus } from "react-dom"
import { useSearchParams } from "next/navigation"
import { render, screen } from "@testing-library/react"
import { ResetPasswordForm } from "@/app/(auth)/reset-password/reset-password.form"
import { mockUseSearchParams } from "@/vitest.setup"

vi.mock("resend", () => {
  return {
    Resend: vi.fn().mockImplementation(() => ({
      send: vi.fn().mockResolvedValue({})
    }))
  }
})

describe("Reset Password Form", () => {
  it("should render the form with all elements", () => {
    render(<ResetPasswordForm />)

    expect(screen.getByTestId("reset-password-password-input")).toBeInTheDocument()
    expect(screen.getByTestId("reset-password-confirm-password-input")).toBeInTheDocument()
    expect(screen.getByTestId("reset-password-token-input")).toBeInTheDocument()
  })

  it("should pass the token from URL params to the hidden input field", () => {
    vi.mocked(useSearchParams).mockReturnValue(mockUseSearchParams({ token: "d457775d-9123-4922-84de-cf535a63484e" }))

    render(<ResetPasswordForm />)

    expect(screen.getByTestId("reset-password-token-input")).toHaveValue("d457775d-9123-4922-84de-cf535a63484e")
  })

  it("should show an error for invalid password format", () => {
    vi.mocked(useFormState).mockReturnValue([
      { success: false, errors: { password: "The password is invalid." } },
      vi.fn(),
      false
    ])

    render(<ResetPasswordForm />)

    expect(screen.getByText(/The password is invalid/i)).toBeInTheDocument()
  })

  it("should disable the submit button when the form is submitting", () => {
    vi.mocked(useFormStatus).mockReturnValue({
      pending: true,
      data: new FormData(),
      method: "POST",
      action: "/api/reset-password"
    })

    render(<ResetPasswordForm />)

    expect(screen.getByTestId("reset-password-submit-button")).toBeDisabled()
  })

  it("should display a success message on form submission success", () => {
    vi.mocked(useFormState).mockReturnValue([
      { success: true, message: "The password has been updated!" },
      vi.fn(),
      false
    ])

    render(<ResetPasswordForm />)

    expect(screen.getByText(/The password has been updated/i)).toBeInTheDocument()
  })
})

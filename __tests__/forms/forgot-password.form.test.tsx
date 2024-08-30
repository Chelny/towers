import { useFormState, useFormStatus } from "react-dom"
import { render, screen } from "@testing-library/react"
import { ForgotPasswordForm } from "@/app/(auth)/forgot-password/forgot-password.form"

describe("Forgot Password Form", () => {
  it("should render the form with all elements", () => {
    render(<ForgotPasswordForm />)

    expect(screen.getByTestId("forgot-password-email-input")).toBeInTheDocument()
    expect(screen.getByTestId("forgot-password-submit-button")).toBeInTheDocument()
  })

  it("should have correct required properties for form fields", () => {
    render(<ForgotPasswordForm />)

    expect(screen.getByTestId("forgot-password-email-input")).toHaveAttribute("required")
  })

  it("should show error messages when submitting an empty form", async () => {
    vi.mocked(useFormState).mockReturnValue([
      { success: false, errors: { email: "The email is required." } },
      vi.fn(),
      false
    ])

    render(<ForgotPasswordForm />)

    expect(screen.getByText(/The email is required/i)).toBeInTheDocument()
  })

  it("should disable the submit button when the form is submitting", () => {
    vi.mocked(useFormStatus).mockReturnValue({
      pending: true,
      data: new FormData(),
      method: "POST",
      action: "/api/forgot-password"
    })

    render(<ForgotPasswordForm />)

    expect(screen.getByTestId("forgot-password-submit-button")).toBeDisabled()
  })

  it("should display a success message on form submission success", () => {
    vi.mocked(useFormState).mockReturnValue([
      { success: true, message: "A reset password link has been sent in your inbox!" },
      vi.fn(),
      false
    ])

    render(<ForgotPasswordForm />)

    expect(screen.getByText(/A reset password link has been sent in your inbox/i)).toBeInTheDocument()
  })
})

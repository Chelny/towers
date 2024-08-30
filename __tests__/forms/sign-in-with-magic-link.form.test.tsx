import { useFormState, useFormStatus } from "react-dom"
import { render, screen } from "@testing-library/react"
import { SignInWithMagicLinkForm } from "@/app/(auth)/sign-in-with-magic-link/sign-in-with-magic-link.form"

describe("Sign In With Magic Link Form", () => {
  it("should render the form with all elements", () => {
    render(<SignInWithMagicLinkForm />)

    expect(screen.getByTestId("sign-in-with-magic-link-email-input")).toBeInTheDocument()
    expect(screen.getByTestId("sign-in-with-magic-link-submit-button")).toBeInTheDocument()
  })

  it("should have correct required properties for form fields", () => {
    render(<SignInWithMagicLinkForm />)

    expect(screen.getByTestId("sign-in-with-magic-link-email-input")).toHaveAttribute("required")
  })

  it("should show error messages when submitting an empty form", () => {
    vi.mocked(useFormState).mockReturnValue([{ success: false, message: "The email is invalid." }, vi.fn(), false])

    render(<SignInWithMagicLinkForm />)

    expect(screen.getByText(/The email is invalid/i)).toBeInTheDocument()
  })

  it("should disable the submit and social buttons when the form is submitting", () => {
    vi.mocked(useFormStatus).mockReturnValue({
      pending: true,
      data: new FormData(),
      method: "POST",
      action: "/api/sign-in"
    })

    render(<SignInWithMagicLinkForm />)

    expect(screen.getByTestId("sign-in-with-magic-link-submit-button")).toBeDisabled()
  })
})

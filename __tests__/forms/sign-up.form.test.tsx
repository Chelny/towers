import { useFormState, useFormStatus } from "react-dom"
import { render, screen } from "@testing-library/react"
import { SignUpForm } from "@/app/(auth)/sign-up/sign-up.form"

describe("Sign Up Form", () => {
  it("should render the form with all elements", () => {
    render(<SignUpForm />)

    expect(screen.getByTestId("sign-up-name-input")).toBeInTheDocument()
    expect(screen.getByTestId("sign-up-gender-radio-group-M")).toBeInTheDocument()
    expect(screen.getByTestId("sign-up-gender-radio-group-F")).toBeInTheDocument()
    expect(screen.getByTestId("sign-up-gender-radio-group-X")).toBeInTheDocument()
    expect(screen.getByTestId("sign-up-birthdate-calendar")).toBeInTheDocument()
    expect(screen.getByTestId("sign-up-email-input")).toBeInTheDocument()
    expect(screen.getByTestId("sign-up-username-input")).toBeInTheDocument()
    expect(screen.getByTestId("sign-up-password-input")).toBeInTheDocument()
    expect(screen.getByTestId("sign-up-confirm-password-input")).toBeInTheDocument()
    expect(screen.getByTestId("sign-up-submit-button")).toBeInTheDocument()
  })

  it("should have correct required properties for form fields", () => {
    render(<SignUpForm />)

    expect(screen.getByTestId("sign-up-name-input")).toHaveAttribute("required")
    expect(screen.getByTestId("sign-up-gender-radio-group-M")).not.toHaveAttribute("required")
    expect(screen.getByTestId("sign-up-gender-radio-group-F")).not.toHaveAttribute("required")
    expect(screen.getByTestId("sign-up-gender-radio-group-X")).not.toHaveAttribute("required")
    expect(screen.getByTestId("sign-up-birthdate-calendar")).not.toHaveAttribute("required")
    expect(screen.getByTestId("sign-up-email-input")).toHaveAttribute("required")
    expect(screen.getByTestId("sign-up-username-input")).toHaveAttribute("required")
    expect(screen.getByTestId("sign-up-password-input")).toHaveAttribute("required")
    expect(screen.getByTestId("sign-up-confirm-password-input")).toHaveAttribute("required")
  })

  it("should show error messages when submitting an empty form", () => {
    vi.mocked(useFormState).mockReturnValue([
      {
        success: false,
        errors: {
          name: "The name is invalid.",
          email: "The email is invalid",
          username: "The username is invalid",
          password: "The password is invalid",
          confirmPassword: "The password confirmation is invalid"
        }
      },
      vi.fn(),
      false
    ])

    render(<SignUpForm />)

    expect(screen.getByText(/The name is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The email is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The username is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The password is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The password confirmation is invalid/i)).toBeInTheDocument()
  })

  it("should show an error if the birthdate is invalid", () => {
    vi.mocked(useFormState).mockReturnValue([
      {
        success: false,
        errors: {
          birthdate: "The birthdate is invalid."
        }
      },
      vi.fn(),
      false
    ])

    render(<SignUpForm />)

    expect(screen.getByText(/The birthdate is invalid/i)).toBeInTheDocument()
  })

  it("should show an error if passwords do not match", () => {
    vi.mocked(useFormState).mockReturnValue([
      {
        success: false,
        errors: {
          confirmPassword: "The password and password confirmation do not match"
        }
      },
      vi.fn(),
      false
    ])

    render(<SignUpForm />)

    expect(screen.getByText(/The password and password confirmation do not match/i)).toBeInTheDocument()
  })

  it("should disable the submit button when the form is submitting", () => {
    vi.mocked(useFormStatus).mockReturnValue({
      pending: true,
      data: new FormData(),
      method: "POST",
      action: "/api/sign-up"
    })

    render(<SignUpForm />)

    expect(screen.getByTestId("sign-up-submit-button")).toBeDisabled()
  })

  it("should display a success message on form submission success", () => {
    vi.mocked(useFormState).mockReturnValue([
      { success: true, message: "A confirmation email has been sent to john.doe@example.com." },
      vi.fn(),
      false
    ])

    render(<SignUpForm />)

    // fireEvent.change(screen.getByTestId("name"), { target: { value: "John Doe" } })
    // fireEvent.change(screen.getByTestId("gender-M"), { target: { value: "M" } })
    // fireEvent.change(screen.getByTestId("birthdate"), { target: { value: "2000-01-01" } })
    // fireEvent.change(screen.getByTestId("email"), { target: { value: "john.doe@example.com" } })
    // fireEvent.change(screen.getByTestId("username"), { target: { value: "john.doe" } })
    // fireEvent.change(screen.getByTestId("password"), { target: { value: "Password123!" } })
    // fireEvent.change(screen.getByTestId("confirmPassword"), { target: { value: "Password123!" } })

    expect(screen.getByText(/A confirmation email has been sent to john\.doe@example\.com/i)).toBeInTheDocument()
  })
})

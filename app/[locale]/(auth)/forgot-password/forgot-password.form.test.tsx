import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import { ForgotPasswordForm } from "@/app/[locale]/(auth)/forgot-password/forgot-password.form"

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    forgetPassword: vi.fn(),
  },
}))

describe("Forgot Password Form", () => {
  it("should render the form with all elements", () => {
    render(<ForgotPasswordForm />)

    expect(screen.getByTestId("forgot-password_input-email_email")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Send Email/i })).toBeInTheDocument()
  })

  it("should correctly mark form fields as required", () => {
    render(<ForgotPasswordForm />)

    expect(screen.getByTestId("forgot-password_input-email_email")).toHaveAttribute("required")
  })

  it("should display error messages when the form is submitted with empty fields", () => {
    render(<ForgotPasswordForm />)

    fireEvent.click(screen.getByRole("button", { name: /Send Email/i }))

    expect(screen.getByText(/The email is invalid/i)).toBeInTheDocument()
  })

  it("should disable the submit button during form submission and show a success message on successful submission", async () => {
    const { authClient } = await import("@/lib/auth-client")
    const mockForgotPassword: Mock = authClient.forgetPassword as Mock

    mockForgotPassword.mockImplementation(async (_, callbacks) => {
      callbacks.onRequest()
      await new Promise((resolve) => setTimeout(resolve, 100))
      callbacks.onSuccess()
    })

    render(<ForgotPasswordForm />)

    fireEvent.input(screen.getByTestId("forgot-password_input-email_email"), {
      target: { value: "john.doe@example.com" },
    })

    const submitButton: HTMLButtonElement = screen.getByRole("button", { name: /Send Email/i })
    fireEvent.click(submitButton)

    expect(submitButton).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByText(/A reset password link has been sent in your inbox/i)).toBeInTheDocument()
    })
  })
})

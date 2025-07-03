import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import { ResetPasswordForm } from "@/app/[locale]/(auth)/reset-password/reset-password.form"
import { mockUseRouter, mockUseSearchParams } from "@/vitest.setup"

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => mockUseRouter),
  useSearchParams: vi.fn(() => mockUseSearchParams),
}))

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    resetPassword: vi.fn(),
  },
}))

describe("Reset Password Form", () => {
  it("should render the form with all elements", () => {
    render(<ResetPasswordForm />)

    expect(screen.getByTestId("reset-password_input-hidden_token")).toBeInTheDocument()
    expect(screen.getByTestId("reset-password_input-password_password")).toBeInTheDocument()
    expect(screen.getByTestId("reset-password_input-password_confirm-password")).toBeInTheDocument()
  })

  it("should pass the token from URL params to the hidden input field", () => {
    const token: string =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

    mockUseSearchParams.get.mockImplementation((key: string) => {
      if (key === "token") return token
      return null
    })

    render(<ResetPasswordForm />)

    expect(screen.getByTestId("reset-password_input-hidden_token")).toHaveValue(token)
  })

  it("should show an error for invalid password format", () => {
    render(<ResetPasswordForm />)

    fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }))

    expect(screen.getByText(/The password is invalid/i)).toBeInTheDocument()
  })

  it("should disable the submit button during form submission and show a success message on successful submission", async () => {
    const { authClient } = await import("@/lib/auth-client")
    // @ts-ignore
    const mockResetPassword: Mock = authClient.resetPassword as Mock

    mockResetPassword.mockImplementation(async (_, callbacks) => {
      callbacks.onRequest()
      await new Promise((resolve) => setTimeout(resolve, 100))
      callbacks.onSuccess()
    })

    render(<ResetPasswordForm />)

    fireEvent.input(screen.getByTestId("reset-password_input-password_password"), {
      target: { value: "Password1234!" },
    })
    fireEvent.input(screen.getByTestId("reset-password_input-password_confirm-password"), {
      target: { value: "Password1234!" },
    })

    const submitButton: HTMLButtonElement = screen.getByRole("button", { name: /Reset Password/i })
    fireEvent.click(submitButton)

    expect(submitButton).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByText(/The password has been reset!/i)).toBeInTheDocument()
    })
  })
})

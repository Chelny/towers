import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import { SignInForm } from "@/app/[locale]/(auth)/sign-in/sign-in.form"
import { ROUTE_FORGOT_PASSWORD, ROUTE_SIGN_IN_WITH_MAGIC_LINK, ROUTE_SIGN_UP } from "@/constants/routes"
import { mockUseRouter } from "@/vitest.setup"

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => mockUseRouter),
}))

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
      passkey: vi.fn(),
    },
  },
}))

describe("Sign In Form", () => {
  beforeAll(() => {
    // @ts-ignore
    global.PublicKeyCredential = {
      isConditionalMediationAvailable: vi.fn(),
      isUserVerifyingPlatformAuthenticatorAvailable: vi.fn(),
    }
  })

  it("should render the form with all elements", () => {
    render(<SignInForm />)

    expect(screen.getByTestId("sign-in_input-email_email")).toBeInTheDocument()
    expect(screen.getByTestId("sign-in_input-password_password")).toBeInTheDocument()
    expect(screen.getByTestId("sign-in_checkbox_remember-me")).toBeInTheDocument()
    expect(screen.getByText(/Forgot Password/i)).toBeInTheDocument()
    expect(screen.getByTestId("sign-in_button_sign-in-with-email-and-password")).toBeInTheDocument()
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument()
    expect(screen.getByTestId("sign-in_button_sign-in-with-magic-link")).toBeInTheDocument()
    expect(screen.getByTestId("sign-in_button_sign-in-with-github")).toBeInTheDocument()
    expect(screen.getByTestId("sign-in_button_sign-in-with-google")).toBeInTheDocument()
    expect(screen.getByTestId("sign-in_button_sign-in-with-passkey")).toBeInTheDocument()
  })

  it("should correctly mark form fields as required", () => {
    render(<SignInForm />)

    expect(screen.getByTestId("sign-in_input-email_email")).toHaveAttribute("required")
    expect(screen.getByTestId("sign-in_input-password_password")).toHaveAttribute("required")
  })

  it("should display the forgot password link", () => {
    render(<SignInForm />)

    const forgotPasswordLink: HTMLElement = screen.getByTestId("sign-in_link_forgot-password")
    expect(forgotPasswordLink).toBeInTheDocument()
    expect(forgotPasswordLink).toHaveAttribute("href", ROUTE_FORGOT_PASSWORD.PATH)
  })

  it("should display the sign up link", () => {
    render(<SignInForm />)

    const signUpLink: HTMLElement = screen.getByTestId("sign-in_link_sign-up")
    expect(signUpLink).toBeInTheDocument()
    expect(signUpLink).toHaveAttribute("href", ROUTE_SIGN_UP.PATH)
  })

  it("should navigate to the magic link page when the magic link button is clicked", () => {
    const mockPush: Mock = vi.fn()
    mockUseRouter.push = mockPush

    render(<SignInForm />)

    fireEvent.click(screen.getByTestId("sign-in_button_sign-in-with-magic-link"))

    expect(mockPush).toHaveBeenCalledWith(ROUTE_SIGN_IN_WITH_MAGIC_LINK.PATH)
  })

  it("should display error messages when the form is submitted with empty fields", () => {
    render(<SignInForm />)

    fireEvent.click(screen.getByTestId("sign-in_button_sign-in-with-email-and-password"))

    expect(screen.getByText(/The email or the password is invalid/i)).toBeInTheDocument()
  })

  it("should display error messages for invalid email or password format", async () => {
    const { authClient } = await import("@/lib/auth-client")
    const mockSignInEmail: Mock = authClient.signIn.email as Mock

    mockSignInEmail.mockImplementation(async (_, callbacks) => {
      callbacks.onRequest()
      await new Promise((resolve) => setTimeout(resolve, 100))
      callbacks.onError({
        error: { message: "Invalid email or password" },
      })
    })

    render(<SignInForm />)

    fireEvent.input(screen.getByTestId("sign-in_input-email_email"), { target: { value: "john.doe@example.com" } })
    fireEvent.input(screen.getByTestId("sign-in_input-password_password"), { target: { value: "Password!" } })
    fireEvent.click(screen.getByTestId("sign-in_button_sign-in-with-email-and-password"))

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument()
    })
  })

  it("should disable all sign in buttons during form submission", async () => {
    const { authClient } = await import("@/lib/auth-client")
    const mockSignInEmail: Mock = authClient.signIn.email as Mock

    mockSignInEmail.mockImplementation(async (_, callbacks) => {
      callbacks.onRequest()
      await new Promise((resolve) => setTimeout(resolve, 100))
      callbacks.onSuccess()
    })

    render(<SignInForm />)

    fireEvent.input(screen.getByTestId("sign-in_input-email_email"), { target: { value: "john.doe@example.com" } })
    fireEvent.input(screen.getByTestId("sign-in_input-password_password"), { target: { value: "Password123!" } })

    const submitButton: HTMLButtonElement = screen.getByTestId("sign-in_button_sign-in-with-email-and-password")
    fireEvent.click(submitButton)

    expect(submitButton).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByTestId("sign-in_button_sign-in-with-magic-link")).toBeDisabled()
      expect(screen.getByTestId("sign-in_button_sign-in-with-github")).toBeDisabled()
      expect(screen.getByTestId("sign-in_button_sign-in-with-google")).toBeDisabled()
      expect(screen.getByTestId("sign-in_button_sign-in-with-passkey")).toBeDisabled()
    })
  })
})

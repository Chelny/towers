import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import { SignInForm } from "@/app/(auth)/sign-in/sign-in.form"
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

    expect(screen.getByTestId("sign-in-email-input")).toBeInTheDocument()
    expect(screen.getByTestId("sign-in-password-input")).toBeInTheDocument()
    expect(screen.getByTestId("sign-in-remember-me-checkbox")).toBeInTheDocument()
    expect(screen.getByText(/Forgot Password/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Sign in with email and password/i })).toBeInTheDocument()
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Magic Link/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Sign in with Discord/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Sign in with Facebook/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Sign in with GitHub/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Sign in with GitLab/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Sign in with Google/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Sign in with Twitch/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Sign in with Twitter\/X/i })).toBeInTheDocument()
  })

  it("should correctly mark form fields as required", () => {
    render(<SignInForm />)

    expect(screen.getByTestId("sign-in-email-input")).toHaveAttribute("required")
    expect(screen.getByTestId("sign-in-password-input")).toHaveAttribute("required")
  })

  it("should display the forgot password link", () => {
    render(<SignInForm />)

    const forgotPasswordLink: HTMLElement = screen.getByTestId("sign-in-forgot-password-link")
    expect(forgotPasswordLink).toBeInTheDocument()
    expect(forgotPasswordLink).toHaveAttribute("href", ROUTE_FORGOT_PASSWORD.PATH)
  })

  it("should display the sign up link", () => {
    render(<SignInForm />)

    const signUpLink: HTMLElement = screen.getByTestId("sign-in-sign-up-link")
    expect(signUpLink).toBeInTheDocument()
    expect(signUpLink).toHaveAttribute("href", ROUTE_SIGN_UP.PATH)
  })

  it("should navigate to the magic link page when the magic link button is clicked", () => {
    const mockPush: Mock = vi.fn()
    mockUseRouter.push = mockPush

    render(<SignInForm />)

    fireEvent.click(screen.getByRole("button", { name: /Magic Link/i }))
    expect(mockPush).toHaveBeenCalledWith(ROUTE_SIGN_IN_WITH_MAGIC_LINK.PATH)
  })

  it("should display error messages when the form is submitted with empty fields", () => {
    render(<SignInForm />)

    fireEvent.click(screen.getByRole("button", { name: /Sign in with email and password/i }))

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

    fireEvent.input(screen.getByTestId("sign-in-email-input"), { target: { value: "john.doe@example.com" } })
    fireEvent.input(screen.getByTestId("sign-in-password-input"), { target: { value: "Password!" } })
    fireEvent.click(screen.getByRole("button", { name: /Sign in with email and password/i }))

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

    fireEvent.input(screen.getByTestId("sign-in-email-input"), { target: { value: "john.doe@example.com" } })
    fireEvent.input(screen.getByTestId("sign-in-password-input"), { target: { value: "Password123!" } })

    const submitButton: HTMLButtonElement = screen.getByRole("button", { name: /Sign in with email and password/i })
    fireEvent.click(submitButton)

    expect(submitButton).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Magic Link/i })).toBeDisabled()
      expect(screen.getByRole("button", { name: /Sign in with Discord/i })).toBeDisabled()
      expect(screen.getByRole("button", { name: /Sign in with Facebook/i })).toBeDisabled()
      expect(screen.getByRole("button", { name: /Sign in with GitHub/i })).toBeDisabled()
      expect(screen.getByRole("button", { name: /Sign in with GitLab/i })).toBeDisabled()
      expect(screen.getByRole("button", { name: /Sign in with Google/i })).toBeDisabled()
      expect(screen.getByRole("button", { name: /Sign in with Twitch/i })).toBeDisabled()
      expect(screen.getByRole("button", { name: /Sign in with Twitter\/X/i })).toBeDisabled()
    })
  })
})

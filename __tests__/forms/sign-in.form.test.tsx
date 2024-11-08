import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { fireEvent, render, screen } from "@testing-library/react"
import { SignInForm } from "@/app/(auth)/sign-in/sign-in.form"
import { ROUTE_FORGOT_PASSWORD, ROUTE_SIGN_IN_WITH_MAGIC_LINK, ROUTE_SIGN_UP } from "@/constants/routes"
import { mockRouter } from "@/vitest.setup"

vi.mock("react", async (importActual) => {
  const actual = await importActual<typeof import("react")>()

  return {
    ...actual,
    useActionState: vi.fn(),
  }
})

vi.mock("next/navigation")

vi.mock("resend", () => {
  return {
    Resend: vi.fn().mockImplementation(() => {
      return {
        sendEmail: vi.fn().mockResolvedValue({ success: true }),
      }
    }),
  }
})

describe("Sign In Form", () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(mockRouter)
    vi.mocked(useActionState).mockReturnValue([{ success: false, message: "", error: {} }, vi.fn(), false])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should render the form with all elements", () => {
    render(<SignInForm />)

    expect(screen.getByTestId("sign-in-email-input")).toBeInTheDocument()
    expect(screen.getByTestId("sign-in-password-input")).toBeInTheDocument()
    expect(screen.getByText(/Forgot Password/i)).toBeInTheDocument()
    expect(screen.getByTestId("sign-in-submit-button")).toBeInTheDocument()
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument()
    expect(screen.getByTestId("sign-in-magic-link-button")).toBeInTheDocument()
    // expect(screen.getByTestId("sign-up-passkey-button")).toBeInTheDocument()
    // expect(screen.getByTestId("sign-in-passkey-button")).toBeInTheDocument()
  })

  it("should have correct required properties for form fields", () => {
    render(<SignInForm />)

    expect(screen.getByTestId("sign-in-email-input")).toHaveAttribute("required")
    expect(screen.getByTestId("sign-in-password-input")).toHaveAttribute("required")
  })

  it("should navigate to correct routes on link clicks", () => {
    render(<SignInForm />)

    const forgotPasswordLink = screen.getByText(/Forgot Password/i)
    expect(forgotPasswordLink).toBeInTheDocument()
    expect(forgotPasswordLink.closest("a")).toHaveAttribute("href", ROUTE_FORGOT_PASSWORD.PATH)

    const signUpLink = screen.getByText(/Sign Up/i)
    expect(signUpLink).toBeInTheDocument()
    expect(signUpLink.closest("a")).toHaveAttribute("href", ROUTE_SIGN_UP.PATH)

    fireEvent.click(screen.getByTestId("sign-in-magic-link-button"))
    expect(mockRouter.push).toHaveBeenCalledWith(ROUTE_SIGN_IN_WITH_MAGIC_LINK.PATH)
  })

  it("should show error messages when submitting an empty form", () => {
    vi.mocked(useActionState).mockReturnValue([
      { success: false, message: "The email or the password is invalid." },
      vi.fn(),
      false,
    ])

    render(<SignInForm />)

    expect(screen.getByText(/The email or the password is invalid/i)).toBeInTheDocument()
  })

  it("should show an error for invalid email or password format", () => {
    vi.mocked(useActionState).mockReturnValue([
      { success: false, message: "The email or the password is invalid." },
      vi.fn(),
      false,
    ])

    render(<SignInForm />)

    expect(screen.getByText(/The email or the password is invalid/i)).toBeInTheDocument()
  })

  it("should disable the submit and social buttons when the form is submitting", () => {
    vi.mocked(useActionState).mockReturnValue([{ success: false, message: "" }, vi.fn(), true])

    render(<SignInForm />)

    expect(screen.getByTestId("sign-in-submit-button")).toBeDisabled()
    expect(screen.getByTestId("sign-in-magic-link-button")).toBeDisabled()
    // expect(screen.getByTestId("sign-up-passkey-button")).toBeDisabled()
    // expect(screen.getByTestId("sign-in-passkey-button")).toBeDisabled()
    expect(screen.getByTestId("sign-in-github-button")).toBeDisabled()
    expect(screen.getByTestId("sign-in-google-button")).toBeDisabled()
  })
})

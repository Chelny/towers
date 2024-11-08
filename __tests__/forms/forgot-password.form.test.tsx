import { useActionState } from "react"
import { render, screen } from "@testing-library/react"
import { ForgotPasswordForm } from "@/app/(auth)/forgot-password/forgot-password.form"

vi.mock("react", async (importActual) => {
  const actual = await importActual<typeof import("react")>()

  return {
    ...actual,
    useActionState: vi.fn(),
  }
})

vi.mock("resend", () => {
  return {
    Resend: vi.fn().mockImplementation(() => {
      return {
        sendEmail: vi.fn().mockResolvedValue({ success: true }),
      }
    }),
  }
})

describe("Forgot Password Form", () => {
  beforeEach(() => {
    vi.mocked(useActionState).mockReturnValue([{ success: false, message: "", error: {} }, vi.fn(), false])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

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
    vi.mocked(useActionState).mockReturnValue([
      { success: false, error: { email: "The email is required." } },
      vi.fn(),
      false,
    ])

    render(<ForgotPasswordForm />)

    expect(screen.getByText(/The email is required/i)).toBeInTheDocument()
  })

  it("should disable the submit button when the form is submitting", () => {
    vi.mocked(useActionState).mockReturnValue([{ success: false, message: "" }, vi.fn(), true])

    render(<ForgotPasswordForm />)

    expect(screen.getByTestId("forgot-password-submit-button")).toBeDisabled()
  })

  it("should display a success message on form submission success", () => {
    vi.mocked(useActionState).mockReturnValue([
      { success: true, message: "A reset password link has been sent in your inbox!" },
      vi.fn(),
      false,
    ])

    render(<ForgotPasswordForm />)

    expect(screen.getByText(/A reset password link has been sent in your inbox/i)).toBeInTheDocument()
  })
})

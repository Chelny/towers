import { useActionState } from "react"
import { render, screen } from "@testing-library/react"
import { SignUpForm } from "@/app/(auth)/sign-up/sign-up.form"

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

describe("Sign Up Form", () => {
  beforeEach(() => {
    vi.mocked(useActionState).mockReturnValue([{ success: false, message: "", error: {} }, vi.fn(), false])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should render the form with all elements", () => {
    render(<SignUpForm />)

    expect(screen.getByTestId("sign-up-name-input")).toBeInTheDocument()
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
    expect(screen.getByTestId("sign-up-birthdate-calendar")).not.toHaveAttribute("required")
    expect(screen.getByTestId("sign-up-email-input")).toHaveAttribute("required")
    expect(screen.getByTestId("sign-up-username-input")).toHaveAttribute("required")
    expect(screen.getByTestId("sign-up-password-input")).toHaveAttribute("required")
    expect(screen.getByTestId("sign-up-confirm-password-input")).toHaveAttribute("required")
  })

  it("should show error messages when submitting an empty form", () => {
    vi.mocked(useActionState).mockReturnValue([
      {
        success: false,
        error: {
          name: "The name is invalid.",
          email: "The email is invalid",
          username: "The username is invalid",
          password: "The password is invalid",
          confirmPassword: "The password confirmation is invalid",
        },
      },
      vi.fn(),
      false,
    ])

    render(<SignUpForm />)

    expect(screen.getByText(/The name is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The email is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The username is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The password is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The password confirmation is invalid/i)).toBeInTheDocument()
  })

  it("should show an error if the birthdate is invalid", () => {
    vi.mocked(useActionState).mockReturnValue([
      {
        success: false,
        error: {
          birthdate: "The birthdate is invalid.",
        },
      },
      vi.fn(),
      false,
    ])

    render(<SignUpForm />)

    expect(screen.getByText(/The birthdate is invalid/i)).toBeInTheDocument()
  })

  it("should show an error if passwords do not match", () => {
    vi.mocked(useActionState).mockReturnValue([
      {
        success: false,
        error: {
          confirmPassword: "The password and password confirmation do not match",
        },
      },
      vi.fn(),
      false,
    ])

    render(<SignUpForm />)

    expect(screen.getByText(/The password and password confirmation do not match/i)).toBeInTheDocument()
  })

  it("should disable the submit button when the form is submitting", () => {
    vi.mocked(useActionState).mockReturnValue([{ success: false, message: "" }, vi.fn(), true])

    render(<SignUpForm />)

    expect(screen.getByTestId("sign-up-submit-button")).toBeDisabled()
  })

  it("should display a success message on form submission success", () => {
    vi.mocked(useActionState).mockReturnValue([
      { success: true, message: "A confirmation email has been sent to john.doe@example.com." },
      vi.fn(),
      false,
    ])

    render(<SignUpForm />)

    expect(screen.getByText(/A confirmation email has been sent to john\.doe@example\.com/i)).toBeInTheDocument()
  })
})

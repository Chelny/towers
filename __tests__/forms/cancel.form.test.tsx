import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { render, screen } from "@testing-library/react"
import { CancelAccountForm } from "@/app/(protected)/account/cancel/cancel.form"
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

describe("Cancel Account Form", () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(mockRouter)
    vi.mocked(useActionState).mockReturnValue([{ success: false, message: "", error: {} }, vi.fn(), false])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should render the form with all elements", () => {
    render(<CancelAccountForm />)

    expect(screen.getByTestId("cancel-account-email-input")).toBeInTheDocument()
    expect(screen.getByTestId("cancel-account-submit-button")).toBeInTheDocument()
  })

  it("should have correct required properties for form fields", () => {
    render(<CancelAccountForm />)

    expect(screen.getByTestId("cancel-account-email-input")).toHaveAttribute("required")
  })

  it("should show error messages when submitting an empty form", () => {
    vi.mocked(useActionState).mockReturnValue([
      {
        success: false,
        error: {
          email: "The email is invalid",
        },
      },
      vi.fn(),
      false,
    ])

    render(<CancelAccountForm />)

    expect(screen.getByText(/The email is invalid/i)).toBeInTheDocument()
  })

  it("should disable the submit button when the form is submitting", () => {
    vi.mocked(useActionState).mockReturnValue([{ success: false, message: "" }, vi.fn(), true])

    render(<CancelAccountForm />)

    expect(screen.getByTestId("cancel-account-submit-button")).toBeDisabled()
  })

  it("should display a success message on form submission success", () => {
    vi.mocked(useActionState).mockReturnValue([
      {
        success: true,
        message:
          "Your account deletion request has been accepted. Your account will be permanently deleted after 30 days.",
      },
      vi.fn(),
      false,
    ])

    render(<CancelAccountForm />)

    expect(screen.getByText(/Your account deletion request has been accepted/i)).toBeInTheDocument()
  })
})

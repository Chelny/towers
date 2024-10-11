import { useFormState, useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { render, screen } from "@testing-library/react"
import { CancelAccountForm } from "@/app/(protected)/account/cancel/cancel.form"
import { mockRouter } from "@/vitest.setup"

vi.mock("next/navigation")

vi.mock("react-dom", () => ({
  useFormState: vi.fn(),
  useFormStatus: vi.fn()
}))

describe("Cancel Account Form", () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(mockRouter)
    vi.mocked(useFormState).mockReturnValue([{ success: false, message: "", error: {} }, vi.fn(), false])
    vi.mocked(useFormStatus).mockReturnValue({
      pending: false,
      data: null,
      method: null,
      action: null
    })
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
    vi.mocked(useFormState).mockReturnValue([
      {
        success: false,
        error: {
          email: "The email is invalid"
        }
      },
      vi.fn(),
      false
    ])

    render(<CancelAccountForm />)

    expect(screen.getByText(/The email is invalid/i)).toBeInTheDocument()
  })

  it("should disable the submit button when the form is submitting", () => {
    vi.mocked(useFormStatus).mockReturnValue({
      pending: true,
      data: new FormData(),
      method: "DELETE",
      action: "/api/account"
    })

    render(<CancelAccountForm />)

    expect(screen.getByTestId("cancel-account-submit-button")).toBeDisabled()
  })

  it("should display a success message on form submission success", () => {
    vi.mocked(useFormState).mockReturnValue([
      {
        success: true,
        message:
          "Your account deletion request has been accepted. Your account will be permanently deleted after 30 days."
      },
      vi.fn(),
      false
    ])

    render(<CancelAccountForm />)

    expect(screen.getByText(/Your account deletion request has been accepted/i)).toBeInTheDocument()
  })
})

import { useFormState, useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { render, screen } from "@testing-library/react"
import { AccountForm } from "@/app/(protected)/account/account.form"
import { mockedRouter } from "@/vitest.setup"

vi.mock("next/navigation")

vi.mock("react-dom", () => ({
  useFormState: vi.fn(),
  useFormStatus: vi.fn()
}))

describe("Account Form", () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(mockedRouter)
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
    render(<AccountForm />)

    expect(screen.getByTestId("account-delete-email-input")).toBeInTheDocument()
    expect(screen.getByTestId("account-delete-submit-button")).toBeInTheDocument()
  })

  it("should have correct required properties for form fields", () => {
    render(<AccountForm />)

    expect(screen.getByTestId("account-delete-email-input")).toHaveAttribute("required")
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

    render(<AccountForm />)

    expect(screen.getByText(/The email is invalid/i)).toBeInTheDocument()
  })

  it("should disable the submit button when the form is submitting", () => {
    vi.mocked(useFormStatus).mockReturnValue({
      pending: true,
      data: new FormData(),
      method: "DELETE",
      action: "/api/account"
    })

    render(<AccountForm />)

    expect(screen.getByTestId("account-delete-submit-button")).toBeDisabled()
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

    render(<AccountForm />)

    expect(screen.getByText(/Your account deletion request has been accepted/i)).toBeInTheDocument()
  })
})

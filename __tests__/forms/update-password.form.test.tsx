import { useFormState, useFormStatus } from "react-dom"
import { render, screen } from "@testing-library/react"
import { UpdatePasswordForm } from "@/app/(protected)/account/update-password/update-password.form"

vi.mock("react-dom", () => ({
  useFormState: vi.fn(),
  useFormStatus: vi.fn()
}))

describe("Update Password Form", () => {
  beforeEach(() => {
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
    render(<UpdatePasswordForm />)

    expect(screen.getByTestId("update-password-current-password-input")).toBeInTheDocument()
    expect(screen.getByTestId("update-password-new-password-input")).toBeInTheDocument()
    expect(screen.getByTestId("update-password-confirm-new-password-input")).toBeInTheDocument()
    expect(screen.getByTestId("update-password-submit-button")).toBeInTheDocument()
  })

  it("should have correct required properties for form fields", () => {
    render(<UpdatePasswordForm />)

    expect(screen.getByTestId("update-password-current-password-input")).toHaveAttribute("required")
    expect(screen.getByTestId("update-password-new-password-input")).toHaveAttribute("required")
    expect(screen.getByTestId("update-password-confirm-new-password-input")).toHaveAttribute("required")
  })

  it("should show error messages when submitting an empty form", () => {
    vi.mocked(useFormState).mockReturnValue([
      {
        success: false,
        error: {
          currentPassword: "The current password is invalid.",
          newPassword: "The new password is invalid.",
          confirmNewPassword: "The new password confirmation is invalid."
        }
      },
      vi.fn(),
      false
    ])

    render(<UpdatePasswordForm />)

    expect(screen.getByText(/The current password is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The new password is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The new password confirmation is invalid/i)).toBeInTheDocument()
  })

  it("should show an error if passwords do not match", () => {
    vi.mocked(useFormState).mockReturnValue([
      {
        success: false,
        error: {
          confirmNewPassword: "The new password and new password confirmation do not match."
        }
      },
      vi.fn(),
      false
    ])

    render(<UpdatePasswordForm />)

    expect(screen.getByText(/The new password and new password confirmation do not match/i)).toBeInTheDocument()
  })

  it("should disable the submit button when the form is submitting", () => {
    vi.mocked(useFormStatus).mockReturnValue({
      pending: true,
      data: new FormData(),
      method: "PATCH",
      action: "/api/account/update-password"
    })

    render(<UpdatePasswordForm />)

    expect(screen.getByTestId("update-password-submit-button")).toBeDisabled()
  })

  it("should display a success message on form submission success", () => {
    vi.mocked(useFormState).mockReturnValue([
      { success: true, message: "The password has been updated!" },
      vi.fn(),
      false
    ])

    render(<UpdatePasswordForm />)

    expect(screen.getByText(/The password has been updated/i)).toBeInTheDocument()
  })
})

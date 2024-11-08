import { useActionState } from "react"
import { render, screen } from "@testing-library/react"
import { UpdatePasswordForm } from "@/app/(protected)/account/update-password/update-password.form"

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

describe("Update Password Form", () => {
  beforeEach(() => {
    vi.mocked(useActionState).mockReturnValue([{ success: false, message: "", error: {} }, vi.fn(), false])
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
    vi.mocked(useActionState).mockReturnValue([
      {
        success: false,
        error: {
          currentPassword: "The current password is invalid.",
          newPassword: "The new password is invalid.",
          confirmNewPassword: "The new password confirmation is invalid.",
        },
      },
      vi.fn(),
      false,
    ])

    render(<UpdatePasswordForm />)

    expect(screen.getByText(/The current password is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The new password is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The new password confirmation is invalid/i)).toBeInTheDocument()
  })

  it("should show an error if passwords do not match", () => {
    vi.mocked(useActionState).mockReturnValue([
      {
        success: false,
        error: {
          confirmNewPassword: "The new password and new password confirmation do not match.",
        },
      },
      vi.fn(),
      false,
    ])

    render(<UpdatePasswordForm />)

    expect(screen.getByText(/The new password and new password confirmation do not match/i)).toBeInTheDocument()
  })

  it("should disable the submit button when the form is submitting", () => {
    vi.mocked(useActionState).mockReturnValue([{ success: false, message: "" }, vi.fn(), true])

    render(<UpdatePasswordForm />)

    expect(screen.getByTestId("update-password-submit-button")).toBeDisabled()
  })

  it("should display a success message on form submission success", () => {
    vi.mocked(useActionState).mockReturnValue([
      { success: true, message: "The password has been updated!" },
      vi.fn(),
      false,
    ])

    render(<UpdatePasswordForm />)

    expect(screen.getByText(/The password has been updated/i)).toBeInTheDocument()
  })
})

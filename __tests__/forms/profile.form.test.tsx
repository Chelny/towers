import { useFormState, useFormStatus } from "react-dom"
import { Gender } from "@prisma/client"
import { render, screen } from "@testing-library/react"
import { ProfileForm } from "@/app/(protected)/account/profile/profile.form"
import { useSessionData } from "@/hooks"

vi.mock("@/app/(protected)/account/profile/profile.actions", () => ({
  profile: vi.fn()
}))

describe("Sign Up Form", () => {
  const user = {
    name: "John Doe",
    gender: Gender.M,
    birthdate: new Date("2000-01-01"),
    email: "john.doe@example.com",
    username: "john.doe",
    accounts: []
  }

  const userWithLinkedAccounts = {
    ...user,
    accounts: [
      {
        provider: "google"
      }
    ]
  }

  it("should render the form with all elements", () => {
    render(<ProfileForm user={user} />)

    expect(screen.getByTestId("profile-name-input")).toBeInTheDocument()
    expect(screen.getByTestId("profile-gender-radio-group-M")).toBeInTheDocument()
    expect(screen.getByTestId("profile-gender-radio-group-F")).toBeInTheDocument()
    expect(screen.getByTestId("profile-gender-radio-group-X")).toBeInTheDocument()
    expect(screen.getByTestId("profile-birthdate-calendar")).toBeInTheDocument()
    expect(screen.getByTestId("profile-email-input")).toBeInTheDocument()
    expect(screen.getByTestId("profile-username-input")).toBeInTheDocument()
    expect(screen.getByTestId("profile-submit-button")).toBeInTheDocument()
  })

  it("should have correct required properties for form fields", () => {
    render(<ProfileForm user={user} />)

    expect(screen.getByTestId("profile-name-input")).toHaveAttribute("required")
    expect(screen.getByTestId("profile-gender-radio-group-M")).not.toHaveAttribute("required")
    expect(screen.getByTestId("profile-gender-radio-group-F")).not.toHaveAttribute("required")
    expect(screen.getByTestId("profile-gender-radio-group-X")).not.toHaveAttribute("required")
    expect(screen.getByTestId("profile-birthdate-calendar")).not.toHaveAttribute("required")
    expect(screen.getByTestId("profile-email-input")).toHaveAttribute("required")
    expect(screen.getByTestId("profile-username-input")).toHaveAttribute("required")
  })

  it("should have a read-only property on the email field when signed in using a third-party account", () => {
    render(<ProfileForm user={userWithLinkedAccounts} />)

    expect(screen.getByTestId("profile-email-input")).toHaveAttribute("readOnly")
  })

  it("should show error messages when submitting an empty form", () => {
    vi.mocked(useFormState).mockReturnValue([
      {
        success: false,
        errors: {
          name: "The name is invalid.",
          email: "The email is invalid.",
          username: "The username is invalid."
        }
      },
      vi.fn(),
      false
    ])

    render(<ProfileForm user={user} />)

    expect(screen.getByText(/The name is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The email is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The username is invalid/i)).toBeInTheDocument()
  })

  it("should show an error if the birthdate is invalid", () => {
    vi.mocked(useFormState).mockReturnValue([
      {
        success: false,
        errors: {
          birthdate: "The birthdate is invalid."
        }
      },
      vi.fn(),
      false
    ])

    render(<ProfileForm user={user} />)

    expect(screen.getByText(/The birthdate is invalid/i)).toBeInTheDocument()
  })

  it("should disable the submit button when the form is submitting", () => {
    vi.mocked(useFormStatus).mockReturnValue({
      pending: true,
      data: new FormData(),
      method: "POST",
      action: "/api/profile"
    })

    render(<ProfileForm user={user} />)

    expect(screen.getByTestId("profile-submit-button")).toBeDisabled()
  })

  it("should display a success message on form submission success", () => {
    const { update } = useSessionData()

    vi.mocked(useFormState).mockReturnValue([
      {
        success: true,
        message: "Your profile has been successfully updated!",
        data: {
          ...user,
          name: "Jane Doe",
          gender: Gender.F,
          email: "jane.doe@example.com",
          username: "jane.doe"
        }
      },
      vi.fn(),
      false
    ])

    render(<ProfileForm user={user} />)

    expect(screen.getByText(/Your profile has been successfully updated/i)).toBeInTheDocument()
    expect(update).toHaveBeenCalledWith({
      name: "Jane Doe",
      email: "jane.doe@example.com",
      username: "jane.doe",
      image: undefined
    })
  })
})

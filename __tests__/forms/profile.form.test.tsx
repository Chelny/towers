import { useActionState } from "react"
import { Account, IUserProfile, User } from "@prisma/client"
import { render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import { mockUnauthenticatedSession, mockUser1 } from "@/__mocks__/data/users"
import { ProfileForm } from "@/app/(protected)/account/profile/profile.form"
import { useSessionData } from "@/hooks/useSessionData"

const { useRouter, mockRouterPush } = vi.hoisted(() => {
  const mockRouterPush: Mock = vi.fn()

  return {
    useRouter: () => ({ push: mockRouterPush }),
    mockRouterPush,
  }
})

vi.mock("react", async (importActual) => {
  const actual = await importActual<typeof import("react")>()

  return {
    ...actual,
    useActionState: vi.fn(),
  }
})

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual("next/navigation")

  return {
    ...actual,
    useRouter,
  }
})

vi.mock("@/hooks/useSessionData", () => ({
  useSessionData: vi.fn(),
}))

vi.mock("@/app/(protected)/account/profile/profile.actions", () => ({
  profile: vi.fn(),
}))

describe("Sign Up Form", () => {
  const user: User & { accounts: Account[] } = {
    ...mockUser1,
    accounts: [],
  }

  const userWithLinkedAccounts: IUserProfile = {
    ...user,
    accounts: [
      {
        provider: "google",
      } as Account,
    ],
  }

  beforeEach(() => {
    vi.mocked(useActionState).mockReturnValue([{ success: false, message: "", error: {} }, vi.fn(), false])
    vi.mocked(useSessionData).mockReturnValue(mockUnauthenticatedSession)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should render the form with all elements", () => {
    render(<ProfileForm user={user} />)

    expect(screen.getByTestId("profile-name-input")).toBeInTheDocument()
    expect(screen.getByTestId("profile-birthdate-calendar")).toBeInTheDocument()
    expect(screen.getByTestId("profile-email-input")).toBeInTheDocument()
    expect(screen.getByTestId("profile-username-input")).toBeInTheDocument()
    expect(screen.getByTestId("profile-submit-button")).toBeInTheDocument()
  })

  it("should have correct required properties for form fields", () => {
    render(<ProfileForm user={user} />)

    expect(screen.getByTestId("profile-name-input")).toHaveAttribute("required")
    expect(screen.getByTestId("profile-birthdate-calendar")).not.toHaveAttribute("required")
    expect(screen.getByTestId("profile-email-input")).toHaveAttribute("required")
    expect(screen.getByTestId("profile-username-input")).toHaveAttribute("required")
  })

  it("should have a read-only property on the email field when signed in using a third-party account", () => {
    render(<ProfileForm user={userWithLinkedAccounts} />)

    expect(screen.getByTestId("profile-email-input")).toHaveAttribute("readOnly")
  })

  it("should show error messages when submitting an empty form", () => {
    vi.mocked(useActionState).mockReturnValue([
      {
        success: false,
        error: {
          name: "The name is invalid.",
          email: "The email is invalid.",
          username: "The username is invalid.",
        },
      },
      vi.fn(),
      false,
    ])

    render(<ProfileForm user={user} />)

    expect(screen.getByText(/The name is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The email is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The username is invalid/i)).toBeInTheDocument()
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

    render(<ProfileForm user={user} />)

    expect(screen.getByText(/The birthdate is invalid/i)).toBeInTheDocument()
  })

  it("should disable the submit button when the form is submitting", () => {
    vi.mocked(useActionState).mockReturnValue([{ success: false, message: "" }, vi.fn(), true])

    render(<ProfileForm user={user} />)

    expect(screen.getByTestId("profile-submit-button")).toBeDisabled()
  })

  it("should display a success message on form submission success", () => {
    const { update } = useSessionData()

    vi.mocked(useActionState).mockReturnValue([
      {
        success: true,
        message: "Your profile has been updated!",
        data: {
          ...user,
          name: "Jane Doe",
          email: "jane.doe@example.com",
          username: "jane.doe",
        },
      },
      vi.fn(),
      false,
    ])

    render(<ProfileForm user={user} />)

    expect(screen.getByText(/Your profile has been updated/i)).toBeInTheDocument()
    expect(update).toHaveBeenCalledWith({
      name: "Jane Doe",
      email: "jane.doe@example.com",
      username: "jane.doe",
      image: "https://example.com/avatar.jpg",
    })
  })
})

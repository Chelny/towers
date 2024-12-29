import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import { ProfileForm } from "@/app/[locale]/(protected)/account/profile/profile.form"
import { mockSession } from "@/test/data/users"
import { mockUseRouter } from "@/vitest.setup"

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => mockUseRouter),
}))

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    updateUser: vi.fn(),
  },
}))

describe("Sign Up Form", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render the form with all elements", () => {
    render(<ProfileForm session={mockSession.data} />)

    expect(screen.getByText(/Profile Information/i)).toBeInTheDocument()
    expect(screen.getByTestId("profile-name-input")).toBeInTheDocument()
    expect(screen.getByTestId("profile-birthdate-calendar")).toBeInTheDocument()
    expect(screen.getByTestId("profile-username-input")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Update Profile/i })).toBeInTheDocument()
  })

  it("should correctly mark form fields as required", () => {
    render(<ProfileForm session={mockSession.data} />)

    expect(screen.getByTestId("profile-name-input")).toHaveAttribute("required")
    expect(screen.getByTestId("profile-birthdate-calendar")).not.toHaveAttribute("required")
    expect(screen.getByTestId("profile-username-input")).toHaveAttribute("required")
  })

  it("should display error messages when the form is submitted with empty fields", () => {
    render(<ProfileForm session={mockSession.data} />)

    fireEvent.input(screen.getByTestId("profile-name-input"), { target: { value: "" } })
    fireEvent.input(screen.getByTestId("profile-username-input"), { target: { value: "" } })
    fireEvent.click(screen.getByRole("button", { name: /Update Profile/i }))

    expect(screen.getByText(/The name is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The username is invalid/i)).toBeInTheDocument()
  })

  it("should disable the submit button during form submission and show a success message on successful submission", async () => {
    const { authClient } = await import("@/lib/auth-client")
    const mockUpdateUser: Mock = authClient.updateUser as Mock

    mockUpdateUser.mockImplementation(async (_, callbacks) => {
      callbacks.onRequest()
      await new Promise((resolve) => setTimeout(resolve, 100))
      callbacks.onSuccess()
    })

    render(<ProfileForm session={mockSession.data} />)

    fireEvent.input(screen.getByTestId("profile-name-input"), { target: { value: "John Doe" } })
    fireEvent.input(screen.getByTestId("profile-username-input"), { target: { value: "john.doe" } })

    const submitButton: HTMLButtonElement = screen.getByRole("button", { name: /Update Profile/i })
    fireEvent.click(submitButton)

    expect(submitButton).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByText(/Your profile has been updated/i)).toBeInTheDocument()
    })
  })
})

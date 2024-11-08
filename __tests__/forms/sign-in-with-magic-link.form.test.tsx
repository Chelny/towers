import { useActionState } from "react"
import { render, screen } from "@testing-library/react"
import { SignInWithMagicLinkForm } from "@/app/(auth)/sign-in-with-magic-link/sign-in-with-magic-link.form"

vi.mock("react", () => ({
  useActionState: vi.fn(),
}))

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

describe("Sign In with Magic Link Form", () => {
  beforeEach(() => {
    vi.mocked(useActionState).mockReturnValue([{ success: false, message: "", error: {} }, vi.fn(), false])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should render the form with all elements", () => {
    render(<SignInWithMagicLinkForm />)

    expect(screen.getByTestId("sign-in-with-magic-link-email-input")).toBeInTheDocument()
    expect(screen.getByTestId("sign-in-with-magic-link-submit-button")).toBeInTheDocument()
  })

  it("should have correct required properties for form fields", () => {
    render(<SignInWithMagicLinkForm />)

    expect(screen.getByTestId("sign-in-with-magic-link-email-input")).toHaveAttribute("required")
  })

  it("should show error messages when submitting an empty form", () => {
    vi.mocked(useActionState).mockReturnValue([{ success: false, message: "The email is invalid." }, vi.fn(), false])

    render(<SignInWithMagicLinkForm />)

    expect(screen.getByText(/The email is invalid/i)).toBeInTheDocument()
  })

  it("should disable the submit and social buttons when the form is submitting", () => {
    vi.mocked(useActionState).mockReturnValue([{ success: false, message: "" }, vi.fn(), true])

    render(<SignInWithMagicLinkForm />)

    expect(screen.getByTestId("sign-in-with-magic-link-submit-button")).toBeDisabled()
  })
})

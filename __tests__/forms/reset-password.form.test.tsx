import { useActionState } from "react"
import { render, screen } from "@testing-library/react"
import { ResetPasswordForm } from "@/app/(auth)/reset-password/reset-password.form"

const { useSearchParams, mockSearchParams } = vi.hoisted(() => {
  const mockSearchParams = {
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    toString: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    entries: vi.fn(),
    forEach: vi.fn(),
    append: vi.fn(),
    delete: vi.fn(),
    set: vi.fn(),
    sort: vi.fn(),
    [Symbol.iterator]: vi.fn(),
  }

  return {
    useSearchParams: () => mockSearchParams,
    mockSearchParams,
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
    useSearchParams,
  }
})

vi.mock("resend", () => {
  return {
    Resend: vi.fn().mockImplementation(() => ({
      send: vi.fn().mockResolvedValue({}),
    })),
  }
})

describe("Reset Password Form", () => {
  beforeEach(() => {
    vi.mocked(useActionState).mockReturnValue([{ success: false, message: "", error: {} }, vi.fn(), false])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should render the form with all elements", () => {
    render(<ResetPasswordForm />)

    expect(screen.getByTestId("reset-password-password-input")).toBeInTheDocument()
    expect(screen.getByTestId("reset-password-confirm-password-input")).toBeInTheDocument()
    expect(screen.getByTestId("reset-password-token-input")).toBeInTheDocument()
  })

  it("should pass the token from URL params to the hidden input field", () => {
    const token: string = "d457775d-9123-4922-84de-cf535a63484e"

    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === "token") return token
      return null
    })

    render(<ResetPasswordForm />)

    expect(screen.getByTestId("reset-password-token-input")).toHaveValue("d457775d-9123-4922-84de-cf535a63484e")
  })

  it("should show an error for invalid password format", () => {
    vi.mocked(useActionState).mockReturnValue([
      { success: false, error: { password: "The password is invalid." } },
      vi.fn(),
      false,
    ])

    render(<ResetPasswordForm />)

    expect(screen.getByText(/The password is invalid/i)).toBeInTheDocument()
  })

  it("should disable the submit button when the form is submitting", () => {
    vi.mocked(useActionState).mockReturnValue([{ success: false, message: "" }, vi.fn(), true])

    render(<ResetPasswordForm />)

    expect(screen.getByTestId("reset-password-submit-button")).toBeDisabled()
  })

  it("should display a success message on form submission success", () => {
    vi.mocked(useActionState).mockReturnValue([
      { success: true, message: "The password has been updated!" },
      vi.fn(),
      false,
    ])

    render(<ResetPasswordForm />)

    expect(screen.getByText(/The password has been updated/i)).toBeInTheDocument()
  })
})

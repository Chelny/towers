import { useFormState, useFormStatus } from "react-dom"
import { render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import { UpdateEmailForm } from "@/app/(auth)/update-email/update-email.form"

const { useRouter, mockedRouterPush, useSearchParams, mockedSearchParams } = vi.hoisted(() => {
  const mockedRouterPush: Mock = vi.fn()
  const mockedSearchParams = {
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
    [Symbol.iterator]: vi.fn()
  }

  return {
    useRouter: () => ({ push: mockedRouterPush }),
    mockedRouterPush,
    useSearchParams: () => mockedSearchParams,
    mockedSearchParams
  }
})

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual("next/navigation")

  return {
    ...actual,
    useRouter,
    useSearchParams
  }
})

vi.mock("react-dom", () => ({
  useFormState: vi.fn(),
  useFormStatus: vi.fn()
}))

describe("Update Email Form", () => {
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
    render(<UpdateEmailForm />)

    expect(screen.getByTestId("update-email-spinner-icon")).toBeInTheDocument()
    expect(screen.getByTestId("update-email-token-input")).toBeInTheDocument()
  })

  it("should pass the email and token from URL params to the hidden input fields", () => {
    const token: string = "YjY1ZWYwYzEtYWU2My00YWIwLTljZmQtMzcxYjdiY2UwODRifGNoZWxueTFAZXhhbXBsZS5kZXY="

    mockedSearchParams.get.mockImplementation((key: string) => {
      if (key === "token") return token
      return null
    })

    render(<UpdateEmailForm />)

    const tokenInput: HTMLInputElement = screen.getByTestId("update-email-token-input")
    expect(tokenInput).toHaveValue(token)
  })

  it("should show error message if the verification link is invalid", () => {
    vi.mocked(useFormState).mockReturnValue([
      { success: false, message: "The verification link is invalid!" },
      vi.fn(),
      false
    ])

    render(<UpdateEmailForm />)

    expect(screen.queryByTestId("update-email-spinner-icon")).not.toBeInTheDocument()
    expect(screen.getByText(/The verification link is invalid/i)).toBeInTheDocument()
  })

  it("should display a success message if email update is successful", () => {
    vi.mocked(useFormState).mockReturnValue([{ success: true, message: "The email has been updated!" }, vi.fn(), false])

    render(<UpdateEmailForm />)

    expect(screen.queryByTestId("update-email-spinner-icon")).not.toBeInTheDocument()
    expect(screen.getByText(/The email has been updated/i)).toBeInTheDocument()
    expect(screen.getByTestId("update-email-profile-button")).toBeInTheDocument()
  })
})

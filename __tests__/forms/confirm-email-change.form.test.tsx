import { useActionState } from "react"
import { render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import { ConfirmEmailChangeForm } from "@/app/(auth)/confirm-email-change/confirm-email-change.form"

const { useRouter, mockRouterPush, useSearchParams, mockSearchParams } = vi.hoisted(() => {
  const mockRouterPush: Mock = vi.fn()
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
    useRouter: () => ({ push: mockRouterPush }),
    mockRouterPush,
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
    useRouter,
    useSearchParams,
  }
})

describe("Update Email Form", () => {
  beforeEach(() => {
    vi.mocked(useActionState).mockReturnValue([{ success: false, message: "", error: {} }, vi.fn(), false])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should render the form with all elements", () => {
    render(<ConfirmEmailChangeForm />)

    expect(screen.getByTestId("confirm-email-change-spinner-icon")).toBeInTheDocument()
    expect(screen.getByTestId("confirm-email-change-token-input")).toBeInTheDocument()
  })

  it("should pass the email and token from URL params to the hidden input fields", () => {
    const token: string = "YjY1ZWYwYzEtYWU2My00YWIwLTljZmQtMzcxYjdiY2UwODRifGNoZWxueTFAZXhhbXBsZS5kZXY="

    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === "token") return token
      return null
    })

    render(<ConfirmEmailChangeForm />)

    const tokenInput: HTMLInputElement = screen.getByTestId("confirm-email-change-token-input")
    expect(tokenInput).toHaveValue(token)
  })

  it("should show error message if the verification link is invalid", () => {
    vi.mocked(useActionState).mockReturnValue([
      { success: false, message: "The verification link is invalid!" },
      vi.fn(),
      false,
    ])

    render(<ConfirmEmailChangeForm />)

    expect(screen.queryByTestId("confirm-email-change-spinner-icon")).not.toBeInTheDocument()
    expect(screen.getByText(/The verification link is invalid/i)).toBeInTheDocument()
  })

  it("should display a success message if email update is successful", () => {
    vi.mocked(useActionState).mockReturnValue([
      { success: true, message: "The email has been updated!" },
      vi.fn(),
      false,
    ])

    render(<ConfirmEmailChangeForm />)

    expect(screen.queryByTestId("confirm-email-change-spinner-icon")).not.toBeInTheDocument()
    expect(screen.getByText(/The email has been updated/i)).toBeInTheDocument()
    expect(screen.getByTestId("confirm-email-change-profile-button")).toBeInTheDocument()
  })
})

import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import { SignUpForm } from "@/app/[locale]/(auth)/sign-up/sign-up.form"
import { ROUTE_SIGN_IN } from "@/constants/routes"

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signUp: {
      email: vi.fn(),
    },
  },
}))

describe("Sign Up Form", () => {
  it("should display the sign-in link", () => {
    render(<SignUpForm locale="en" />)

    const signUpLink: HTMLElement = screen.getByTestId("sign-up-sign-in-link")
    expect(signUpLink).toBeInTheDocument()
    expect(signUpLink).toHaveAttribute("href", ROUTE_SIGN_IN.PATH)
  })

  it("should render the form with all elements", () => {
    render(<SignUpForm locale="en" />)

    expect(screen.getByTestId("sign-up-name-input")).toBeInTheDocument()
    expect(screen.getByTestId("sign-up-birthdate-calendar")).toBeInTheDocument()
    expect(screen.getByTestId("sign-up-email-input")).toBeInTheDocument()
    expect(screen.getByTestId("sign-up-username-input")).toBeInTheDocument()
    expect(screen.getByTestId("sign-up-password-input")).toBeInTheDocument()
    expect(screen.getByTestId("sign-up-confirm-password-input")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Sign Up/i })).toBeInTheDocument()
  })

  it("should apply correct required properties to form fields", () => {
    render(<SignUpForm locale="en" />)

    expect(screen.getByTestId("sign-up-name-input")).toHaveAttribute("required")
    expect(screen.getByTestId("sign-up-birthdate-calendar")).not.toHaveAttribute("required")
    expect(screen.getByTestId("sign-up-email-input")).toHaveAttribute("required")
    expect(screen.getByTestId("sign-up-username-input")).toHaveAttribute("required")
    expect(screen.getByTestId("sign-up-password-input")).toHaveAttribute("required")
    expect(screen.getByTestId("sign-up-confirm-password-input")).toHaveAttribute("required")
  })

  it("should display error messages when submitting an empty form", () => {
    render(<SignUpForm locale="en" />)

    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }))

    expect(screen.getByText(/Validation errors occurred/i)).toBeInTheDocument()
    expect(screen.getByText(/The name is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The email is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The username is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The password is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The password confirmation is invalid/i)).toBeInTheDocument()
  })

  it("should display error messages for invalid required fields", () => {
    render(<SignUpForm locale="en" />)

    fireEvent.input(screen.getByTestId("sign-up-name-input"), { target: { value: "John Doe #1" } })
    fireEvent.input(screen.getByTestId("sign-up-email-input"), { target: { value: "john.doe@@example.com" } })
    fireEvent.input(screen.getByTestId("sign-up-username-input"), { target: { value: "john_doe." } })
    fireEvent.input(screen.getByTestId("sign-up-password-input"), { target: { value: "Password!" } })
    fireEvent.input(screen.getByTestId("sign-up-confirm-password-input"), { target: { value: "Password!" } })
    fireEvent.click(screen.getByTestId("sign-up-terms-and-conditions-checkbox"))
    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }))

    expect(screen.getByText(/Validation errors occurred/i)).toBeInTheDocument()
    expect(screen.getByText(/The name is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The email is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The username is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The password is invalid/i)).toBeInTheDocument()
    expect(screen.getByText(/The password confirmation is invalid/i)).toBeInTheDocument()
  })

  it("should display error messages if passwords do not match", () => {
    render(<SignUpForm locale="en" />)

    fireEvent.input(screen.getByTestId("sign-up-name-input"), { target: { value: "John Doe" } })
    fireEvent.input(screen.getByTestId("sign-up-email-input"), { target: { value: "john.doe@example.com" } })
    fireEvent.input(screen.getByTestId("sign-up-username-input"), { target: { value: "john_doe" } })
    fireEvent.input(screen.getByTestId("sign-up-password-input"), { target: { value: "Password123!" } })
    fireEvent.input(screen.getByTestId("sign-up-confirm-password-input"), { target: { value: "Password1234!" } })
    fireEvent.click(screen.getByTestId("sign-up-terms-and-conditions-checkbox"))
    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }))

    expect(screen.getByText(/Validation errors occurred/i)).toBeInTheDocument()
    expect(screen.getByText(/The password and password confirmation do not match/i)).toBeInTheDocument()
  })

  it("should disable the submit button during form submission and show a success message on successful submission", async () => {
    const { authClient } = await import("@/lib/auth-client")
    const mockSignUpEmail: Mock = authClient.signUp.email as Mock

    mockSignUpEmail.mockImplementation(async (_, callbacks) => {
      callbacks.onRequest()
      await new Promise((resolve) => setTimeout(resolve, 100))
      callbacks.onSuccess()
    })

    render(<SignUpForm locale="en" />)

    fireEvent.input(screen.getByTestId("sign-up-name-input"), { target: { value: "John Doe" } })
    fireEvent.input(screen.getByTestId("sign-up-email-input"), { target: { value: "john.doe@example.com" } })
    fireEvent.input(screen.getByTestId("sign-up-username-input"), { target: { value: "john.doe" } })
    fireEvent.input(screen.getByTestId("sign-up-password-input"), { target: { value: "Password123!" } })
    fireEvent.input(screen.getByTestId("sign-up-confirm-password-input"), { target: { value: "Password123!" } })
    fireEvent.click(screen.getByTestId("sign-up-terms-and-conditions-checkbox"))

    const submitButton: HTMLButtonElement = screen.getByRole("button", { name: /Sign Up/i })
    fireEvent.click(submitButton)

    expect(submitButton).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByText(/A confirmation email has been sent to john\.doe@example\.com/i)).toBeInTheDocument()
    })
  })
})

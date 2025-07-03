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

    const signUpLink: HTMLElement = screen.getByTestId("sign-up_link_sign-in")
    expect(signUpLink).toBeInTheDocument()
    expect(signUpLink).toHaveAttribute("href", ROUTE_SIGN_IN.PATH)
  })

  it("should render the form with all elements", () => {
    render(<SignUpForm locale="en" />)

    expect(screen.getByTestId("sign-up_input-text_name")).toBeInTheDocument()
    expect(screen.getByTestId("sign-up_input-date_birthdate")).toBeInTheDocument()
    expect(screen.getByTestId("sign-up_input-email_email")).toBeInTheDocument()
    expect(screen.getByTestId("sign-up_input-text_username")).toBeInTheDocument()
    expect(screen.getByTestId("sign-up_input-password_password")).toBeInTheDocument()
    expect(screen.getByTestId("sign-up_input-password_confirm-password")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Sign Up/i })).toBeInTheDocument()
  })

  it("should apply correct required properties to form fields", () => {
    render(<SignUpForm locale="en" />)

    expect(screen.getByTestId("sign-up_input-text_name")).toHaveAttribute("required")
    expect(screen.getByTestId("sign-up_input-date_birthdate")).not.toHaveAttribute("required")
    expect(screen.getByTestId("sign-up_input-email_email")).toHaveAttribute("required")
    expect(screen.getByTestId("sign-up_input-text_username")).toHaveAttribute("required")
    expect(screen.getByTestId("sign-up_input-password_password")).toHaveAttribute("required")
    expect(screen.getByTestId("sign-up_input-password_confirm-password")).toHaveAttribute("required")
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

    fireEvent.input(screen.getByTestId("sign-up_input-text_name"), { target: { value: "John Doe #1" } })
    fireEvent.input(screen.getByTestId("sign-up_input-email_email"), { target: { value: "john.doe@@example.com" } })
    fireEvent.input(screen.getByTestId("sign-up_input-text_username"), { target: { value: "john_doe." } })
    fireEvent.input(screen.getByTestId("sign-up_input-password_password"), { target: { value: "Password!" } })
    fireEvent.input(screen.getByTestId("sign-up_input-password_confirm-password"), { target: { value: "Password!" } })
    fireEvent.click(screen.getByTestId("sign-up_checkbox_terms-and-conditions"))
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

    fireEvent.input(screen.getByTestId("sign-up_input-text_name"), { target: { value: "John Doe" } })
    fireEvent.input(screen.getByTestId("sign-up_input-email_email"), { target: { value: "john.doe@example.com" } })
    fireEvent.input(screen.getByTestId("sign-up_input-text_username"), { target: { value: "john_doe" } })
    fireEvent.input(screen.getByTestId("sign-up_input-password_password"), { target: { value: "Password123!" } })
    fireEvent.input(screen.getByTestId("sign-up_input-password_confirm-password"), {
      target: { value: "Password1234!" },
    })
    fireEvent.click(screen.getByTestId("sign-up_checkbox_terms-and-conditions"))
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

    fireEvent.input(screen.getByTestId("sign-up_input-text_name"), { target: { value: "John Doe" } })
    fireEvent.input(screen.getByTestId("sign-up_input-email_email"), { target: { value: "john.doe@example.com" } })
    fireEvent.input(screen.getByTestId("sign-up_input-text_username"), { target: { value: "john.doe" } })
    fireEvent.input(screen.getByTestId("sign-up_input-password_password"), { target: { value: "Password123!" } })
    fireEvent.input(screen.getByTestId("sign-up_input-password_confirm-password"), {
      target: { value: "Password123!" },
    })
    fireEvent.click(screen.getByTestId("sign-up_checkbox_terms-and-conditions"))

    const submitButton: HTMLButtonElement = screen.getByRole("button", { name: /Sign Up/i })
    fireEvent.click(submitButton)

    expect(submitButton).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByText(/A confirmation email has been sent to john\.doe@example\.com/i)).toBeInTheDocument()
    })
  })
})

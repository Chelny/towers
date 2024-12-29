import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import Input from "@/components/ui/Input"

describe("Input Component", () => {
  it("should render input with label and placeholder", () => {
    render(<Input id="test-input" label="Username" placeholder="Enter username" required />)

    expect(screen.getByLabelText("Username")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Enter username")).toBeInTheDocument()
  })

  it("should display default value", () => {
    render(<Input id="test-input" label="Username" defaultValue="john.doe" required />)

    const input: HTMLInputElement = screen.getByLabelText("Username")
    expect(input).toHaveValue("john.doe")
  })

  it("should update value when typing", () => {
    const handleChange: Mock = vi.fn()

    render(<Input id="test-input" label="Username" dataTestId="test-input" onInput={handleChange} />)

    const input: HTMLInputElement = screen.getByTestId("test-input")
    fireEvent.input(input, { target: { value: "john.doe" } })

    expect(handleChange).toHaveBeenCalled()
    expect(input).toHaveValue("john.doe")
  })

  it("should call onPaste event when content is pasted", () => {
    const handlePaste: Mock = vi.fn()

    render(<Input id="test-input" label="Username" required onPaste={handlePaste} />)

    const input: HTMLInputElement = screen.getByLabelText("Username")
    fireEvent.paste(input, { clipboardData: { getData: () => "test" } })

    expect(handlePaste).toHaveBeenCalled()
  })

  it("should be disabled when disabled prop is passed", () => {
    render(<Input id="test-input" label="Username" required disabled />)

    const input: HTMLInputElement = screen.getByLabelText("Username")
    expect(input).toBeDisabled()
  })

  it("should toggle password visibility when the eye icon is clicked", () => {
    render(<Input type="password" id="test-password" label="Password" required />)

    const input: HTMLInputElement = screen.getByLabelText("Password")
    const toggleButton: HTMLButtonElement = screen.getByRole("button", { name: /show password/i })

    expect(input).toHaveAttribute("type", "password")

    fireEvent.click(toggleButton)

    expect(input).toHaveAttribute("type", "text")

    fireEvent.click(toggleButton)

    expect(input).toHaveAttribute("type", "password")
  })
})

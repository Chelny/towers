import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import Input from "@/components/ui/Input"

describe("Input Component", () => {
  it("should render input with label and placeholder", () => {
    render(<Input id="test-input" label="Username" placeholder="Enter username" />)

    expect(screen.getByLabelText("Username (optional)")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Enter username")).toBeInTheDocument()
  })

  it("should display default value", () => {
    render(<Input id="test-input" label="Username" defaultValue="john.doe" />)

    const input: HTMLInputElement = screen.getByLabelText("Username (optional)")
    expect(input).toHaveValue("john.doe")
  })

  it("should update value when typing", () => {
    const handleChange: Mock = vi.fn()

    render(<Input id="test-input" label="Username" dataTestId="test-input" onInput={handleChange} />)

    const input: HTMLInputElement = screen.getByTestId("test-input")
    fireEvent.input(input, { target: { value: "john.doe" } })

    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(input).toHaveValue("john.doe")
  })

  it("should call onPaste event when content is pasted", () => {
    const handlePaste: Mock = vi.fn()

    render(<Input id="test-input" label="Username" onPaste={handlePaste} />)

    const input: HTMLInputElement = screen.getByLabelText("Username (optional)")
    fireEvent.paste(input, { clipboardData: { getData: () => "test" } })

    expect(handlePaste).toHaveBeenCalledTimes(1)
  })

  it("should be disabled when disabled prop is passed", () => {
    render(<Input id="test-input" label="Username" disabled />)

    const input: HTMLInputElement = screen.getByLabelText("Username (optional)")
    expect(input).toBeDisabled()
  })
})

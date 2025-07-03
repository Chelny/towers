import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import RadioButton from "@/components/ui/RadioButton"

describe("RadioButton", () => {
  it("should render radio button with label", () => {
    render(<RadioButton id="test-radio" label="Option 1" name="group1" value="1" />)

    expect(screen.getByLabelText("Option 1")).toBeInTheDocument()
  })

  it("should call onChange when clicked", () => {
    const handleChange: Mock = vi.fn()

    render(<RadioButton id="test-radio" label="Option 1" name="group1" value="1" onChange={handleChange} />)

    fireEvent.click(screen.getByRole("radio"))
    expect(handleChange).toHaveBeenCalled()
  })

  it("should be disabled when disabled prop is passed", () => {
    render(<RadioButton id="test-radio" label="Option 1" name="group1" value="1" disabled />)

    const radio: HTMLInputElement = screen.getByRole("radio")
    expect(radio).toBeDisabled()
  })
})

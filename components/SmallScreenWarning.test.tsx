import { render, screen } from "@testing-library/react"
import SmallScreenWarning from "@/components/SmallScreenWarning"

describe("SmallScreenWarning Component", () => {
  it("should render warning message", () => {
    render(<SmallScreenWarning />)

    expect(screen.getByText(/Screen Too Small/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Resize the window.*\d+px by \d+px.*or use a computer for a better experience/i),
    ).toBeInTheDocument()
  })
})

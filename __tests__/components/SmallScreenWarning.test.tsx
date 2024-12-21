import { render, screen } from "@testing-library/react"
import SmallScreenWarning from "@/components/SmallScreenWarning"

describe("SmallScreenWarning Component", () => {
  it("should render warning message", () => {
    render(<SmallScreenWarning />)

    expect(screen.getByText("Screen Too Small")).toBeInTheDocument()
    expect(screen.getByText(/Resize the window \(recommended size: 1275px by 768px\)/)).toBeInTheDocument()
  })
})

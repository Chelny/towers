import { render, screen } from "@testing-library/react"
import RegularBlock from "@/components/towers/RegularBlock"

describe("RegularBlock", () => {
  it("should render the letter inside the block", () => {
    render(<RegularBlock letter="T" />)

    expect(screen.getByText("T")).toBeInTheDocument()
  })

  it("should render nothing when no letter is provided", () => {
    render(<RegularBlock />)

    expect(screen.queryByText("O")).not.toBeInTheDocument()
  })
})

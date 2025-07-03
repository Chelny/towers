import { render, screen } from "@testing-library/react"
import SpecialDiamondBlock from "@/components/towers/SpecialDiamondBlock"
import { SpecialDiamond } from "@/interfaces/towers"

describe("SpecialDiamondBlock", () => {
  it("should render the speed drop diamond", () => {
    const mockSpecialDiamond: SpecialDiamond = { letter: "SD", powerType: "speed drop" }

    render(<SpecialDiamondBlock block={mockSpecialDiamond} />)

    const diamond: HTMLDivElement = screen.getByTestId("special-diamond_speed-drop")
    expect(diamond).toBeInTheDocument()
  })

  it("should render the remove powers diamond", () => {
    const mockSpecialDiamond: SpecialDiamond = { letter: "SD", powerType: "remove powers" }

    render(<SpecialDiamondBlock block={mockSpecialDiamond} />)

    const diamond: HTMLDivElement = screen.getByTestId("special-diamond_remove-powers")
    expect(diamond).toBeInTheDocument()
  })

  it("should render the generic remove stones diamond", () => {
    const mockSpecialDiamond: SpecialDiamond = { letter: "SD", powerType: "remove stones" }

    render(<SpecialDiamondBlock block={mockSpecialDiamond} />)

    const diamond: HTMLDivElement = screen.getByTestId("special-diamond_remove-stones")
    expect(diamond).toBeInTheDocument()
  })
})

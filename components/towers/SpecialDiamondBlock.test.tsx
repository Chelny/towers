import { render, screen } from "@testing-library/react"
import SpecialDiamondBlock from "@/components/towers/SpecialDiamondBlock"
import { SpecialDiamond } from "@/interfaces/game"
import { mockDefaultTowersBlockProps } from "@/test/data/board"

describe("SpecialDiamondBlock Component", () => {
  it("should render the speed drop diamond", () => {
    const mockSpecialDiamond: SpecialDiamond = {
      ...mockDefaultTowersBlockProps,
      letter: "SD",
      specialDiamondType: "speed drop",
    }

    render(<SpecialDiamondBlock block={mockSpecialDiamond} />)

    const diamond: HTMLDivElement = screen.getByTestId("special-diamond-speed-drop")
    expect(diamond).toBeInTheDocument()
  })

  it("should render the remove powers diamond", () => {
    const mockSpecialDiamond: SpecialDiamond = {
      ...mockDefaultTowersBlockProps,
      letter: "SD",
      specialDiamondType: "remove powers",
    }

    render(<SpecialDiamondBlock block={mockSpecialDiamond} />)

    const diamond: HTMLDivElement = screen.getByTestId("special-diamond-remove-powers")
    expect(diamond).toBeInTheDocument()
  })

  it("should render the generic remove stones diamond", () => {
    const mockSpecialDiamond: SpecialDiamond = {
      ...mockDefaultTowersBlockProps,
      letter: "SD",
      specialDiamondType: "remove stones",
    }

    render(<SpecialDiamondBlock block={mockSpecialDiamond} />)

    const diamond: HTMLDivElement = screen.getByTestId("special-diamond-remove-stones")
    expect(diamond).toBeInTheDocument()
  })
})

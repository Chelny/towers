import { render, screen } from "@testing-library/react"
import SpecialDiamondBlock from "@/components/game/SpecialDiamondBlock"
import { SpecialDiamond } from "@/interfaces/game"
import { mockedDefaultTowersBlockProps } from "@/vitest.setup"

describe("SpecialDiamondBlock Component", () => {
  it("should render the speed drop diamond", () => {
    const mockedSpecialDiamond: SpecialDiamond = {
      ...mockedDefaultTowersBlockProps,
      letter: "SD",
      specialDiamondType: "speed drop"
    }

    render(<SpecialDiamondBlock block={mockedSpecialDiamond} />)

    const diamond: HTMLDivElement = screen.getByTestId("special-diamond-speed-drop")
    expect(diamond).toBeInTheDocument()
  })

  it("should render the remove powers diamond", () => {
    const mockedSpecialDiamond: SpecialDiamond = {
      ...mockedDefaultTowersBlockProps,
      letter: "SD",
      specialDiamondType: "remove powers"
    }

    render(<SpecialDiamondBlock block={mockedSpecialDiamond} />)

    const diamond: HTMLDivElement = screen.getByTestId("special-diamond-remove-powers")
    expect(diamond).toBeInTheDocument()
  })

  it("should render the generic remove stones diamond", () => {
    const mockedSpecialDiamond: SpecialDiamond = {
      ...mockedDefaultTowersBlockProps,
      letter: "SD",
      specialDiamondType: "remove stones"
    }

    render(<SpecialDiamondBlock block={mockedSpecialDiamond} />)

    const diamond: HTMLDivElement = screen.getByTestId("special-diamond-remove-stones")
    expect(diamond).toBeInTheDocument()
  })
})

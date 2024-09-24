import { render, screen } from "@testing-library/react"
import GridCell from "@/components/game/GridCell"
import { BoardBlock } from "@/interfaces/game"
import { mockedDefaultTowersBlockProps } from "@/vitest.setup"

describe("GridCell Component", () => {
  it("should apply the correct styles for defense block", () => {
    const defenseBlock: BoardBlock = { ...mockedDefaultTowersBlockProps, letter: "T", powerType: "defense" }

    render(<GridCell block={defenseBlock} />)

    const cells: HTMLDivElement[] = screen.getAllByText("T")
    const cellsParent: HTMLElement | null = cells[0].parentElement

    expect(cellsParent?.getAttribute("class")).toContain("DefenseBlock")
  })

  it("should apply the correct styles for attack block", () => {
    const attackBlock: BoardBlock = { ...mockedDefaultTowersBlockProps, letter: "O", powerType: "attack" }

    render(<GridCell block={attackBlock} />)

    const cell: HTMLDivElement = screen.getByText("O")

    expect(screen.queryByText("O")).toBeInTheDocument()
    expect(cell.getAttribute("class")).toContain("AttackBlock")
  })

  it("should render RegularBlock when block is not a defense type", () => {
    const regularBlock: BoardBlock = { ...mockedDefaultTowersBlockProps, letter: "W" }

    render(<GridCell block={regularBlock} />)

    const cells: HTMLDivElement[] = screen.getAllByText("W")
    const cellsParent: HTMLElement | null = cells[0].parentElement

    expect(screen.queryByText("W")).toBeInTheDocument()
    expect(cellsParent?.classList).not.toContain("DefenseBlock")
    expect(cellsParent?.classList).not.toContain("AttackBlock")
  })
})

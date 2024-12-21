import { render, screen } from "@testing-library/react"
import { mockDefaultTowersBlockProps } from "@/__mocks__/data/board"
import GridCell from "@/components/towers/GridCell"
import { BoardBlock } from "@/interfaces/game"

describe("GridCell Component", () => {
  it("should apply the correct styles for defense block", () => {
    const defenseBlock: BoardBlock = { ...mockDefaultTowersBlockProps, letter: "T", powerType: "defense" }

    render(<GridCell block={defenseBlock} />)

    const cells: HTMLDivElement[] = screen.getAllByText("T")
    const cellsParent: HTMLElement | null = cells[0].parentElement

    expect(cellsParent?.getAttribute("class")).toContain("defense-block")
  })

  it("should apply the correct styles for attack block", () => {
    const attackBlock: BoardBlock = { ...mockDefaultTowersBlockProps, letter: "O", powerType: "attack" }

    render(<GridCell block={attackBlock} />)

    const cell: HTMLDivElement = screen.getByText("O")

    expect(screen.queryByText("O")).toBeInTheDocument()
    expect(cell.getAttribute("class")).toContain("attack-block")
  })

  it("should render RegularBlock when block is not a defense type", () => {
    const regularBlock: BoardBlock = { ...mockDefaultTowersBlockProps, letter: "W" }

    render(<GridCell block={regularBlock} />)

    const cells: HTMLDivElement[] = screen.getAllByText("W")
    const cellsParent: HTMLElement | null = cells[0].parentElement

    expect(screen.queryByText("W")).toBeInTheDocument()
    expect(cellsParent?.classList).not.toContain("defense-block")
    expect(cellsParent?.classList).not.toContain("attack-block")
  })
})

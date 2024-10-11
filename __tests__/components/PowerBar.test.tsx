import { render, screen } from "@testing-library/react"
import { mockDefaultTowersBlockProps } from "@/__mocks__/data/board"
import PowerBar from "@/components/towers/PowerBar"
import { PowerBarBlock } from "@/interfaces/game"

describe("PowerBar Component", () => {
  const mockBlocks: PowerBarBlock[] = [
    { ...mockDefaultTowersBlockProps, letter: "T", powerType: "defense", powerLevel: "minor" },
    { ...mockDefaultTowersBlockProps, letter: "O", powerType: "attack", powerLevel: "minor" },
    { letter: "SD", specialDiamondType: "speed drop" }
  ]

  it("should render all blocks in the power bar", () => {
    render(<PowerBar blocks={mockBlocks} />)

    const defenseBlocks: HTMLDivElement[] = screen.getAllByText("T")
    expect(defenseBlocks).toHaveLength(4)

    const attackBlock: HTMLDivElement = screen.getByText("O")
    expect(attackBlock).toBeInTheDocument()

    const specialDiamondBlock: HTMLDivElement = screen.getByTestId("special-diamond-speed-drop")
    expect(specialDiamondBlock).toBeInTheDocument()
  })
})

import { render, screen } from "@testing-library/react"
import PowerBar from "@/components/towers/PowerBar"
import { PowerBarPlainObject } from "@/server/towers/classes/PowerBar"

const mockBlocks: PowerBarPlainObject = {
  queue: [
    { letter: "T", position: { row: 0, col: 0 }, powerType: "defense", powerLevel: "minor", isToBeRemoved: false },
    { letter: "O", position: { row: 0, col: 0 }, powerType: "attack", powerLevel: "minor", isToBeRemoved: false },
    { letter: "SD", powerType: "speed drop" },
  ],
}

describe("PowerBar", () => {
  it("should render all power bar blocks", () => {
    render(<PowerBar powerBar={mockBlocks} />)
    expect(screen.getAllByText("T")).toHaveLength(4) // Y-axis spinning cube
    expect(screen.getByText("O")).toBeInTheDocument()
    expect(screen.getByTestId("special-diamond_speed-drop")).toBeInTheDocument()
  })
})

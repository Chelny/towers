import { render, screen } from "@testing-library/react"
import NextPiece from "@/components/towers/NextPiece"
import { Piece } from "@/interfaces/game"
import { mockDefaultTowersBlockProps } from "@/test/data/board"

describe("NextPiece Component", () => {
  const mockNextPiece: Piece = [
    { ...mockDefaultTowersBlockProps, letter: "T", powerType: "defense" },
    { ...mockDefaultTowersBlockProps, letter: "O", powerType: null },
    { ...mockDefaultTowersBlockProps, letter: "W", powerType: "attack" },
  ]

  it("should render all blocks in the next piece", () => {
    render(<NextPiece nextPiece={mockNextPiece} />)

    expect(screen.getAllByText("T")).toHaveLength(4)
    expect(screen.getByText("O")).toBeInTheDocument()
    expect(screen.getByText("W")).toBeInTheDocument()
  })
})

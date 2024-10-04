import { render, screen } from "@testing-library/react"
import NextPiece from "@/components/towers/NextPiece"
import { Piece } from "@/interfaces/game"
import { mockedDefaultTowersBlockProps } from "@/vitest.setup"

describe("NextPiece Component", () => {
  const mockedNextPiece: Piece = [
    { ...mockedDefaultTowersBlockProps, letter: "T", powerType: "defense" },
    { ...mockedDefaultTowersBlockProps, letter: "O", powerType: null },
    { ...mockedDefaultTowersBlockProps, letter: "W", powerType: "attack" }
  ]

  it("should render all blocks in the next piece", () => {
    render(<NextPiece nextPiece={mockedNextPiece} />)

    expect(screen.getAllByText("T")).toHaveLength(4)
    expect(screen.getByText("O")).toBeInTheDocument()
    expect(screen.getByText("W")).toBeInTheDocument()
  })
})

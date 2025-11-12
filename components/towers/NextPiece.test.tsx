import { render, screen } from "@testing-library/react";
import NextPiece from "@/components/towers/NextPiece";
import { PiecePlainObject } from "@/server/towers/game/Piece";

describe("NextPiece", () => {
  const mockNextPiece: PiecePlainObject = {
    blocks: [
      { letter: "T", position: { row: 0, col: 0 }, powerType: "defense", powerLevel: "minor" },
      { letter: "O", position: { row: 0, col: 0 }, powerType: null, powerLevel: null },
      { letter: "W", position: { row: 0, col: 0 }, powerType: "attack", powerLevel: "normal" },
    ],
    position: { row: 0, col: 0 },
  };

  it("should render all blocks in the next piece", () => {
    render(<NextPiece nextPiece={mockNextPiece} />);

    expect(screen.getAllByText("T")).toHaveLength(4);
    expect(screen.getByText("O")).toBeInTheDocument();
    expect(screen.getByText("W")).toBeInTheDocument();
  });
});

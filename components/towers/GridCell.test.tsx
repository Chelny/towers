import { render, screen } from "@testing-library/react";
import GridCell from "@/components/towers/GridCell";
import { BoardBlock } from "@/interfaces/towers";
import { mockDefaultBlockProps } from "@/test/data/board";

describe("GridCell", () => {
  it("should apply the correct styles for defense block", () => {
    const defenseBlock: BoardBlock = { ...mockDefaultBlockProps, letter: "T", powerType: "defense" };

    render(<GridCell block={defenseBlock} />);

    const cells: HTMLDivElement[] = screen.getAllByText("T");
    const cellsParent: HTMLElement | null = cells[0].parentElement;

    expect(cellsParent?.getAttribute("class")).toContain("defense-block");
  });

  it("should apply the correct styles for attack block", () => {
    const attackBlock: BoardBlock = { ...mockDefaultBlockProps, letter: "O", powerType: "attack" };

    render(<GridCell block={attackBlock} />);

    const cell: HTMLDivElement = screen.getByText("O");

    expect(screen.queryByText("O")).toBeInTheDocument();
    expect(cell.getAttribute("class")).toContain("attack-block");
  });

  it("should render RegularBlock when block is not a defense type", () => {
    const regularBlock: BoardBlock = { ...mockDefaultBlockProps, letter: "W" };

    render(<GridCell block={regularBlock} />);

    const cells: HTMLDivElement[] = screen.getAllByText("W");
    const cellsParent: HTMLElement | null = cells[0].parentElement;

    expect(screen.queryByText("W")).toBeInTheDocument();
    expect(cellsParent?.classList).not.toContain("defense-block");
    expect(cellsParent?.classList).not.toContain("attack-block");
  });
});

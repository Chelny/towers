import { render, screen } from "@testing-library/react"
import DefenseBlock from "@/components/towers/DefenseBlock"

describe("DefenseBlock Component", () => {
  it("should render an empty block when no letter is provided", () => {
    render(<DefenseBlock />)
    expect(screen.queryByText("T")).not.toBeInTheDocument()
  })

  it("should render all cube faces with a letter when provided", () => {
    render(<DefenseBlock letter="T" />)

    const blockFaces: HTMLDivElement[] = screen.getAllByText("T")
    blockFaces.forEach((blockFace: HTMLDivElement) => {
      expect(blockFace).toBeInTheDocument()
    })
    expect(blockFaces).toHaveLength(4)
  })
})

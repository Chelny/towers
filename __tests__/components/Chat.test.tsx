import { render, screen } from "@testing-library/react"
import { mockRoom1Chat, mockRoom1Table1Chat } from "@/__mocks__/data/socketState"
import Chat from "@/components/game/Chat"

describe("Chat Component", () => {
  it("should render room chat messages correctly", () => {
    render(<Chat messages={mockRoom1Chat} />)

    expect(screen.getByText(`${mockRoom1Chat[0].user.username}: ${mockRoom1Chat[0].message}`)).toBeInTheDocument()
    expect(screen.getByText(`${mockRoom1Chat[1].user.username}: ${mockRoom1Chat[1].message}`)).toBeInTheDocument()
  })

  it("should render table chat messages correctly when isTableChat is true", () => {
    render(<Chat messages={mockRoom1Table1Chat} isTableChat />)

    expect(screen.getByText(`${mockRoom1Table1Chat[0].message}`)).toBeInTheDocument()
    expect(
      screen.getByText(`${mockRoom1Table1Chat[1].user?.username}: ${mockRoom1Table1Chat[1].message}`)
    ).toBeInTheDocument()
    expect(
      screen.getByText(`${mockRoom1Table1Chat[2].user?.username}: ${mockRoom1Table1Chat[2].message}`)
    ).toBeInTheDocument()
    expect(
      screen.getByText(`${mockRoom1Table1Chat[3].user?.username}: ${mockRoom1Table1Chat[3].message}`)
    ).toBeInTheDocument()
    expect(screen.getByText(`${mockRoom1Table1Chat[4].message}`)).toBeInTheDocument()
    expect(screen.getByText(`${mockRoom1Table1Chat[5].message}`)).toBeInTheDocument()
    expect(screen.getByText(`${mockRoom1Table1Chat[6].message}`)).toBeInTheDocument()
    expect(screen.getByText(`${mockRoom1Table1Chat[7].message}`)).toBeInTheDocument()
    expect(screen.getByText(`${mockRoom1Table1Chat[8].message}`)).toBeInTheDocument()
  })

  it("should handle an empty message array without crashing", () => {
    render(<Chat messages={[]} />)

    expect(screen.queryByText(/:/)).not.toBeInTheDocument()
  })
})

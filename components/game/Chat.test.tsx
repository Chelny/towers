import React from "react"
import { ITowersRoomChatMessage } from "@prisma/client"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import Chat from "@/components/game/Chat"
import { mockTowersRoomState1Chat, mockTowersTableState11Chat } from "@/test/data/socketState"

vi.mock("@lingui/react/macro", () => ({
  useLingui: vi.fn().mockReturnValue({
    i18n: {
      _: vi.fn((key: string, values?: Record<string, unknown>) => {
        if (key === "{username}’s old rating: {oldRating}; new rating: {newRating}") {
          return `${values?.username}’s old rating: ${values?.oldRating}; new rating: ${values?.newRating}`
        }
        if (key === "{username} is a hero of {appName}!") {
          return `${values?.username} is a hero of ${values?.appName}!`
        }
        if (
          key ===
          "You are the host of the table. This gives you the power to invite to [or boot people from] your table. You may also limit other player’s access to your table by selecting its \"Table Type\"."
        ) {
          return "You are the host of the table."
        }
        if (key === "{username} has joined the table.") {
          return `${values?.username} has joined the table.`
        }
        return key
      }),
    },
    t: (key: Record<string, string>) => key.message,
  }),
}))

describe("Chat Component", () => {
  const mockHandleSendMessage: Mock = vi.fn()

  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  it("should render room chat messages correctly", () => {
    render(
      <Chat
        messages={mockTowersRoomState1Chat}
        messageInputRef={null}
        isMessageInputDisabled={false}
        onSendMessage={mockHandleSendMessage}
      />,
    )

    waitFor(() => {
      mockTowersRoomState1Chat.forEach((message: ITowersRoomChatMessage) => {
        const messageUsername: string = message.userProfile.user.username
        const messageContent: string = message.message

        if (messageContent) {
          expect(screen.getByText(messageUsername)).toBeInTheDocument()
          expect(screen.getByText(messageContent)).toBeInTheDocument()
        }
      })
    })
  })

  it("should handle an empty message array without crashing", () => {
    render(
      <Chat
        messages={[]}
        messageInputRef={null}
        isMessageInputDisabled={false}
        onSendMessage={mockHandleSendMessage}
      />,
    )

    expect(screen.queryByText(/:/)).not.toBeInTheDocument()
  })

  it("should render messages in the order they are provided", () => {
    render(
      <Chat
        messages={mockTowersRoomState1Chat}
        messageInputRef={null}
        isMessageInputDisabled={false}
        onSendMessage={mockHandleSendMessage}
      />,
    )

    const messages = screen.getAllByText(/Hey!|Wazzup?/)
    expect(messages[0].textContent).toContain(mockTowersTableState11Chat[2].message)
    expect(messages[1].textContent).toContain(mockTowersTableState11Chat[3].message)
  })

  it("should render table chat messages correctly for a specific user", () => {
    render(
      <Chat
        messages={mockTowersTableState11Chat}
        messageInputRef={null}
        isMessageInputDisabled={false}
        onSendMessage={mockHandleSendMessage}
      />,
    )

    expect(screen.getByText("*** john.doe has joined the table.")).toBeInTheDocument()
    expect(screen.getByText("*** Cipher key: T ==> 9")).toBeInTheDocument()
    expect(screen.getByText("john.doe: Hey!")).toBeInTheDocument()
    expect(screen.getByText("janesmith: Wazzup?")).toBeInTheDocument()
    expect(screen.getByText("*** john.doe’s old rating: 2050; new rating: 2040")).toBeInTheDocument()
    expect(screen.getByText("*** Only people you have invited may play now.")).toBeInTheDocument()
    expect(screen.getByText("*** Cipher key: V ==> M")).toBeInTheDocument()
    expect(screen.getByText("2FKK 2OF W1VAM2FO 91MO 8EWOF2 NF9 7HW3FE")).toBeInTheDocument()
    expect(screen.getByText("*** john.doe is a hero of Towers Game!")).toBeInTheDocument()
  })

  it("should send a message when Enter is pressed", () => {
    render(
      <Chat
        messages={mockTowersRoomState1Chat}
        messageInputRef={null}
        isMessageInputDisabled={false}
        onSendMessage={mockHandleSendMessage}
      />,
    )

    const input: HTMLInputElement = screen.getByPlaceholderText("Write something...")
    fireEvent.change(input, { target: { value: "Hello World!" } })
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" })

    expect(mockHandleSendMessage).toHaveBeenCalled()
  })
})

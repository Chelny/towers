import React from "react"
import { fireEvent, render, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import Chat from "@/components/game/Chat"
import { TableChatMessageType } from "@/enums/table-chat-message-type"
import { TableType } from "@/enums/table-type"
import { authClient } from "@/lib/auth-client"
import { ChatMessagePlainObject } from "@/server/towers/classes/Chat"
import { TableChatMessagePlainObject } from "@/server/towers/classes/TableChat"
import { UserPlainObject } from "@/server/towers/classes/User"
import { mockSession } from "@/test/data/session"
import { mockUser1 } from "@/test/data/user"
import { customScreen as screen } from "@/vitest.setup"

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
    t: (message: { message: string }) => message.message,
  }),
}))

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}))

const mockHandleSendMessage: Mock = vi.fn()

const mockChat: { messages: TableChatMessagePlainObject[] } = {
  messages: [
    {
      id: "mock-chat-message-1",
      user: { user: mockUser1 } as UserPlainObject,
      type: TableChatMessageType.USER_JOINED,
      messageVariables: { username: "john.doe" },
      createdAt: new Date(Date.now() - 100000).toISOString(),
    },
    {
      id: "mock-chat-message-2",
      user: { user: mockUser1 } as UserPlainObject,
      text: "*** Cipher key: T ==> 9",
      type: TableChatMessageType.CIPHER_KEY,
      createdAt: new Date(Date.now() - 90000).toISOString(),
    },
    {
      id: "mock-chat-message-3",
      user: { user: mockUser1 } as UserPlainObject,
      text: "Hey!",
      type: TableChatMessageType.CHAT,
      messageVariables: { username: "john.doe" },
      createdAt: new Date(Date.now() - 80000).toISOString(),
    },
    {
      id: "mock-chat-message-4",
      user: { user: { username: "janesmith" } } as UserPlainObject,
      text: "Wazzup?",
      type: TableChatMessageType.CHAT,
      createdAt: new Date(Date.now() - 70000).toISOString(),
    },
    {
      id: "mock-chat-message-5",
      user: { user: mockUser1 } as UserPlainObject,
      type: TableChatMessageType.GAME_RATING,
      messageVariables: { username: mockUser1.username, oldRating: 2050, newRating: 2040 },
      createdAt: new Date(Date.now() - 60000).toISOString(),
    },
    {
      id: "mock-chat-message-6",
      user: { user: mockUser1 } as UserPlainObject,
      type: TableChatMessageType.TABLE_TYPE,
      messageVariables: { tableType: TableType.PROTECTED },
      createdAt: new Date(Date.now() - 50000).toISOString(),
    },
    {
      id: "mock-chat-message-7",
      user: { user: mockUser1 } as UserPlainObject,
      text: "*** Cipher key: V ==> M",
      type: TableChatMessageType.CIPHER_KEY,
      createdAt: new Date(Date.now() - 40000).toISOString(),
    },
    {
      id: "mock-chat-message-8",
      user: { user: mockUser1 } as UserPlainObject,
      text: "2FKK 2OF W1VAM2FO 91MO 8EWOF2 NF9 7HW3FE",
      type: TableChatMessageType.HERO_CODE,
      createdAt: new Date(Date.now() - 30000).toISOString(),
    },
    {
      id: "mock-chat-message-9",
      user: { user: mockUser1 } as UserPlainObject,
      type: TableChatMessageType.HERO_MESSAGE,
      messageVariables: { username: "john.doe" },
      createdAt: new Date(Date.now() - 20000).toISOString(),
    },
  ],
}

describe("Chat", () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn()
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)
  })

  it("should render room chat messages correctly", () => {
    render(
      <Chat
        chat={mockChat}
        messageInputRef={null}
        isMessageInputDisabled={false}
        onSendMessage={mockHandleSendMessage}
      />,
    )

    waitFor(() => {
      mockChat.messages.forEach((message: ChatMessagePlainObject) => {
        const messageUsername: string | undefined = message.user?.user?.username
        const messageContent: string | undefined = message.text

        if (messageUsername && messageContent) {
          expect(screen.getByText(messageUsername)).toBeInTheDocument()
          expect(screen.getByText(messageContent)).toBeInTheDocument()
        }
      })
    })
  })

  it("should handle an empty message array without crashing", () => {
    render(
      <Chat
        chat={{ messages: [] }}
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
        chat={mockChat}
        messageInputRef={null}
        isMessageInputDisabled={false}
        onSendMessage={mockHandleSendMessage}
      />,
    )

    const messages: HTMLElement[] = screen.getAllByText(/Hey!|Wazzup?/)
    expect(messages[0].textContent).toContain(mockChat.messages[2].text)
    expect(messages[1].textContent).toContain(mockChat.messages[3].text)
  })

  it("should render table chat messages correctly for a specific user", () => {
    render(
      <Chat
        chat={mockChat}
        messageInputRef={null}
        isMessageInputDisabled={false}
        onSendMessage={mockHandleSendMessage}
      />,
    )

    expect(screen.getByText("*** john.doe has joined the table.")).toBeInTheDocument()
    expect(screen.getByText("*** Cipher key: T ==> 9")).toBeInTheDocument()
    expect(screen.getAllByNormalizedText("john.doe: Hey!").length).toBeGreaterThan(0)
    expect(screen.getAllByNormalizedText("janesmith: Wazzup?").length).toBeGreaterThan(0)
    expect(screen.getByText("*** john.doe’s old rating: 2050; new rating: 2040")).toBeInTheDocument()
    expect(screen.getByText("*** Only people you have invited may play now.")).toBeInTheDocument()
    expect(screen.getByText("*** Cipher key: V ==> M")).toBeInTheDocument()
    expect(screen.getByText("2FKK 2OF W1VAM2FO 91MO 8EWOF2 NF9 7HW3FE")).toBeInTheDocument()
    expect(screen.getByText("*** john.doe is a hero of Towers Game!")).toBeInTheDocument()
  })

  it("should send a message when Enter is pressed", () => {
    render(
      <Chat
        chat={mockChat}
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

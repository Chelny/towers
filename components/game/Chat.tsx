"use client"

import { ReactNode } from "react"
import { ITowersRoomChatMessage, ITowersTableChatMessage, TableChatMessageType } from "@prisma/client"

type ChatProps = {
  messages: ITowersRoomChatMessage[] | ITowersTableChatMessage[]
  isTableChat?: boolean
}

export default function Chat({ messages, isTableChat = false }: ChatProps): ReactNode {
  return (
    <>
      {messages?.map((message: ITowersRoomChatMessage | ITowersTableChatMessage) => (
        <div key={message.id}>
          {((isTableChat && (message as ITowersTableChatMessage).type === TableChatMessageType.CHAT) ||
            !isTableChat) && <>{message.userProfile?.user?.username}:&nbsp;</>}
          {message.message}
        </div>
      ))}
    </>
  )
}

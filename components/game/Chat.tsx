"use client"

import { ITowersRoomChatMessage, ITowersTableChatMessage, TableChatMessageType } from "@prisma/client"

type ChatProps = {
  messages: ITowersRoomChatMessage[] | ITowersTableChatMessage[]
  isTableChat?: boolean
}

export default function Chat({ messages, isTableChat = false }: ChatProps) {
  return (
    <>
      {messages?.map((message: ITowersRoomChatMessage | ITowersTableChatMessage, index: number) => (
        <div key={index}>
          {((isTableChat && (message as ITowersTableChatMessage).type === TableChatMessageType.CHAT) ||
            !isTableChat) && <>{message.user?.username}:&nbsp;</>}
          {message.message}
        </div>
      ))}
    </>
  )
}

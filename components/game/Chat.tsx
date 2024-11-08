"use client"

import { ReactNode } from "react"
import { ITowersRoomChatMessage, ITowersTableChatMessage, TableChatMessageType } from "@prisma/client"

type ChatProps = {
  messages: (ITowersRoomChatMessage | ITowersTableChatMessage)[]
  userId?: string | null
}

export default function Chat({ messages, userId }: ChatProps): ReactNode {
  return (
    <>
      {messages?.map((message: ITowersRoomChatMessage | ITowersTableChatMessage) => {
        const isPrivateMessage: string | null = (message as ITowersTableChatMessage).privateToUserId
        const isMessageVisible: boolean = !isPrivateMessage || isPrivateMessage === userId

        return userId ? (
          <div key={message.id}>
            {isMessageVisible ? (
              <>
                {(message as ITowersTableChatMessage).type === TableChatMessageType.CHAT && (
                  <>{message.userProfile?.user?.username}:&nbsp;</>
                )}
                {message.message}
              </>
            ) : null}
          </div>
        ) : (
          <div key={message.id}>
            {message.userProfile?.user?.username}:&nbsp;
            {message.message}
          </div>
        )
      })}
    </>
  )
}

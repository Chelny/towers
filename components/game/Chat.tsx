"use client"

import { RoomMessage, TableMessage } from "@prisma/client"

type ChatProps = {
  messages: RoomMessage[] | TableMessage[]
  isTableChat?: boolean
}

export default function Chat({ messages, isTableChat = false }: ChatProps) {
  return (
    <>
      {messages?.map((message: RoomMessage | TableMessage, index: number) => (
        <div key={index}>
          {isTableChat ? (
            <>
              {message.towersUserProfile?.user?.username && <>{message.towersUserProfile?.user?.username}:&nbsp;</>}
              {message.message}
            </>
          ) : (
            <>
              {message.towersUserProfile?.user?.username}: {message.message}
            </>
          )}
        </div>
      ))}
    </>
  )
}

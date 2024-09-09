"use client"

import { RoomChatWithTowersGameUser, TableChatWithTowersGameUser } from "@/interfaces"

type ChatProps = {
  messages: RoomChatWithTowersGameUser[] | TableChatWithTowersGameUser[]
  isTableChat?: boolean
}

export default function Chat({ messages, isTableChat = false }: ChatProps) {
  return (
    <>
      {messages?.map((message: RoomChatWithTowersGameUser | TableChatWithTowersGameUser, index: number) => (
        <div key={index}>
          {isTableChat ? (
            <>
              {message.towersGameUser?.user?.username && <>{message.towersGameUser?.user?.username}:&nbsp;</>}
              {message.message}
            </>
          ) : (
            <>
              {message.towersGameUser?.user?.username}: {message.message}
            </>
          )}
        </div>
      ))}
    </>
  )
}

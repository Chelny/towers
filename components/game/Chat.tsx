"use client"

import { KeyboardEvent, ReactNode, Ref, RefObject, useEffect, useMemo, useRef } from "react"
import { useLingui } from "@lingui/react/macro"
import { ITowersRoomChatMessage, ITowersTableChatMessage, TableChatMessageType, TableType } from "@prisma/client"
import { JsonObject } from "@prisma/client/runtime/library"
import { APP_CONFIG } from "@/constants/app"
import { CHAT_MESSSAGE_MAX_LENGTH } from "@/constants/game"

type ChatProps = {
  messages: (ITowersRoomChatMessage | ITowersTableChatMessage)[]
  messageInputRef: Ref<HTMLInputElement> | undefined
  isMessageInputDisabled: boolean
  onSendMessage: (event: KeyboardEvent<HTMLInputElement>) => void
}

export default function Chat({
  messages,
  messageInputRef,
  isMessageInputDisabled = true,
  onSendMessage,
}: ChatProps): ReactNode {
  const { i18n, t } = useLingui()
  const chatEndRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = (): void => {
    chatEndRef.current?.scrollIntoView({ behavior: "instant", block: "end" })
  }

  const getTableAutomatedChatMessage = (type: TableChatMessageType, messageVariables?: JsonObject): string => {
    if (!messageVariables) return ""

    const { newRating, oldRating, tableType, username } = messageVariables
    const appName: string = APP_CONFIG.NAME
    let message: string = ""

    switch (type) {
      case TableChatMessageType.GAME_RATING:
        message = i18n._("{username}’s old rating: {oldRating}; new rating: {newRating}", {
          username,
          oldRating,
          newRating,
        })
        break

      case TableChatMessageType.HERO_MESSAGE:
        message = i18n._("{username} is a hero of {appName}!", { username, appName })
        break

      case TableChatMessageType.TABLE_HOST:
        message = i18n._(
          "You are the host of the table. This gives you the power to invite to [or boot people from] your table. You may also limit other player’s access to your table by selecting its \"Table Type\".",
        )
        break

      case TableChatMessageType.TABLE_TYPE:
        switch (tableType) {
          case TableType.PROTECTED:
            message = i18n._("Only people you have invited may play now.")
            break
          case TableType.PRIVATE:
            message = i18n._("Only people you have invited may play or watch your table now.")
            break
          default:
            message = i18n._("Anyone may play or watch your table now.")
        }
        break

      case TableChatMessageType.USER_JOINED:
        message = i18n._("{username} has joined the table.", { username })
        break

      case TableChatMessageType.USER_LEFT:
        message = i18n._("{username} has left the table.", { username })
        break

      default:
        break
    }

    return `*** ${message}`
  }

  const translatedMessages = useMemo(() => {
    return messages.map((chatMessage: ITowersRoomChatMessage | ITowersTableChatMessage) => {
      const messageVariables: JsonObject = (chatMessage as ITowersTableChatMessage).messageVariables as JsonObject
      const translatedMessage: string | null =
        chatMessage.message ??
        getTableAutomatedChatMessage((chatMessage as ITowersTableChatMessage).type, messageVariables)

      return {
        ...chatMessage,
        message: translatedMessage,
      }
    })
  }, [messages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="overflow-hidden flex flex-col gap-1 h-full">
      <input
        ref={messageInputRef}
        type="text"
        className="w-full p-2 border"
        placeholder={t({ message: "Write something..." })}
        maxLength={CHAT_MESSSAGE_MAX_LENGTH}
        disabled={isMessageInputDisabled}
        onKeyDown={onSendMessage}
      />
      <div className="overflow-y-auto flex-1 my-1">
        {translatedMessages.map((chatMessage) => {
          if ("roomId" in chatMessage) {
            // Room chat message
            return (
              <div key={chatMessage.id}>
                <>{chatMessage.userProfile?.user?.username}:&nbsp;</>
                {chatMessage.message}
              </div>
            )
          }

          // Table chat message
          return (
            <div key={chatMessage.id}>
              {(chatMessage as ITowersTableChatMessage).type === TableChatMessageType.CHAT && (
                <>{chatMessage.userProfile?.user?.username}:&nbsp;</>
              )}
              {chatMessage.message}
            </div>
          )
        })}
        <div ref={chatEndRef} />
      </div>
    </div>
  )
}

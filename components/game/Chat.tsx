"use client"

import { KeyboardEvent, ReactNode, Ref, RefObject, useEffect, useMemo, useRef } from "react"
import { useLingui } from "@lingui/react/macro"
import clsx from "clsx/lite"
import Input from "@/components/ui/Input"
import { APP_CONFIG } from "@/constants/app"
import { FKey, fKeyMessages } from "@/constants/f-key-messages"
import { CHAT_MESSSAGE_MAX_LENGTH } from "@/constants/game"
import { TableChatMessageType } from "@/enums/table-chat-message-type"
import { TableType } from "@/enums/table-type"
import { authClient } from "@/lib/auth-client"
import { ChatMessagePlainObject, ChatPlainObject } from "@/server/towers/classes/Chat"
import { TableChatMessagePlainObject, TableChatMessageVariables } from "@/server/towers/classes/TableChat"

type ChatProps = {
  chat?: ChatPlainObject
  messageInputRef?: Ref<HTMLInputElement>
  isMessageInputDisabled: boolean
  onSendMessage: (event: KeyboardEvent<HTMLInputElement>) => void
}

export default function Chat({ chat, messageInputRef, isMessageInputDisabled, onSendMessage }: ChatProps): ReactNode {
  const { data: session } = authClient.useSession()
  const { i18n, t } = useLingui()
  const chatEndRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = (): void => {
    chatEndRef.current?.scrollIntoView({ behavior: "instant", block: "end" })
  }

  const getTableAutomatedChatMessage = (
    type: TableChatMessageType,
    messageVariables?: TableChatMessageVariables,
  ): string => {
    const encryptedChar: string | undefined = messageVariables?.encryptedChar
    const decryptedChar: string | undefined = messageVariables?.decryptedChar
    const fKey: FKey | undefined = messageVariables?.fKey
    const oldRating: number | undefined = messageVariables?.oldRating
    const newRating: number | undefined = messageVariables?.newRating
    const heroCode: string | undefined = messageVariables?.heroCode
    const tableHostUsername: string | undefined = messageVariables?.tableHostUsername
    const tableType: TableType | undefined = messageVariables?.tableType
    const username: string | undefined = messageVariables?.username
    const appName: string = APP_CONFIG.NAME
    let message: string = ""

    switch (type) {
      case TableChatMessageType.CIPHER_KEY:
        message = i18n._("Cipher key: {encryptedChar} => {decryptedChar}", { encryptedChar, decryptedChar })
        break

      case TableChatMessageType.F_KEY:
        if (typeof fKey !== "undefined") {
          message = i18n._(fKeyMessages[fKey])
          return i18n._("{username}: {message}", { username, message })
        }
        break

      case TableChatMessageType.GAME_RATING:
        message = i18n._("{username}’s old rating: {oldRating}; new rating: {newRating}", {
          username,
          oldRating,
          newRating,
        })
        break

      case TableChatMessageType.HERO_CODE:
        if (heroCode) return heroCode
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

      case TableChatMessageType.USER_BOOTED:
        message = i18n._("{tableHostUsername} has booted {username} from the table.", { tableHostUsername, username })
        break

      case TableChatMessageType.USER_GRANTED_SEAT_ACCESS_INVITEE:
        message = i18n._("You have been granted access to play by the host.")
        break

      case TableChatMessageType.USER_GRANTED_SEAT_ACCESS_INVITER:
        message = i18n._("You granted {username} access to play.", { username })
        break

      case TableChatMessageType.USER_JOINED:
        message = i18n._("{username} has joined the table.", { username })
        break

      case TableChatMessageType.USER_INVITED:
        message = i18n._("{username} has accepted the invitation to the table.", { username })
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
    return chat?.messages
      .filter((message: ChatMessagePlainObject) => {
        const visibleToUserId: string | undefined = (message as TableChatMessagePlainObject).visibleToUserId
        return !visibleToUserId || visibleToUserId === session?.user.id
      })
      .map((message: ChatMessagePlainObject) => {
        const messageVariables: TableChatMessageVariables | undefined = (message as TableChatMessagePlainObject)
          .messageVariables
        const translatedMessage: string | null =
          message.text ?? getTableAutomatedChatMessage((message as TableChatMessagePlainObject).type, messageVariables)

        return {
          ...message,
          text: translatedMessage,
        }
      })
  }, [chat])

  useEffect(() => {
    scrollToBottom()
  }, [chat])

  return (
    <div className="overflow-hidden flex flex-col gap-1 h-full">
      <Input
        ref={messageInputRef}
        id="chat"
        type="text"
        className="w-full p-2 -mb-4 border border-gray-200"
        placeholder={t({ message: "Write something..." })}
        maxLength={CHAT_MESSSAGE_MAX_LENGTH}
        disabled={isMessageInputDisabled}
        shouldClearValueAfterEnter
        onKeyDown={onSendMessage}
      />
      <div className="overflow-y-auto flex-1 my-1">
        {translatedMessages?.map((message: ChatMessagePlainObject) => {
          // Table chat message
          if ("type" in message) {
            return (
              <div key={message.id} className="flex">
                {(message as TableChatMessagePlainObject).type === TableChatMessageType.CHAT && (
                  <span className="order-1">{message.user.user?.username}:&nbsp;</span>
                )}
                <span
                  className={clsx(
                    (message as TableChatMessagePlainObject).type === TableChatMessageType.CHAT && "order-2",
                  )}
                >
                  {message.text}
                </span>
              </div>
            )
          }

          // Room chat message
          return (
            <div key={message.id} className="flex">
              <span className="order-1">{message.user.user?.username}:&nbsp;</span>
              <span className="order-2">{message.text}</span>
            </div>
          )
        })}
        <div ref={chatEndRef} />
      </div>
    </div>
  )
}

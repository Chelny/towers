"use client"

import { ChangeEvent, ReactNode, useState } from "react"
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation"
import { useLingui } from "@lingui/react/macro"
import { format } from "date-fns"
import Input from "@/components/ui/Input"
import Modal from "@/components/ui/Modal"
import { SocketEvents } from "@/constants/socket-events"
import { useSocket } from "@/context/SocketContext"
import { InstantMessagePlainObject } from "@/server/towers/classes/InstantMessage"
import { getDateFnsLocale } from "@/translations/languages"

type InstantMessageModalProps = {
  instantMessage: InstantMessagePlainObject
  onCancel: () => void
}

export default function InstantMessageModal({ instantMessage, onCancel }: InstantMessageModalProps): ReactNode {
  const searchParams: ReadonlyURLSearchParams = useSearchParams()
  const { socket } = useSocket()
  const { i18n, t } = useLingui()
  const [message, setMessage] = useState<string | undefined>(undefined)
  const username: string | undefined = instantMessage.sender?.user?.username
  const rating: number | undefined = instantMessage.sender?.stats.rating

  const handleSendMessage = (): void => {
    socket?.emit(
      SocketEvents.INSTANT_MESSAGE_SENT,
      { roomId: searchParams?.get("room"), recipientUserId: instantMessage?.sender.user?.id, message },
      (response: { success: boolean; message: string }) => {
        if (response.success) {
          onCancel?.()
        }
      },
    )
  }

  return (
    <Modal
      title={t({ message: `Instant message from ${username} (${rating})` })}
      cancelText={t({ message: "Close" })}
      dataTestId="instant-message"
    >
      <div className="flex flex-col gap-2">
        <div>
          <p>{instantMessage.message}</p>
          <div>{format(instantMessage.createdAt, "p", { locale: getDateFnsLocale(i18n.locale) })}</div>
        </div>
        <Input
          id="instantMessage"
          label={t({ message: `Reply to ${username}` })}
          defaultValue={message}
          inlineButtonText={t({ message: "Reply" })}
          onInput={(event: ChangeEvent<HTMLInputElement>) => setMessage(event.target.value)}
          onInlineButtonClick={handleSendMessage}
        />
      </div>
    </Modal>
  )
}

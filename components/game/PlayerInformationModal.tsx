"use client"

import { InputEvent, ReactNode, useEffect, useState } from "react"
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation"
import { Trans, useLingui } from "@lingui/react/macro"
import { formatDistanceToNow } from "date-fns"
import Checkbox from "@/components/ui/Checkbox"
import Input from "@/components/ui/Input"
import Modal from "@/components/ui/Modal"
import { SocketEvents } from "@/constants/socket-events"
import { useSocket } from "@/context/SocketContext"
import { UserPlainObject } from "@/server/towers/classes/User"
import { getDateFnsLocale } from "@/translations/languages"

type PlayerInformationModalProps = {
  currentUser?: UserPlainObject
  player?: UserPlainObject
  isRatingsVisible?: boolean | null
  onCancel: () => void
}

export default function PlayerInformationModal({
  currentUser,
  player,
  isRatingsVisible = false,
  onCancel,
}: PlayerInformationModalProps): ReactNode {
  const searchParams: ReadonlyURLSearchParams = useSearchParams()
  const { socketRef, session } = useSocket()
  const { i18n, t } = useLingui()
  const [isCurrentUser, setIsCurrentUser] = useState<boolean>(false)
  const [message, setMessage] = useState<string | undefined>(undefined)
  const [idleTime, setIdleTime] = useState<string | undefined>(undefined)
  const username: string | null | undefined = player?.user?.username
  const rating: number | undefined = player?.stats.rating
  const gamesCompleted: number | undefined = player?.stats.gamesCompleted
  const wins: number | undefined = player?.stats.wins
  const loses: number | undefined = player?.stats.loses
  const streak: number | undefined = player?.stats.streak

  const handleSendMessage = (): void => {
    socketRef.current?.emit(
      SocketEvents.INSTANT_MESSAGE_SENT,
      { roomId: searchParams?.get("room"), recipientUserId: player?.user?.id, message },
      (response: { success: boolean; message: string }) => {
        if (response.success) {
          onCancel?.()
        }
      },
    )
  }

  const handleMuteUser = (): void => {
    socketRef.current?.emit(SocketEvents.USER_MUTE, { userId: player?.user?.id })
  }

  useEffect(() => {
    setIsCurrentUser(player?.user?.id === session?.user?.id)
  }, [player, session])

  useEffect(() => {
    if (player?.user?.lastActiveAt) {
      const lastActiveAt: Date = new Date(player.user?.lastActiveAt)
      const relativeTime: string = formatDistanceToNow(lastActiveAt, {
        addSuffix: true,
        locale: getDateFnsLocale(i18n.locale),
      })
      setIdleTime(relativeTime)
    }
  }, [player?.user?.lastActiveAt])

  return (
    <Modal
      title={t({ message: `Player information of ${username}` })}
      cancelText={t({ message: "Close" })}
      dataTestId="player-information"
      onCancel={onCancel}
    >
      <div className="flex flex-col gap-2">
        {isRatingsVisible && (
          <div>
            <Trans>Rating: {rating}</Trans> <br />
            <Trans>Games Completed: {gamesCompleted}</Trans> <br />
            <Trans>Wins: {wins}</Trans> <br />
            <Trans>Loses: {loses}</Trans> <br />
            <Trans>Streak: {streak}</Trans> <br />
          </div>
        )}
        {!isCurrentUser && (
          <Input
            id="instantMessage"
            label={t({ message: "Send instant message" })}
            defaultValue={message}
            inlineButtonText={t({ message: "Send" })}
            onInput={(event: InputEvent<HTMLInputElement>) => setMessage((event.target as HTMLInputElement).value)}
            onInlineButtonClick={handleSendMessage}
          />
        )}
        <div>
          <Trans>Idle Time: {idleTime}</Trans>
        </div>
        {!isCurrentUser && (
          <Checkbox
            id="muteUser"
            label={t({ message: "Ignore" })}
            defaultChecked={currentUser?.mute?.mutedUsers?.some(
              (mutedUser: { userId: string }) => mutedUser.userId === player?.user?.id,
            )}
            onChange={handleMuteUser}
          />
        )}
      </div>
    </Modal>
  )
}

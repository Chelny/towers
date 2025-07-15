"use client"

import { InputEvent, ReactNode, useEffect, useState } from "react"
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from "next/navigation"
import { useLingui } from "@lingui/react/macro"
import { Duration, formatDuration, intervalToDuration } from "date-fns"
import Button from "@/components/ui/Button"
import Checkbox from "@/components/ui/Checkbox"
import Input from "@/components/ui/Input"
import Modal from "@/components/ui/Modal"
import { ROUTE_TOWERS } from "@/constants/routes"
import { SocketEvents } from "@/constants/socket-events"
import { useSocket } from "@/context/SocketContext"
import { UserPlainObject } from "@/server/towers/classes/User"
import { getDateFnsLocale } from "@/translations/languages"

type PlayerInformationModalProps = {
  roomId: string
  currentUser?: UserPlainObject
  player?: UserPlainObject
  isRatingsVisible?: boolean | null
  onCancel: () => void
}

export default function PlayerInformationModal({
  roomId,
  currentUser,
  player,
  isRatingsVisible = false,
  onCancel,
}: PlayerInformationModalProps): ReactNode {
  const searchParams: ReadonlyURLSearchParams = useSearchParams()
  const { socketRef, session } = useSocket()
  const { i18n, t } = useLingui()
  const router = useRouter()
  const [isCurrentUser, setIsCurrentUser] = useState<boolean>(false)
  const [message, setMessage] = useState<string | undefined>(undefined)
  const [watchUserAtTable, setWatchUserAtTable] = useState<string | null>(null)
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

  const handleWatch = (): void => {
    if (watchUserAtTable) {
      router.push(watchUserAtTable)
    }

    onCancel?.()
  }

  const handlePing = (): void => {
    socketRef.current?.emit(SocketEvents.USER_PING, { roomId, userId: player?.user?.id })
  }

  useEffect(() => {
    setIsCurrentUser(player?.user?.id === session?.user?.id)
  }, [player, session])

  useEffect(() => {
    if (!player?.user?.id || !session?.user?.id || isCurrentUser) return

    socketRef.current?.emit(
      SocketEvents.GAME_WATCH_USER_AT_TABLE,
      { roomId, userId: player.user.id },
      (response: { success: boolean; message: string; data: { roomId: string; tableId: string } }) => {
        if (response.success) {
          setWatchUserAtTable(`${ROUTE_TOWERS.PATH}?room=${response?.data?.roomId}&table=${response?.data?.tableId}`)
        } else {
          setWatchUserAtTable(null)
        }
      },
    )
  }, [player?.user?.id, session?.user?.id])

  useEffect(() => {
    if (player?.lastActiveAt) {
      const lastActiveAt: Date = new Date(player.lastActiveAt)
      const duration: Duration = intervalToDuration({ start: lastActiveAt, end: new Date() })
      const formattedIdleTime: string = formatDuration(duration, {
        locale: getDateFnsLocale(i18n.locale),
        format: ["hours", "minutes", "seconds"],
      })

      setIdleTime(formattedIdleTime)
    }
  }, [player?.lastActiveAt])

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
            {t({ message: `Rating: ${rating}` })} <br />
            {t({ message: `Games Completed: ${gamesCompleted}` })} <br />
            {t({ message: `Wins: ${wins}` })} <br />
            {t({ message: `Loses: ${loses}` })} <br />
            {t({ message: `Streak: ${streak}` })} <br />
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
        <div className="mb-2">{t({ message: `Idle Time: ${idleTime}` })}</div>
        <div className="flex items-center gap-4">
          {!isCurrentUser && (
            <>
              <div className="w-fit -mb-4">
                <Checkbox
                  id="muteUser"
                  label={t({ message: "Ignore" })}
                  defaultChecked={currentUser?.mute?.mutedUsers?.some(
                    (mutedUser: { userId: string }) => mutedUser.userId === player?.user?.id,
                  )}
                  onChange={handleMuteUser}
                />
              </div>
              <Button className="w-fit" dataTestId="player-information_button_ping" onClick={handlePing}>
                {t({ message: "Ping" })}
              </Button>
            </>
          )}
          {watchUserAtTable && (
            <Button className="w-fit" dataTestId="player-information_button_watch" onClick={handleWatch}>
              {t({ message: "Watch" })}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

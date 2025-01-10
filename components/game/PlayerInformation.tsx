"use client"

import { ChangeEvent, ReactNode, useEffect, useState } from "react"
import { Trans, useLingui } from "@lingui/react/macro"
import { ITowersUserProfileWithRelations } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"
import Input from "@/components/ui/Input"
import Modal from "@/components/ui/Modal"
import { authClient } from "@/lib/auth-client"
import { getDateFnsLocale } from "@/translations/languages"

type PlayerInformationProps = {
  isOpen: boolean
  player: ITowersUserProfileWithRelations | undefined
  isRatingsVisible?: boolean | null
  onCancel: () => void
}

export default function PlayerInformation({
  isOpen,
  player,
  isRatingsVisible = false,
  onCancel,
}: PlayerInformationProps): ReactNode {
  const { data: session } = authClient.useSession()
  const [isCurrentUser, setIsCurrentUser] = useState<boolean>(false)
  const [reason, setReason] = useState<string>("")
  const [idleTime, setIdleTime] = useState<string>("")
  const { i18n, t } = useLingui()
  const username: string | undefined = player?.user?.username
  const rating: number | undefined = player?.rating
  const gamesCompleted: number | undefined = player?.gamesCompleted
  const wins: number | undefined = player?.wins
  const loses: number | undefined = player?.loses
  const streak: number | undefined = player?.streak

  const handleSendMessage = (): void => {
    onCancel?.()
  }

  useEffect(() => {
    setIsCurrentUser(player?.userId === session?.user.id)
  }, [player, session])

  useEffect(() => {
    if (player?.user.lastActiveAt) {
      const lastActiveAt: Date = new Date(player.user?.lastActiveAt)
      const relativeTime: string = formatDistanceToNow(lastActiveAt, {
        addSuffix: true,
        locale: getDateFnsLocale(i18n.locale),
      })
      setIdleTime(relativeTime)
    }
  }, [player?.user?.lastActiveAt, i18n.locale])

  return (
    <Modal
      isOpen={isOpen}
      title={t({ message: `Player information of ${username}` })}
      confirmText={isCurrentUser ? undefined : t({ message: "Send" })}
      dataTestId="player-information-modal"
      onConfirm={isCurrentUser ? undefined : handleSendMessage}
      onCancel={onCancel}
    >
      <div className="flex flex-col gap-2">
        <div>
          {isRatingsVisible && (
            <>
              <Trans>Rating: {rating}</Trans> <br />
              <Trans>Games Completed: {gamesCompleted}</Trans> <br />
              <Trans>Wins: {wins}</Trans> <br />
              <Trans>Loses: {loses}</Trans> <br />
              <Trans>Streak: {streak}</Trans> <br />
            </>
          )}
        </div>
        {!isCurrentUser && (
          <Input
            id="reason"
            label={t({ message: "Send instant message" })}
            defaultValue={reason}
            onInput={(event: ChangeEvent<HTMLInputElement>) => setReason(event.target.value)}
          />
        )}
        <div>
          <Trans>Idle Time: {idleTime}</Trans>
        </div>
      </div>
    </Modal>
  )
}

"use client"

import { ChangeEvent, ReactNode, useEffect, useState } from "react"
import { ITowersUserRoomTable } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"
import Input from "@/components/ui/Input"
import Modal from "@/components/ui/Modal"
import { useSessionData } from "@/hooks/useSessionData"

type PlayerInformationProps = {
  isOpen: boolean
  player: ITowersUserRoomTable | undefined
  isRatingsVisible?: boolean | null
  onCancel: () => void
}

export default function PlayerInformation({
  isOpen,
  player,
  isRatingsVisible = false,
  onCancel,
}: PlayerInformationProps): ReactNode {
  const { data: session } = useSessionData()
  const [isCurrentUser, setIsCurrentUser] = useState<boolean>(false)
  const [reason, setReason] = useState<string>("")
  const [idleTime, setIdleTime] = useState<string>("")

  useEffect(() => {
    setIsCurrentUser(player?.userProfile?.userId === session?.user.id)
  }, [player, session])

  useEffect(() => {
    if (player?.userProfile?.user.lastActiveAt) {
      const lastActiveAt: Date = new Date(player.userProfile?.user?.lastActiveAt)
      const relativeTime: string = formatDistanceToNow(lastActiveAt, { addSuffix: true })
      setIdleTime(relativeTime)
    }
  }, [player?.userProfile?.user?.lastActiveAt])

  const handleSendMessage = (): void => {
    onCancel?.()
  }

  return (
    <Modal
      isOpen={isOpen}
      title={`Player information of ${player?.userProfile?.user?.username}`}
      confirmText={isCurrentUser ? undefined : "Send"}
      dataTestId="player-information-modal"
      onConfirm={isCurrentUser ? undefined : handleSendMessage}
      onCancel={onCancel}
    >
      <div className="flex flex-col gap-2">
        <div>
          {isRatingsVisible && (
            <>
              Rating: {player?.userProfile?.rating} <br />
              Games Completed: {player?.userProfile?.gamesCompleted} <br />
              Wins: {player?.userProfile?.wins} <br />
              Loses: {player?.userProfile?.loses} <br />
              Streak: {player?.userProfile?.streak} <br />
            </>
          )}
        </div>
        {!isCurrentUser && (
          <Input
            id="reason"
            label="Send instant message"
            defaultValue={reason}
            onInput={(event: ChangeEvent<HTMLInputElement>) => setReason(event.target.value)}
          />
        )}
        <div>Idle Time: {idleTime || "Calculating..."}</div>
      </div>
    </Modal>
  )
}

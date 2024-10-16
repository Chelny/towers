"use client"

import { ChangeEvent, ReactNode, useEffect, useState } from "react"
import { ITowersUserProfile } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"
import Input from "@/components/ui/Input"
import Modal from "@/components/ui/Modal"
import { useSessionData } from "@/hooks/useSessionData"

type PlayerInformationProps = {
  isOpen: boolean
  player: ITowersUserProfile | undefined
  isRatingsVisible?: boolean
  onCancel: () => void
}

export default function PlayerInformation({
  isOpen,
  player,
  isRatingsVisible = false,
  onCancel
}: PlayerInformationProps): ReactNode {
  const { data: session } = useSessionData()
  const [isCurrentUser, setIsCurrentUser] = useState<boolean>(false)
  const [reason, setReason] = useState<string>("")
  const [idleTime, setIdleTime] = useState<string>("")

  useEffect(() => {
    setIsCurrentUser(player?.userId === session?.user.id)
  }, [player, session])

  useEffect(() => {
    if (player?.user.lastActiveAt) {
      const lastActiveAt: Date = new Date(player.user.lastActiveAt)
      const relativeTime: string = formatDistanceToNow(lastActiveAt, { addSuffix: true })
      setIdleTime(relativeTime)
    }
  }, [player?.user.lastActiveAt])

  const handleSendMessage = (): void => {
    onCancel()
  }

  return (
    <Modal
      title={`Player information of ${player?.user.username}`}
      isOpen={isOpen}
      confirmText={isCurrentUser ? undefined : "Send"}
      dataTestId="player-information-modal"
      onConfirm={isCurrentUser ? undefined : handleSendMessage}
      onCancel={onCancel}
    >
      <div className="flex flex-col gap-2">
        <div>
          {isRatingsVisible && (
            <>
              Rating: {player?.rating} <br />
              Games Completed: {player?.gamesCompleted} <br />
              Wins: {player?.wins} <br />
              Loses: {player?.loses} <br />
              Streak: {player?.streak} <br />
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

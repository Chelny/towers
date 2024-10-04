"use client"

import { ChangeEvent, ReactNode, useEffect, useState } from "react"
import { TowersUser } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"
import Input from "@/components/ui/Input"
import Modal from "@/components/ui/Modal"
import { useSessionData } from "@/hooks/useSessionData"

type PlayerInformationProps = {
  isOpen: boolean
  player: TowersUser | undefined
  onCancel: () => void
}

export default function PlayerInformation({ isOpen, player, onCancel }: PlayerInformationProps): ReactNode {
  const { data: session } = useSessionData()
  const [isCurrentUser, setIsCurrentUser] = useState<boolean>(false)
  const [reason, setReason] = useState<string>("")
  const [idleTime, setIdleTime] = useState<string>("")

  useEffect(() => {
    setIsCurrentUser(player?.towersUserProfile.user.id === session?.user?.id)
  }, [player, session])

  useEffect(() => {
    if (player?.towersUserProfile?.user.lastActiveAt) {
      const lastActiveAt: Date = new Date(player.towersUserProfile?.user.lastActiveAt)
      const relativeTime: string = formatDistanceToNow(lastActiveAt, { addSuffix: true })
      setIdleTime(relativeTime)
    }
  }, [player?.towersUserProfile?.user.lastActiveAt])

  // TODO: Send message by socket user id + reason
  const handleSendMessage = (): void => {
    onCancel()
  }

  return (
    <Modal
      title={`Player information for ${player?.towersUserProfile?.user.username}`}
      isOpen={isOpen}
      confirmText={isCurrentUser ? undefined : "Send"}
      dataTestId="player-information-modal"
      onConfirm={isCurrentUser ? undefined : handleSendMessage}
      onCancel={onCancel}
    >
      <div className="flex flex-col gap-2">
        <div>
          Rating: {player?.towersUserProfile?.rating} <br />
          Games Completed: {player?.towersUserProfile?.gamesCompleted} <br />
          Wins: {player?.towersUserProfile?.wins} <br />
          Loses: {player?.towersUserProfile?.loses} <br />
          Streak: {player?.towersUserProfile?.streak} <br />
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

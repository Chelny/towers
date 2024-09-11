"use client"

import { ChangeEvent, ReactNode, useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import Input from "@/components/ui/Input"
import Modal from "@/components/ui/Modal"
import { TowersGameUserWithUserAndTables } from "@/interfaces"

type PlayerInformationProps = {
  isOpen: boolean
  player: TowersGameUserWithUserAndTables | undefined
  onCancel: () => void
}

export default function PlayerInformation({ isOpen, player, onCancel }: PlayerInformationProps): ReactNode {
  const [reason, setReason] = useState<string>("")
  const [idleTime, setIdleTime] = useState<string>("")

  useEffect(() => {
    if (player?.user.lastActiveAt) {
      const lastActiveAt: Date = new Date(player.user.lastActiveAt)
      const relativeTime: string = formatDistanceToNow(lastActiveAt, { addSuffix: true })
      setIdleTime(relativeTime)
    }
  }, [player?.user.lastActiveAt])

  const handleSendMessage = (): void => {
    // TODO: Send message by socket user id + reason
    onCancel()
  }

  return (
    <Modal
      title={`Player information for ${player?.user.username}`}
      isOpen={isOpen}
      confirmText="Send"
      dataTestId="player-information-modal"
      onConfirm={handleSendMessage}
      onCancel={onCancel}
    >
      <div className="flex flex-col gap-2">
        <div>
          Rating: {player?.rating} <br />
          Games Completed: {player?.gamesCompleted} <br />
          Wins: {player?.wins} <br />
          Loses: {player?.loses} <br />
          Streak: {player?.streak} <br />
        </div>
        <Input
          id="reason"
          label="Send instant message"
          defaultValue={reason}
          onInput={(event: ChangeEvent<HTMLInputElement>) => setReason(event.target.value)}
        />
        <div>Idle Time: {idleTime || "Calculating..."}</div>
      </div>
    </Modal>
  )
}

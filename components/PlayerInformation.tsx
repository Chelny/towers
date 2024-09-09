"use client"

import { ChangeEvent, ReactNode, useState } from "react"
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
      <div className="flex flex-col gap-4">
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
        {/* TODO: Idle time */}
        {/* <div>Idle Time: 52.05 seconds</div> */}
      </div>
    </Modal>
  )
}

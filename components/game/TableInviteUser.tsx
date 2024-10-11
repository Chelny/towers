"use client"

import { ReactNode, useState } from "react"
import dynamic from "next/dynamic"
import { ITowersUserProfile } from "@prisma/client"
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton"
import Modal from "@/components/ui/Modal"

type TableInviteUserProps = {
  isOpen: boolean
  users: ITowersUserProfile[]
  onCancel: () => void
}

export default function TableInviteUser({ isOpen, users, onCancel }: TableInviteUserProps): ReactNode {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  const handleSelectedPlayer = (): void => {
    onCancel()
  }

  return (
    <Modal
      title="Invite User"
      isOpen={isOpen}
      confirmText="Invite"
      isConfirmButtonDisabled={users?.length == 0}
      dataTestId="table-invite-user-modal"
      onConfirm={handleSelectedPlayer}
      onCancel={onCancel}
    >
      <div className="overflow-y-auto h-72">
        <PlayersList users={users} full onSelectedPlayer={setSelectedPlayerId} />
      </div>
    </Modal>
  )
}

const PlayersList = dynamic(() => import("@/components/game/PlayersList"), {
  loading: () => <PlayersListSkeleton full />
})

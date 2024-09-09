"use client"

import { ReactNode, useState } from "react"
import dynamic from "next/dynamic"
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton"
import Modal from "@/components/ui/Modal"
import { TowersGameUserWithUserAndTables } from "@/interfaces"

type TableInviteUserProps = {
  isOpen: boolean
  users: TowersGameUserWithUserAndTables[]
  onCancel: () => void
}

export default function TableInviteUser({ isOpen, users, onCancel }: TableInviteUserProps): ReactNode {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  const handleSelectedPlayer = (): void => {
    // TODO: Emit socket event
    onCancel()
  }

  return (
    <Modal
      title="Invite User"
      isOpen={isOpen}
      confirmText="Invite"
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

const PlayersList = dynamic(() => import("@/components/PlayersList"), {
  loading: () => <PlayersListSkeleton full />
})

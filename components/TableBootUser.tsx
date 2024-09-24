"use client"

import { ReactNode, useState } from "react"
import dynamic from "next/dynamic"
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton"
import Modal from "@/components/ui/Modal"
import { TowersGameUserWithUserAndTables } from "@/interfaces/towers-game-user"

type TableBootUserProps = {
  isOpen: boolean
  users: TowersGameUserWithUserAndTables[]
  onCancel: () => void
}

export default function TableBootUser({ isOpen, users, onCancel }: TableBootUserProps): ReactNode {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  const handleSelectedPlayer = (): void => {
    // TODO: Emit socket event
    onCancel()
  }

  return (
    <Modal
      title="Boot User"
      isOpen={isOpen}
      confirmText="Boot"
      dataTestId="table-boot-user-modal"
      onConfirm={handleSelectedPlayer}
      onCancel={onCancel}
    >
      <div className="overflow-y-auto h-52">
        <PlayersList users={users} onSelectedPlayer={setSelectedPlayerId} />
      </div>
    </Modal>
  )
}

const PlayersList = dynamic(() => import("@/components/PlayersList"), {
  loading: () => <PlayersListSkeleton />
})

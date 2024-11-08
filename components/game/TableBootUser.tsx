"use client"

import { ReactNode, useState } from "react"
import dynamic from "next/dynamic"
import { ITowersUserRoomTable } from "@prisma/client"
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton"
import Modal from "@/components/ui/Modal"

type TableBootUserProps = {
  isOpen: boolean
  users: ITowersUserRoomTable[]
  isRatingsVisible: boolean | null
  onCancel: () => void
}

export default function TableBootUser({ isOpen, users, isRatingsVisible, onCancel }: TableBootUserProps): ReactNode {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  const handleSelectedPlayer = (): void => {
    onCancel?.()
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Boot User"
      confirmText="Boot"
      isConfirmButtonDisabled={users?.length === 0}
      dataTestId="table-boot-user-modal"
      onConfirm={handleSelectedPlayer}
      onCancel={onCancel}
    >
      <div className="overflow-y-auto h-52">
        <PlayersList users={users} isRatingsVisible={isRatingsVisible} onSelectedPlayer={setSelectedPlayerId} />
      </div>
    </Modal>
  )
}

const PlayersList = dynamic(() => import("@/components/game/PlayersList"), {
  loading: () => <PlayersListSkeleton />,
})

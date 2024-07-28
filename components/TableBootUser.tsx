"use client"

import { ReactNode, useState } from "react"
import dynamic from "next/dynamic"
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton"
import Modal from "@/components/ui/Modal"
import { TowersGameUserWithUserAndTables } from "@/interfaces"

type TableBootUserProps = {
  isOpen: boolean
  users: TowersGameUserWithUserAndTables[]
  onClose: () => void
}

export default function TableBootUser({ isOpen, users, onClose }: TableBootUserProps): ReactNode {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  const handleSelectedPlayer = (): void => {
    // TODO: Emit socket event
    console.log("handleSelectedPlayer", selectedPlayerId)
    onClose()
  }

  return (
    <Modal title="Boot User" isOpen={isOpen} onClose={onClose} confirmText="Boot" onConfirm={handleSelectedPlayer}>
      <div className="overflow-y-auto h-52">
        <PlayersList users={users} onSelectedPlayer={setSelectedPlayerId} />
      </div>
    </Modal>
  )
}

const PlayersList = dynamic(() => import("@/components/PlayersList"), {
  loading: () => <PlayersListSkeleton />
})

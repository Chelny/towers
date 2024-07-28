"use client"

import { ReactNode, useState } from "react"
import dynamic from "next/dynamic"
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton"
import Modal from "@/components/ui/Modal"
import { TowersGameUserWithUserAndTables } from "@/interfaces"

type TableInviteUserProps = {
  isOpen: boolean
  users: TowersGameUserWithUserAndTables[]
  onClose: () => void
}

export default function TableInviteUser({ isOpen, users, onClose }: TableInviteUserProps): ReactNode {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  const handleSelectedPlayer = (): void => {
    // TODO: Emit socket event
    console.log("handleSelectedPlayer", selectedPlayerId)
    onClose()
  }

  return (
    <Modal title="Invite User" isOpen={isOpen} onClose={onClose} confirmText="Invite" onConfirm={handleSelectedPlayer}>
      <div className="overflow-y-auto h-72">
        <PlayersList users={users} full onSelectedPlayer={setSelectedPlayerId} />
      </div>
    </Modal>
  )
}

const PlayersList = dynamic(() => import("@/components/PlayersList"), {
  loading: () => <PlayersListSkeleton full />
})

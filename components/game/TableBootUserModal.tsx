"use client"

import { ReactNode, useState } from "react"
import dynamic from "next/dynamic"
import { useLingui } from "@lingui/react/macro"
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton"
import Modal from "@/components/ui/Modal"
import { SocketEvents } from "@/constants/socket-events"
import { useSocket } from "@/context/SocketContext"
import { UserPlainObject } from "@/server/towers/classes/User"

const PlayersList = dynamic(() => import("@/components/game/PlayersList"), {
  loading: () => <PlayersListSkeleton />,
})

type TableBootUserModalProps = {
  roomId: string
  tableId: string
  hostId?: string
  usersToBoot?: UserPlainObject[]
  isRatingsVisible?: boolean
  onCancel: () => void
}

export default function TableBootUserModal({
  roomId,
  tableId,
  hostId,
  usersToBoot,
  isRatingsVisible,
  onCancel,
}: TableBootUserModalProps): ReactNode {
  const { socketRef } = useSocket()
  const { t } = useLingui()
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  const handleSelectedPlayer = (): void => {
    socketRef.current?.emit(SocketEvents.TABLE_BOOT_USER, { roomId, tableId, hostId, userToBootId: selectedPlayerId })
    onCancel?.()
  }

  return (
    <Modal
      title={t({ message: "Boot User" })}
      confirmText={t({ message: "Boot" })}
      isConfirmButtonDisabled={usersToBoot?.length === 0}
      dataTestId="table-boot-user"
      onConfirm={handleSelectedPlayer}
      onCancel={onCancel}
    >
      <div className="overflow-y-auto h-52">
        <PlayersList users={usersToBoot} isRatingsVisible={isRatingsVisible} onSelectedPlayer={setSelectedPlayerId} />
      </div>
    </Modal>
  )
}

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
  loading: () => <PlayersListSkeleton isTableNumberVisible />,
})

type TableInviteUserModalProps = {
  roomId: string
  tableId: string
  usersToInvite?: UserPlainObject[]
  isRatingsVisible?: boolean
  onCancel: () => void
}

export default function TableInviteUserModal({
  roomId,
  tableId,
  usersToInvite,
  isRatingsVisible,
  onCancel,
}: TableInviteUserModalProps): ReactNode {
  const { socketRef, session } = useSocket()
  const { t } = useLingui()
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  const handleUserToInvite = (): void => {
    socketRef.current?.emit(SocketEvents.TABLE_INVITE_USER, {
      roomId,
      tableId,
      inviterUserId: session?.user.id,
      inviteeUserId: selectedPlayerId,
    })
    onCancel?.()
  }

  return (
    <Modal
      title={t({ message: "Invite User" })}
      confirmText={t({ message: "Invite" })}
      isConfirmButtonDisabled={usersToInvite?.length == 0}
      dataTestId="table-invite-user"
      onConfirm={handleUserToInvite}
      onCancel={onCancel}
    >
      <div className="overflow-y-auto h-72">
        <PlayersList
          users={usersToInvite}
          isRatingsVisible={isRatingsVisible}
          isTableNumberVisible
          onSelectedPlayer={setSelectedPlayerId}
        />
      </div>
    </Modal>
  )
}

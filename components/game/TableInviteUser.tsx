"use client"

import { ReactNode, useState } from "react"
import dynamic from "next/dynamic"
import { useLingui } from "@lingui/react/macro"
import { ITowersUserRoomTable } from "@prisma/client"
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton"
import Modal from "@/components/ui/Modal"

type TableInviteUserProps = {
  isOpen: boolean
  users: ITowersUserRoomTable[]
  isRatingsVisible: boolean | null
  onCancel: () => void
}

export default function TableInviteUser({
  isOpen,
  users,
  isRatingsVisible,
  onCancel,
}: TableInviteUserProps): ReactNode {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const { t } = useLingui()

  const handleUserToInvite = (): void => {
    onCancel?.()
  }

  return (
    <Modal
      isOpen={isOpen}
      title={t({ message: "Invite User" })}
      confirmText={t({ message: "Invite" })}
      isConfirmButtonDisabled={users?.length == 0}
      dataTestId="table-invite-user-modal"
      onConfirm={handleUserToInvite}
      onCancel={onCancel}
    >
      <div className="overflow-y-auto h-72">
        <PlayersList
          users={users}
          isRatingsVisible={isRatingsVisible}
          isTableNumberVisible
          onSelectedPlayer={setSelectedPlayerId}
        />
      </div>
    </Modal>
  )
}

const PlayersList = dynamic(() => import("@/components/game/PlayersList"), {
  loading: () => <PlayersListSkeleton isTableNumberVisible />,
})

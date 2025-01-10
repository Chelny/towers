"use client"

import { ReactNode, useState } from "react"
import dynamic from "next/dynamic"
import { useLingui } from "@lingui/react/macro"
import { ITowersUserProfile } from "@prisma/client"
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton"
import Modal from "@/components/ui/Modal"
import { authClient } from "@/lib/auth-client"
import { useAppSelector } from "@/lib/hooks"
import { selectRoomUsersInvite } from "@/redux/selectors/socket-selectors"
import { RootState } from "@/redux/store"

type TableInviteUserProps = {
  tableId: string
  isOpen: boolean
  isRatingsVisible: boolean | undefined
  onCancel: () => void
}

export default function TableInviteUser({
  tableId,
  isOpen,
  isRatingsVisible,
  onCancel,
}: TableInviteUserProps): ReactNode {
  const { data: session } = authClient.useSession()
  const users: ITowersUserProfile[] = useAppSelector((state: RootState) =>
    selectRoomUsersInvite(state, tableId, session),
  )
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

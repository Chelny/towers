"use client"

import { ReactNode, useState } from "react"
import dynamic from "next/dynamic"
import { useLingui } from "@lingui/react/macro"
import { ITowersUserProfile } from "@prisma/client"
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton"
import Modal from "@/components/ui/Modal"
import { authClient } from "@/lib/auth-client"
import { useAppSelector } from "@/lib/hooks"
import { selectTableUsersBoot } from "@/redux/selectors/socket-selectors"
import { RootState } from "@/redux/store"

type TableBootUserProps = {
  tableId: string
  isOpen: boolean
  isRatingsVisible: boolean | undefined
  onCancel: () => void
}

export default function TableBootUser({ tableId, isOpen, isRatingsVisible, onCancel }: TableBootUserProps): ReactNode {
  const { data: session } = authClient.useSession()
  const users: ITowersUserProfile[] = useAppSelector((state: RootState) =>
    selectTableUsersBoot(state, tableId, session),
  )
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const { t } = useLingui()

  const handleSelectedPlayer = (): void => {
    onCancel?.()
  }

  return (
    <Modal
      isOpen={isOpen}
      title={t({ message: "Boot User" })}
      confirmText={t({ message: "Boot" })}
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

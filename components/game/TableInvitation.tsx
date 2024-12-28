"use client"

import { ChangeEvent, ReactNode, useState } from "react"
import { Trans, useLingui } from "@lingui/react/macro"
import { TowersTable, User } from "@prisma/client"
import Checkbox from "@/components/ui/Checkbox"
import Input from "@/components/ui/Input"
import Modal from "@/components/ui/Modal"

export interface TableInvitationData {
  user: Partial<User>
  table: Partial<TowersTable>
}

type TableInvitationProps = {
  isOpen: boolean
  data: TableInvitationData
  onAcceptInvitation: (tableId: string) => void
  onCancel: () => void
}

export default function TableInvitation({
  isOpen,
  data,
  onAcceptInvitation,
  onCancel,
}: TableInvitationProps): ReactNode {
  const [reason, setReason] = useState<string>("")
  const [declineAll, setDeclineAll] = useState<boolean>(false)
  const { t } = useLingui()
  const username: string | undefined = data.user?.username
  const userRating: number | undefined = 2552 // TODO: Get rating from user
  const tableNumber: number | undefined = data.table?.tableNumber
  const ratedOption: string = data.table?.rated ? "Rated" : "Not Rated"

  const handleAcceptInvitation = (): void => {
    onAcceptInvitation("test-34")
    onCancel?.()
  }

  return (
    <Modal
      isOpen={isOpen}
      title={t({ message: "Invited" })}
      confirmText={t({ message: "Accept" })}
      cancelText={t({ message: "Decline" })}
      dataTestId="table-invitation-modal"
      onConfirm={handleAcceptInvitation}
      onCancel={onCancel}
    >
      <div className="flex flex-col gap-4">
        <div>
          <Trans>
            {username} ({userRating}) invited you to table #{tableNumber}.
          </Trans>
        </div>
        <div>
          <Trans>Game option: {ratedOption}</Trans>
        </div>
        <div>
          <Trans>Would you like to join?</Trans>
        </div>
        <div>
          <Input
            id="reason"
            label={t({ message: "Reason" })}
            defaultValue={reason}
            onInput={(event: ChangeEvent<HTMLInputElement>) => setReason(event.target.value)}
          />
          <Checkbox
            id="declineAll"
            label={t({ message: "Decline All Invitations" })}
            defaultChecked={declineAll}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setDeclineAll(event.target.checked)}
          />
        </div>
      </div>
    </Modal>
  )
}

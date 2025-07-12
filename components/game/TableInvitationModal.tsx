"use client"

import { ChangeEvent, InputEvent, ReactNode, useState } from "react"
import { Trans, useLingui } from "@lingui/react/macro"
import Checkbox from "@/components/ui/Checkbox"
import Input from "@/components/ui/Input"
import Modal from "@/components/ui/Modal"
import { SocketEvents } from "@/constants/socket-events"
import { useSocket } from "@/context/SocketContext"
import { TableInvitationPlainObject } from "@/server/towers/classes/TableInvitation"

type TableInvitationModalProps = {
  tableInvitation: TableInvitationPlainObject
  onAcceptInvitation: (roomId: string, tableId: string) => void
  onCancel: () => void
}

export default function TableInvitationModal({
  tableInvitation,
  onAcceptInvitation,
  onCancel,
}: TableInvitationModalProps): ReactNode {
  const { socketRef } = useSocket()
  const { t } = useLingui()
  const [reason, setReason] = useState<string | undefined>(undefined)
  const [declineAll, setDeclineAll] = useState<boolean>(false)
  const username: string | undefined = tableInvitation.inviterUsername
  const userRating: number = tableInvitation.inviterRating
  const tableNumber: number = tableInvitation.tableNumber
  const ratedOption: string = tableInvitation.tableIsRated ? t({ message: "Rated" }) : t({ message: "Not Rated" })

  const handleAcceptInvitation = (): void => {
    socketRef.current?.emit(SocketEvents.TABLE_INVITATION_ACCEPTED, {
      roomId: tableInvitation.roomId,
      tableId: tableInvitation.tableId,
      inviteeUserId: tableInvitation.inviteeUserId,
    })
    onAcceptInvitation(tableInvitation.roomId, tableInvitation.tableId)
    onCancel?.()
  }

  const handleDeclineInvitation = (): void => {
    socketRef.current?.emit(SocketEvents.TABLE_INVITATION_DECLINED, {
      roomId: tableInvitation.roomId,
      tableId: tableInvitation.tableId,
      inviteeUserId: tableInvitation.inviteeUserId,
      reason,
    })
    onCancel?.()
  }

  return (
    <Modal
      title={t({ message: "Invited" })}
      confirmText={t({ message: "Accept" })}
      cancelText={t({ message: "Decline" })}
      dataTestId="table-invitation"
      onConfirm={handleAcceptInvitation}
      onCancel={handleDeclineInvitation}
    >
      <div className="flex flex-col gap-4">
        <div>
          <Trans>
            {username} ({userRating}) has invited you to table #{tableNumber}.
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
            dataTestId="table-invitation_input-text_reason"
            onInput={(event: InputEvent<HTMLInputElement>) => setReason((event.target as HTMLInputElement).value)}
          />
          <Checkbox
            id="declineAll"
            label={t({ message: "Decline All Invitations" })}
            defaultChecked={declineAll}
            disabled
            onChange={(event: ChangeEvent<HTMLInputElement>) => setDeclineAll(event.target.checked)}
          />
        </div>
      </div>
    </Modal>
  )
}

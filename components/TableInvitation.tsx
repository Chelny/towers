"use client"

import { ChangeEvent, ReactNode, useState } from "react"
import { Table, User } from "@prisma/client"
import Checkbox from "@/components/ui/Checkbox"
import Input from "@/components/ui/Input"
import Modal from "@/components/ui/Modal"

export interface TableInvitationData {
  user: Partial<User>
  table: Partial<Table>
}

type TableInvitationProps = {
  isOpen: boolean
  data: TableInvitationData
  onClose: () => void
  onAcceptInvitation: (tableId: string) => void
}

export default function TableInvitation({
  isOpen,
  data,
  onClose,
  onAcceptInvitation
}: TableInvitationProps): ReactNode {
  const [reason, setReason] = useState<string>("")
  const [declineAll, setDeclineAll] = useState<boolean>(false)

  const handleDeclineInvitation = (): void => {
    // TODO: Emit socket event + decline reason to the other user's socket id
    console.log("handleDeclineInvitation", reason, declineAll)
    onClose()
  }

  const handleAcceptInvitation = (): void => {
    // TODO: Pass table id (data.table.id) to parent compoment
    onAcceptInvitation("test-34")
  }

  return (
    <Modal
      title="Invited"
      isOpen={isOpen}
      closeText="Decline"
      onClose={handleDeclineInvitation}
      confirmText="Accept"
      onConfirm={handleAcceptInvitation}
    >
      <div className="flex flex-col gap-4">
        <div>
          {data.user?.username} (2552) invited you to table #{data.table?.tableNumber}.
        </div>
        <div>Game option: {data.table?.rated ? "Rated" : "Not rated"}</div>
        <div>Would you like to join?</div>
        <div>
          <Input
            id="reason"
            label="Reason"
            defaultValue={reason}
            onInput={(event: ChangeEvent<HTMLInputElement>) => setReason(event.target.value)}
          />
          <Checkbox
            id="declineAll"
            label="Decline All Invitations"
            defaultChecked={declineAll}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setDeclineAll(event.target.checked)}
          />
        </div>
      </div>
    </Modal>
  )
}

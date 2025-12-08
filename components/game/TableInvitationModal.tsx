"use client";

import { ChangeEvent, InputEvent, ReactNode, useState } from "react";
import { Trans, useLingui } from "@lingui/react/macro";
import { RoomLevel } from "db";
import Checkbox from "@/components/ui/Checkbox";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { ClientToServerEvents } from "@/constants/socket/client-to-server";
import { useSocket } from "@/context/SocketContext";
import { SocketCallback } from "@/interfaces/socket";
import { TableInvitationPlainObject } from "@/server/towers/classes/TableInvitation";

type TableInvitationModalProps = {
  tableInvitation: TableInvitationPlainObject
  onAcceptInvitation: (roomId: string, tableId: string) => void
  onCancel: () => void
};

export default function TableInvitationModal({
  tableInvitation,
  onAcceptInvitation,
  onCancel,
}: TableInvitationModalProps): ReactNode {
  const { socketRef } = useSocket();
  const { t } = useLingui();
  const [reason, setReason] = useState<string>("");
  const [isDeclineAll, setIsDeclineAll] = useState<boolean>(false);
  const username: string | undefined = tableInvitation.inviterPlayer.user.username;
  const rating: number | undefined = tableInvitation.inviterPlayer.stats?.rating;
  const isRatingVisible: boolean = tableInvitation.room.level !== RoomLevel.SOCIAL;
  const inviterInfo: string = isRatingVisible ? `${username} (${rating})` : username;
  const tableNumber: number = tableInvitation.table.tableNumber;
  const ratedOption: string = tableInvitation.table.isRated ? t({ message: "Rated" }) : t({ message: "Not Rated" });

  const handleAcceptInvitation = (): void => {
    socketRef.current?.emit(
      ClientToServerEvents.TABLE_INVITATION_ACCEPTED,
      { invitationId: tableInvitation.id },
      (response: SocketCallback<void>) => {
        if (response.success) {
          onAcceptInvitation(tableInvitation.roomId, tableInvitation.tableId);
          onCancel?.();
        }
      },
    );
  };

  const handleDeclineInvitation = (): void => {
    socketRef.current?.emit(
      ClientToServerEvents.TABLE_INVITATION_DECLINED,
      {
        invitationId: tableInvitation.id,
        reason,
        isDeclineAll: isDeclineAll,
      },
      (response: SocketCallback<void>) => {
        if (response.success) {
          onCancel?.();
        }
      },
    );
  };

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
            {inviterInfo} has invited you to table #{tableNumber}.
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
            defaultChecked={isDeclineAll}
            disabled
            onChange={(event: ChangeEvent<HTMLInputElement>) => setIsDeclineAll(event.target.checked)}
          />
        </div>
      </div>
    </Modal>
  );
}

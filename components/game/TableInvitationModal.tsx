"use client";

import { ChangeEvent, InputEvent, ReactNode, useState } from "react";
import { Trans, useLingui } from "@lingui/react/macro";
import { RoomLevel, TowersTableInvitationWithRelations } from "db";
import useSWRMutation from "swr/mutation";
import Checkbox from "@/components/ui/Checkbox";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { fetcher } from "@/lib/fetcher";

type TableInvitationModalProps = {
  tableInvitation: TowersTableInvitationWithRelations
  onAcceptInvitation: (roomId: string, tableId: string) => void
  onCancel: () => void
}

export default function TableInvitationModal({
  tableInvitation,
  onAcceptInvitation,
  onCancel,
}: TableInvitationModalProps): ReactNode {
  const { t } = useLingui();
  const [reason, setReason] = useState<string | undefined>(undefined);
  const [isDeclineAll, setIsDeclineAll] = useState<boolean>(false);
  const username: string | undefined = tableInvitation.inviterPlayer.user.username;
  const userRating: number | undefined = tableInvitation.inviterPlayer.stats?.rating;
  const tableNumber: number | undefined = tableInvitation.table.tableNumber;
  const ratedOption: string = tableInvitation.table.isRated ? t({ message: "Rated" }) : t({ message: "Not Rated" });

  const {
    error: acceptTableInviteError,
    trigger: acceptTableInvite,
    isMutating: isAcceptTableInviteMutating,
  } = useSWRMutation(
    `/api/games/towers/tables/${tableInvitation.tableId}/invite/${tableInvitation.id}/accept`,
    (url: string) => fetcher<TowersTableInvitationWithRelations>(url, { method: "PATCH" }),
    {
      onSuccess(response: ApiResponse<TowersTableInvitationWithRelations>) {
        if (response.success) {
          const invitation: TowersTableInvitationWithRelations | undefined = response.data;
          if (invitation) {
            onAcceptInvitation(invitation.roomId, invitation.tableId);
            onCancel?.();
          }
        }
      },
    },
  );

  const {
    error: declineTableInviteError,
    trigger: declineTableInvite,
    isMutating: isDeclineTableInviteMutating,
  } = useSWRMutation(
    `/api/games/towers/tables/${tableInvitation.tableId}/invite/${tableInvitation.id}/decline`,
    (url: string, { arg }: { arg: { reason: string | undefined; isDeclineAll: boolean } }) =>
      fetcher<void>(url, { method: "PATCH", body: JSON.stringify(arg) }),
    {
      onSuccess(response: ApiResponse<void>) {
        if (response.success) {
          onCancel?.();
        }
      },
    },
  );

  return (
    <Modal
      title={t({ message: "Invited" })}
      confirmText={t({ message: "Accept" })}
      cancelText={t({ message: "Decline" })}
      isConfirmButtonDisabled={isAcceptTableInviteMutating || isDeclineTableInviteMutating}
      dataTestId="table-invitation"
      onConfirm={async () => await acceptTableInvite()}
      onCancel={async () => await declineTableInvite({ reason, isDeclineAll })}
    >
      <div className="flex flex-col gap-4">
        <div>
          {tableInvitation.table.room.level !== RoomLevel.SOCIAL ? (
            <Trans>
              {username} ({userRating}) has invited you to table #{tableNumber}.
            </Trans>
          ) : (
            <Trans>
              {username} has invited you to table #{tableNumber}.
            </Trans>
          )}
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
            disabled={isAcceptTableInviteMutating || isDeclineTableInviteMutating}
            dataTestId="table-invitation_input-text_reason"
            onInput={(event: InputEvent<HTMLInputElement>) => setReason((event.target as HTMLInputElement).value)}
          />
          <Checkbox
            id="isDeclineAll"
            label={t({ message: "Decline All Invitations" })}
            defaultChecked={isDeclineAll}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setIsDeclineAll(event.target.checked)}
          />
        </div>
      </div>
    </Modal>
  );
}

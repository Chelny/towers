"use client";

import { ReactNode, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useLingui } from "@lingui/react/macro";
import { TowersTablePlayerWithRelations } from "db";
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton";
import Modal from "@/components/ui/Modal";
import { SocketEvents } from "@/constants/socket-events";
import { useSocket } from "@/context/SocketContext";
import { SocketCallback } from "@/interfaces/socket";

const PlayersList = dynamic(() => import("@/components/game/PlayersList"), {
  loading: () => <PlayersListSkeleton isTableNumberVisible />,
});

type TableInviteUserModalProps = {
  roomId: string
  tableId: string
  isRatingsVisible?: boolean
  onCancel: () => void
}

export default function TableInviteUserModal({
  roomId,
  tableId,
  isRatingsVisible,
  onCancel,
}: TableInviteUserModalProps): ReactNode {
  const { t } = useLingui();
  const { socketRef, isConnected } = useSocket();
  const [playersToInvite, setPlayersToInvite] = useState<TowersTablePlayerWithRelations[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // const {
  //   data: playersToInviteResponse,
  //   error: playersToInviteError,
  //   mutate: loadPlayersToInvite,
  //   isLoading: isLoadingPlayersToInvite,
  // } = useSWR<ApiResponse<PlayerWithRelations[]>>(
  //   `/api/games/towers/tables/${tableId}/invite`,
  //   fetcher,
  //   {
  //     shouldRetryOnError: false,
  //     revalidateOnFocus: false,
  //     revalidateOnReconnect: false,
  //   },
  // );

  // const {
  //   error: inviteUserError,
  //   trigger: inviteUser,
  //   isMutating: isInviteUserMutating,
  // } = useSWRMutation(
  //   `/api/games/towers/tables/${tableId}/invite`,
  //   (url: string, { arg }: { arg: { roomId: string, inviteePlayerId: string | null } }) => fetcher<void>(
  //     url,
  //     { method: "POST", body: JSON.stringify(arg) },
  //   ),
  //   {
  //     onSuccess(response: ApiResponse<void>) {
  //       if (response.success) {
  //         // TODO: Show message (response.message) in toast
  //         onCancel?.();
  //       }
  //     },
  //   },
  // );

  // useEffect(() => {
  //   if (playersToInviteResponse?.data) {
  //     setPlayersToInvite(playersToInviteResponse.data);
  //   }
  // }, [playersToInviteResponse]);

  useEffect(() => {
    if (!socketRef.current) return;

    const handleLoadPlayersToInvite = async (): Promise<void> => {
      socketRef.current?.emit(
        SocketEvents.TABLE_PLAYERS_TO_INVITE,
        { tableId },
        (response: SocketCallback<{ playersToInvite: TowersTablePlayerWithRelations[] }>): void => {
          if (response.success && response.data) {
            setPlayersToInvite(response.data.playersToInvite);
          }
        },
      );
    };

    handleLoadPlayersToInvite();

    socketRef.current?.on(SocketEvents.TABLE_PLAYER_JOINED, handleLoadPlayersToInvite);
    socketRef.current?.on(SocketEvents.TABLE_PLAYER_LEFT, handleLoadPlayersToInvite);

    return () => {
      socketRef.current?.off(SocketEvents.TABLE_PLAYER_JOINED, handleLoadPlayersToInvite);
      socketRef.current?.off(SocketEvents.TABLE_PLAYER_LEFT, handleLoadPlayersToInvite);
    };
  }, [isConnected]);

  const handleUserToInvite = async (): Promise<void> => {
    socketRef.current?.emit(
      SocketEvents.TABLE_PLAYER_INVITE,
      { tableId, inviteePlayerId: selectedPlayerId },
      (response: SocketCallback): void => {
        if (response.success) {
          // TODO: Show message (response.message) in toast
          onCancel?.();
        }
      },
    );
  };

  return (
    <Modal
      title={t({ message: "Invite User" })}
      confirmText={t({ message: "Invite" })}
      isConfirmButtonDisabled={playersToInvite?.length == 0 || !selectedPlayerId}
      dataTestId="table-invite-user"
      onConfirm={handleUserToInvite}
      onCancel={onCancel}
    >
      <div className="overflow-y-auto h-72">
        <PlayersList
          roomId={roomId}
          players={playersToInvite}
          isRatingsVisible={isRatingsVisible}
          isTableNumberVisible
          onSelectedPlayer={setSelectedPlayerId}
        />
      </div>
    </Modal>
  );
}

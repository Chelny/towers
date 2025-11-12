"use client";

import { ReactNode, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useLingui } from "@lingui/react/macro";
import { TablePlayerPlainObject } from "@/server/towers/models/TablePlayer";
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton";
import Modal from "@/components/ui/Modal";
import { SocketEvents } from "@/constants/socket-events";
import { useSocket } from "@/context/SocketContext";
import { SocketCallback } from "@/interfaces/socket";

const PlayersList = dynamic(() => import("@/components/game/PlayersList"), {
  loading: () => <PlayersListSkeleton />,
});

type TableBootUserModalProps = {
  roomId: string
  tableId: string
  isRatingsVisible?: boolean
  onCancel: () => void
}

export default function TableBootUserModal({
  roomId,
  tableId,
  isRatingsVisible,
  onCancel,
}: TableBootUserModalProps): ReactNode {
  const { t } = useLingui();
  const { socketRef, isConnected } = useSocket();
  const [playersToBoot, setPlayersToBoot] = useState<TablePlayerPlainObject[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // const {
  //   data: playersToBootResponse,
  //   error: playersToBootError,
  //   mutate: loadPlayersToBoot,
  //   isLoading: isLoadingPlayersToBoot,
  // } = useSWR<ApiResponse<PlayerWithRelations[]>>(
  //   `/api/games/towers/tables/${tableId}/boot`,
  //   fetcher,
  //   {
  //     shouldRetryOnError: false,
  //     revalidateOnFocus: false,
  //     revalidateOnReconnect: false,
  //   },
  // );

  // const {
  //   error: tableBootError,
  //   trigger: tableBoot,
  //   isMutating: isTableBootMutating,
  // } = useSWRMutation(
  //   `/api/games/towers/tables/${tableId}/boot`,
  //   (url: string, { arg }: { arg: { playerToBootId: string | null } }) => fetcher<void>(url, { method: "POST", body: JSON.stringify(arg) }),
  //   {
  //     onSuccess(response: ApiResponse<void>) {
  //       if (response.success) {
  //         onCancel?.();
  //       }
  //     },
  //   },
  // );

  // useEffect(() => {
  //   if (playersToBootResponse?.data) {
  //     setPlayersToBoot(playersToBootResponse.data);
  //   }
  // }, [playersToBootResponse]);

  useEffect(() => {
    if (!socketRef.current) return;

    const handleLoadPlayersToBoot = async (): Promise<void> => {
      socketRef.current?.emit(
        SocketEvents.TABLE_PLAYERS_TO_BOOT,
        { tableId },
        (response: SocketCallback<{ playersToBoot: TablePlayerPlainObject[] }>): void => {
          if (response.success && response.data) {
            setPlayersToBoot(response.data.playersToBoot);
          }
        },
      );
    };

    handleLoadPlayersToBoot();

    socketRef.current?.on(SocketEvents.TABLE_PLAYER_JOINED, handleLoadPlayersToBoot);
    socketRef.current?.on(SocketEvents.TABLE_PLAYER_LEFT, handleLoadPlayersToBoot);

    return () => {
      socketRef.current?.off(SocketEvents.TABLE_PLAYER_JOINED, handleLoadPlayersToBoot);
      socketRef.current?.off(SocketEvents.TABLE_PLAYER_LEFT, handleLoadPlayersToBoot);
    };
  }, [isConnected]);

  const handleUserToBoot = async (): Promise<void> => {
    socketRef.current?.emit(
      SocketEvents.TABLE_PLAYER_BOOT,
      { tableId, playerToBootId: selectedPlayerId },
      (response: SocketCallback): void => {
        if (response.success) {
          onCancel?.();
        }
      },
    );
  };

  return (
    <Modal
      title={t({ message: "Boot User" })}
      confirmText={t({ message: "Boot" })}
      isConfirmButtonDisabled={playersToBoot?.length === 0 || !selectedPlayerId}
      dataTestId="table-boot-user"
      onConfirm={handleUserToBoot}
      onCancel={onCancel}
    >
      <div className="overflow-y-auto h-52">
        <PlayersList
          roomId={roomId}
          players={playersToBoot}
          isRatingsVisible={isRatingsVisible}
          onSelectedPlayer={setSelectedPlayerId}
        />
      </div>
    </Modal>
  );
}

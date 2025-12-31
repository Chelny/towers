"use client";

import { ReactNode, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useLingui } from "@lingui/react/macro";
import { Socket } from "socket.io-client";
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton";
import Modal from "@/components/ui/Modal";
import { ClientToServerEvents } from "@/constants/socket/client-to-server";
import { ServerToClientEvents } from "@/constants/socket/server-to-client";
import { useSocket } from "@/context/SocketContext";
import { SocketCallback } from "@/interfaces/socket";
import { RoomPlayerPlainObject } from "@/server/towers/classes/RoomPlayer";

const PlayersList = dynamic(() => import("@/components/game/PlayersList"), {
  loading: () => <PlayersListSkeleton isTableNumberVisible />,
});

type TableInviteUserModalProps = {
  roomId: string
  tableId: string
  isRatingsVisible?: boolean
  onCancel: () => void
};

export default function TableInviteUserModal({
  roomId,
  tableId,
  isRatingsVisible,
  onCancel,
}: TableInviteUserModalProps): ReactNode {
  const { socketRef, isConnected, session } = useSocket();
  const { t } = useLingui();
  const [playersToInvite, setPlayersToInvite] = useState<RoomPlayerPlainObject[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !socketRef.current) return;

    const socket: Socket | null = socketRef.current;

    const handleUpdatePlayersList = (): void => {
      socket.emit(
        ClientToServerEvents.TABLE_PLAYERS_TO_INVITE,
        { tableId },
        (response: SocketCallback<RoomPlayerPlainObject[]>) => {
          if (response.success && response.data) {
            setPlayersToInvite(response.data);
          }
        },
      );
    };

    const emitInitialData = (): void => {
      handleUpdatePlayersList();
    };

    const attachListeners = (): void => {
      socket.on(ServerToClientEvents.TABLE_PLAYER_JOINED, handleUpdatePlayersList);
      socket.on(ServerToClientEvents.TABLE_PLAYER_LEFT, handleUpdatePlayersList);
    };

    if (socket.connected) {
      attachListeners();
      emitInitialData();
    } else {
      socket.once("connect", () => {
        attachListeners();
        emitInitialData();
      });
    }

    socket.on("reconnect", () => emitInitialData());

    return () => {
      socket.off(ServerToClientEvents.TABLE_PLAYER_JOINED, handleUpdatePlayersList);
      socket.off(ServerToClientEvents.TABLE_PLAYER_LEFT, handleUpdatePlayersList);
      socket.off("connect");
      socket.off("reconnect", emitInitialData);
    };
  }, [isConnected, socketRef, tableId]);

  const handleUserToInvite = (): void => {
    socketRef.current?.emit(
      ClientToServerEvents.TABLE_INVITE_USER,
      { tableId, inviterId: session?.user.id, inviteeId: selectedPlayerId },
      (response: SocketCallback<void>) => {
        if (response.success) {
          onCancel?.();
        }
      },
    );
  };

  return (
    <Modal
      title={t({ message: "Invite User" })}
      confirmText={t({ message: "Invite" })}
      isConfirmButtonDisabled={playersToInvite?.length == 0}
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

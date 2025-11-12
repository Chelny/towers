"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trans } from "@lingui/react/macro";
import clsx from "clsx/lite";
import {
  TableType,
  TowersRoomPlayerWithRelations,
  TowersTableInvitation,
  TowersTablePlayerWithRelations,
  TowersTableSeat,
  TowersTableSeatWithRelations,
} from "db";
import { TowersTableWithRelations } from "db";
import useSWRMutation from "swr/mutation";
import Button from "@/components/ui/Button";
import { ROUTE_TOWERS } from "@/constants/routes";
import { useSocket } from "@/context/SocketContext";
import { fetcher } from "@/lib/fetcher";

type RoomTableProps = {
  roomId: string
  table: TowersTableWithRelations
  roomPlayer?: TowersRoomPlayerWithRelations
}

export default function RoomTable({ roomId, table, roomPlayer }: RoomTableProps): ReactNode {
  const router = useRouter();
  const { isConnected } = useSocket();
  const seatMapping: number[][] = [
    [1, 3, 5, 7],
    [2, 4, 6, 8],
  ];
  const hostUsername: string | null | undefined = table.hostPlayer?.user?.username;
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const isPrivate: boolean = table.tableType === TableType.PRIVATE;
  const isProtected: boolean = table.tableType === TableType.PROTECTED;
  const isWatchAccessGranted: boolean = !isPrivate || hasAccess;
  const isSitAccessGranted: boolean = (!isPrivate && !isProtected) || hasAccess;

  const {
    error: joinError,
    trigger: joinTable,
    isMutating: isJoinTableMutating,
  } = useSWRMutation(
    `/api/games/towers/tables/${table.id}/players`,
    (url: string, { arg }: { arg: { seatNumber: number } }) =>
      fetcher<TowersTableWithRelations>(url, {
        method: "POST",
        body: JSON.stringify(arg),
      }),
    {
      onSuccess(response: ApiResponse<TowersTableWithRelations>) {
        if (response.success) {
          router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}&table=${table.id}`);
        }
      },
      onError: (error) => {
        if (error.status === 403) {
          // TODO: Show Toast: Table cannot be accessed.
          router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}`);
        }
      },
    },
  );

  const playerMapById = useMemo(
    () =>
      Object.fromEntries(
        table.players.map((tablePlayer: TowersTablePlayerWithRelations) => [tablePlayer.playerId, tablePlayer]),
      ),
    [table.players],
  );

  const seatPlayerMap = useMemo(
    () =>
      Object.fromEntries(
        table.seats.map((seat: TowersTableSeatWithRelations) => [
          seat.seatNumber,
          seat.occupiedByPlayerId ? playerMapById[seat.occupiedByPlayerId] : undefined,
        ]),
      ),
    [table.seats, table.players],
  );

  useEffect(() => {
    const isInvited: boolean = !!roomPlayer?.player.receivedTableInvitations.some(
      (invitation: TowersTableInvitation) => invitation.inviteePlayerId === roomPlayer?.playerId,
    );
    setHasAccess(isInvited);
  }, [table.id, roomPlayer?.player.receivedTableInvitations]);

  const handleJoinTable = async (seatNumber?: number): Promise<void> => {
    if (seatNumber) {
      await joinTable({ seatNumber });
    } else {
      router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}&table=${table.id}`);
    }
  };

  return (
    <div className="flex flex-col">
      <div className={clsx("flex items-center border-b border-b-gray-300", "dark:border-b-dark-game-border")}>
        <div
          className={clsx(
            "basis-16 row-span-2 flex justify-center items-center h-full px-2 border-gray-300",
            "dark:border-dark-game-border",
          )}
        >
          #{table.tableNumber}
        </div>
        <div
          className={clsx(
            "flex-1 flex flex-col gap-1 h-full px-2 border-s border-gray-300 divide-y divide-gray-200",
            "dark:border-dark-game-border dark:divide-dark-game-border",
          )}
        >
          <div className="flex flex-1 gap-1 pt-3 pb-2">
            <div className="basis-28">
              <Button
                className="w-full h-full"
                disabled={!isConnected || isJoinTableMutating || !isWatchAccessGranted}
                onClick={() => handleJoinTable()}
              >
                <Trans>Watch</Trans>
              </Button>
            </div>
            <div className="flex flex-col gap-1">
              {seatMapping.map((row: number[], rowIndex: number) => (
                <div key={rowIndex} className="flex flex-row gap-1">
                  {row.map((seatNumber: number, colIndex: number) => {
                    const seatedPlayer: TowersTablePlayerWithRelations | undefined = seatPlayerMap[seatNumber];

                    return seatedPlayer ? (
                      <div
                        key={colIndex}
                        className={clsx(
                          "flex items-center justify-center w-28 p-1 border border-gray-300 rounded-sm",
                          "dark:border-dark-game-border",
                        )}
                      >
                        <span className="truncate">{seatedPlayer.player.user.username}</span>
                      </div>
                    ) : (
                      <Button
                        key={colIndex}
                        className="w-28"
                        disabled={!isConnected || isJoinTableMutating || !isSitAccessGranted}
                        onClick={() => handleJoinTable(seatNumber)}
                      >
                        <Trans>Join</Trans>
                      </Button>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex-1 px-2 line-clamp-3">
              {/* List non-seated players by username, separated by commas */}
              {table?.players
                .filter(
                  (tablePlayer: TowersTablePlayerWithRelations) =>
                    !table.seats.some((seat: TowersTableSeat) => seat.occupiedByPlayerId === tablePlayer.playerId),
                )
                .map((tablePlayer: TowersTablePlayerWithRelations) => tablePlayer.player.user.username)
                .join(", ")}
            </div>
          </div>
          <div className="flex py-1 text-sm">
            {table.isRated && (
              <span>
                <Trans>Option: rated</Trans>&nbsp;-&nbsp;
              </span>
            )}
            <span>
              <Trans>Host: {hostUsername}</Trans>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

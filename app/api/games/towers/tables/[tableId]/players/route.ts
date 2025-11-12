import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { t } from "@lingui/core/macro";
import { logger } from "better-auth";
import {
  PlayerListWithRelations,
  Prisma,
  TableChatMessageType,
  TowersPlayerWithRelations,
  TowersRoomPlayer,
  TowersRoomWithRelations,
  TowersTableChatMessageWithRelations,
  TowersTablePlayer,
  TowersTablePlayerWithRelations,
  TowersTablePlayerWithRuntime,
  TowersTableSeatWithRelations,
  TowersTableWithRelations,
  TowersTableWithRuntime,
} from "db";
import { RedisEvents } from "@/constants/socket-events";
import { getCachedPlayerByUserId } from "@/data/player";
import { handleApiError, HttpError } from "@/lib/apiError";
import { handleUnauthorizedApiError } from "@/lib/apiError";
import { auth, Session } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/locale";
import prisma from "@/lib/prisma";
import "@/lib/redis";
import {
  getTowersRoomIncludes,
  getTowersRoomPlayerIncludes,
  getTowersTableChatMessageIncludes,
  getTowersTableIncludes,
  getTowersTablePlayerIncludes,
  getTowersTableSeatIncludes,
} from "@/prisma/selects";
import { publishRedisEvent } from "@/server/redis/publish";
import { Player } from "@/server/towers/models/Player";
import { serverState } from "@/server/towers/models/ServerState";
import { PlayerState, Table } from "@/server/towers/models/Table";
import { dynamicActivate } from "@/translations/languages";
import { canUserAccessRoom, canUserAccessTable } from "@/utils/userAccess";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ tableId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { tableId } = await params;

  try {
    const tablePlayers: TowersTablePlayerWithRelations[] = await prisma.towersTablePlayer.findMany({
      where: { tableId },
      include: getTowersTablePlayerIncludes(),
    });

    return NextResponse.json({ success: true, data: tablePlayers }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { tableId } = await params;

  let seatNumber: number | undefined = undefined;

  try {
    const body = await request.json();
    seatNumber = body.seatNumber;
  } catch {
    // No body sent → seatNumber stays undefined
  }

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    const player: TowersPlayerWithRelations = await getCachedPlayerByUserId(session.user.id);

    const {
      table,
      room,
      isRoomPlayerCreated,
      roomPlayer,
      isTablePlayerCreated,
      tablePlayer,
      isCurrentPlayerTableHost,
      tableSeat,
    } = await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      let table: TowersTableWithRelations = await transaction.towersTable.findUniqueOrThrow({
        where: { id: tableId },
        include: getTowersTableIncludes(),
      });

      let room: TowersRoomWithRelations = await transaction.towersRoom.findUniqueOrThrow({
        where: { id: table.roomId },
        include: getTowersRoomIncludes(),
      });

      const isRoomAccessGranted: boolean = canUserAccessRoom(room, player);

      if (!isRoomAccessGranted) {
        throw new HttpError(403, t({ message: "Room access denied." }));
      }

      // Join room if not already in it
      let isRoomPlayerCreated: boolean = false;
      let roomPlayer: TowersRoomPlayer | null = await transaction.towersRoomPlayer.findUnique({
        where: {
          roomId_playerId: {
            roomId: table.roomId,
            playerId: session.user.id,
          },
        },
      });

      if (!roomPlayer) {
        roomPlayer = await transaction.towersRoomPlayer.create({
          data: { roomId: table.roomId, playerId: session.user.id },
          include: getTowersRoomPlayerIncludes(),
        });

        isRoomPlayerCreated = true;

        // Updated room including new player
        room = await transaction.towersRoom.findUniqueOrThrow({
          where: { id: table.roomId },
          include: getTowersRoomIncludes(),
        });
      }

      const isTableAccessGranted: boolean = canUserAccessTable(table, player);

      if (!isTableAccessGranted) {
        throw new HttpError(403, t({ message: "Table access denied." }));
      }

      let isTablePlayerCreated: boolean = false;
      let isCurrentPlayerTableHost: boolean = false;

      let tablePlayer: TowersTablePlayer | null = await transaction.towersTablePlayer.findUnique({
        where: { tableId_playerId: { tableId, playerId: session.user.id } },
      });

      if (!tablePlayer) {
        tablePlayer = await transaction.towersTablePlayer.create({
          data: { tableId, playerId: session.user.id },
          include: getTowersTablePlayerIncludes(),
        });

        isTablePlayerCreated = true;

        // User joined the table → create "joined" chat message
        await transaction.towersTableChatMessage.create({
          data: {
            tableId: table.id,
            playerId: session.user.id,
            type: TableChatMessageType.USER_JOINED_TABLE,
            textVariables: { username: player.user?.username },
          },
        });

        // If user is the table host → create host message
        if (table.hostPlayerId === session.user.id) {
          isCurrentPlayerTableHost = true;

          await transaction.towersTableChatMessage.create({
            data: {
              tableId: table.id,
              playerId: session.user.id,
              type: TableChatMessageType.TABLE_HOST,
              visibleToUserId: session.user.id,
            },
          });
        }

        // Update table with players
        table = await transaction.towersTable.findUniqueOrThrow({
          where: { id: tableId },
          include: getTowersTableIncludes(),
        });
      }

      // User chooses seat when joining table
      let tableSeat: TowersTableSeatWithRelations | null = null;

      if (isTablePlayerCreated) {
        if (seatNumber) {
          // Sit user
          tableSeat = await transaction.towersTableSeat.update({
            where: { tableId_seatNumber: { tableId, seatNumber } },
            data: { occupiedByPlayerId: session.user.id },
            include: getTowersTableSeatIncludes(),
          });
        } else {
          // Already seated from "Play Now"
          tableSeat = await transaction.towersTableSeat.findFirst({
            where: {
              tableId,
              occupiedByPlayerId: session.user.id,
            },
            include: getTowersTableSeatIncludes(),
          });
        }

        // Update table with seated user
        table = await transaction.towersTable.findUniqueOrThrow({
          where: { id: tableId },
          include: getTowersTableIncludes(),
        });
      }

      return {
        table,
        room,
        isRoomPlayerCreated,
        roomPlayer,
        isTablePlayerCreated,
        tablePlayer,
        isCurrentPlayerTableHost,
        tableSeat,
      };
    });

    if (isRoomPlayerCreated && roomPlayer) {
      await publishRedisEvent(RedisEvents.ROOM_JOIN, { roomId: table.roomId, roomPlayer });
      logger.debug(`${player.user?.username} has joined the room ${room.name}.`);
    }

    if (isTablePlayerCreated && tablePlayer) {
      await publishRedisEvent(RedisEvents.TABLE_JOIN, { table, tablePlayer });
      logger.debug(`${player.user?.username} has joined table #${table.tableNumber}.`);
    }

    if (isCurrentPlayerTableHost) {
      logger.debug(`${player.user.username} is the table host.`);
    }

    if (isTablePlayerCreated && tableSeat) {
      await publishRedisEvent(RedisEvents.TABLE_SEAT_SIT, { tableSeat });
    }

    const xTable: Table = serverState.getOrCreateTable(table.id);
    const xPlayer: Player = serverState.getOrCreatePlayer(session.user.id, player.user?.username);

    if (tableSeat?.seatNumber) {
      xTable.occupySeat(tableSeat?.seatNumber, xPlayer);
    }

    const mergedTable: TowersTableWithRuntime = {
      ...table,
      players: table.players.reduce<TowersTablePlayerWithRuntime[]>(
        (acc: TowersTablePlayerWithRuntime[], tablePlayer: TowersTablePlayerWithRelations) => {
          const playerState: PlayerState | undefined = xTable.playersState.get(tablePlayer.playerId);
          if (!playerState) return acc;

          acc.push({
            ...tablePlayer,
            isReady: xTable.isPlayerReady(playerState.player),
            isPlaying: xTable.isPlayerPlaying(playerState.player),
          });

          return acc;
        },
        [],
      ),
    };

    return NextResponse.json({ success: true, data: mergedTable }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { tableId } = await params;

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    const player: TowersPlayerWithRelations = await getCachedPlayerByUserId(session.user.id);

    const { table, tablePlayer, userLeftChatMessage, isCurrentTableHostLeft, newTableHostChatMessage, isTableDeleted } =
      await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
        let table: TowersTableWithRelations = await transaction.towersTable.findUniqueOrThrow({
          where: { id: tableId },
          include: getTowersTableIncludes(),
        });

        // Free occupied seats
        await transaction.towersTableSeat.updateMany({
          where: { tableId, occupiedByPlayerId: player?.id },
          data: { occupiedByPlayerId: null },
        });

        // Remove player from table
        const tablePlayer: TowersTablePlayerWithRelations = await transaction.towersTablePlayer.delete({
          where: { tableId_playerId: { tableId, playerId: session.user.id } },
          include: getTowersTablePlayerIncludes(),
        });

        const userLeftChatMessage: TowersTableChatMessageWithRelations =
          await transaction.towersTableChatMessage.create({
            data: {
              tableId,
              playerId: session.user.id,
              type: TableChatMessageType.USER_LEFT_TABLE,
              textVariables: { username: player.user?.username },
            },
            include: getTowersTableChatMessageIncludes(),
          });

        // Remove user invitation to the table if applicable
        await transaction.towersTableInvitation.deleteMany({
          where: {
            tableId,
            inviteePlayerId: session.user.id,
          },
        });

        // Set new table host if needed
        const remainingPlayers: TowersTablePlayerWithRelations[] = table.players.filter(
          (tablePlayer: TowersTablePlayerWithRelations) => tablePlayer.playerId !== session.user.id,
        );

        let isCurrentTableHostLeft: boolean = false;
        let newTableHostChatMessage: TowersTableChatMessageWithRelations | null = null;

        if (remainingPlayers.length > 0 && table.hostPlayerId === session.user.id) {
          const newHostPlayer: PlayerListWithRelations = remainingPlayers[0].player;

          table = await transaction.towersTable.update({
            where: { id: tableId },
            data: { hostPlayerId: newHostPlayer.id },
            include: getTowersTableIncludes(),
          });

          isCurrentTableHostLeft = true;

          // Announce privately to the new host
          newTableHostChatMessage = await transaction.towersTableChatMessage.create({
            data: {
              tableId,
              playerId: newHostPlayer.id,
              type: TableChatMessageType.TABLE_HOST,
              visibleToUserId: newHostPlayer.id,
            },
            include: getTowersTableChatMessageIncludes(),
          });
        }

        // Delete table if last player
        const remainingCount: number = await transaction.towersTablePlayer.count({ where: { tableId } });
        const isTableDeleted: boolean = remainingCount === 0;

        if (isTableDeleted) {
          await transaction.towersTable.delete({ where: { id: tableId } });

          // Delete in-memory table
          serverState.deleteTable(tableId);
        }

        return {
          table,
          tablePlayer,
          userLeftChatMessage,
          isCurrentTableHostLeft,
          newTableHostChatMessage,
          isTableDeleted,
        };
      });

    if (table && tablePlayer) {
      await publishRedisEvent(RedisEvents.TABLE_LEAVE, { table, tablePlayer });
    }

    if (userLeftChatMessage) {
      await publishRedisEvent(RedisEvents.TABLE_MESSAGE_SEND, { tableId, chatMessage: userLeftChatMessage });
      logger.debug(`${player.user?.username} has left table #${table.tableNumber}.`);
    }

    if (isCurrentTableHostLeft && table) {
      await publishRedisEvent(RedisEvents.TABLE_HOST_LEAVE, { table });
    }

    if (newTableHostChatMessage) {
      await publishRedisEvent(RedisEvents.TABLE_MESSAGE_SEND, { tableId, chatMessage: newTableHostChatMessage });
      logger.debug(`${newTableHostChatMessage.player.user.username} is the new table host.`);
    }

    if (isTableDeleted && table) {
      await publishRedisEvent(RedisEvents.TABLE_DELETE, { table });
      logger.debug(`Table #${table.tableNumber} has been deleted.`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

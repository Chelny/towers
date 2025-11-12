import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { t } from "@lingui/core/macro";
import {
  Prisma,
  TowersPlayerWithRelations,
  TowersRoomPlayer,
  TowersRoomPlayerWithRelations,
  TowersRoomWithRelations,
} from "db";
import { RedisEvents } from "@/constants/socket-events";
import { getCachedPlayerByUserId } from "@/data/player";
import { handleApiError, handleUnauthorizedApiError, HttpError } from "@/lib/apiError";
import { auth, Session } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/locale";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import "@/lib/redis";
import { getTowersRoomIncludes, getTowersRoomPlayerIncludes } from "@/prisma/selects";
import { publishRedisEvent } from "@/server/redis/publish";
import { dynamicActivate } from "@/translations/languages";
import { canUserAccessRoom } from "@/utils/userAccess";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { roomId } = await params;

  try {
    const roomPlayers: TowersRoomPlayerWithRelations[] = await prisma.towersRoomPlayer.findMany({
      where: { roomId },
      include: getTowersRoomPlayerIncludes(),
    });

    return NextResponse.json({ success: true, data: roomPlayers }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { roomId } = await params;

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    const player: TowersPlayerWithRelations = await getCachedPlayerByUserId(session.user.id);

    const { room, isRoomPlayerCreated, roomPlayer } = await prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        let room: TowersRoomWithRelations = await transaction.towersRoom.findUniqueOrThrow({
          where: { id: roomId },
          include: getTowersRoomIncludes(),
        });

        const isRoomAccessGranted: boolean = canUserAccessRoom(room, player);

        if (!isRoomAccessGranted) {
          throw new HttpError(403, t({ message: "Room access denied." }));
        }

        let isRoomPlayerCreated: boolean = false;
        let roomPlayer: TowersRoomPlayer | null = await transaction.towersRoomPlayer.findUnique({
          where: {
            roomId_playerId: {
              roomId,
              playerId: session.user.id,
            },
          },
        });

        if (!roomPlayer) {
          roomPlayer = await transaction.towersRoomPlayer.create({
            data: { roomId, playerId: session.user.id },
            include: getTowersRoomPlayerIncludes(),
          });

          isRoomPlayerCreated = true;

          // Updated room including new player
          room = await transaction.towersRoom.findUniqueOrThrow({
            where: { id: roomId },
            include: getTowersRoomIncludes(),
          });
        }

        return { room, isRoomPlayerCreated, roomPlayer };
      },
    );

    if (isRoomPlayerCreated && roomPlayer) {
      await publishRedisEvent(RedisEvents.ROOM_JOIN, { roomId, roomPlayer });
      logger.debug(`${player.user?.username} has joined the room ${room.name}.`);
    }

    return NextResponse.json({ success: true, data: room }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { roomId } = await params;

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    const player: TowersPlayerWithRelations = await getCachedPlayerByUserId(session.user.id);

    const { roomPlayer } = await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      // Remove player from all tables in room that they are in
      const tablesInRoom: { id: string }[] = await transaction.towersTable.findMany({
        where: { roomId },
        select: { id: true },
      });

      const tableIds: string[] = tablesInRoom.map((table: { id: string }) => table.id);

      if (tableIds.length > 0) {
        // Free occupied seats
        await transaction.towersTableSeat.updateMany({
          where: {
            tableId: { in: tableIds },
            occupiedByPlayerId: player?.id,
          },
          data: { occupiedByPlayerId: null },
        });

        // Delete table-player from table
        await transaction.towersTablePlayer.deleteMany({
          where: {
            tableId: { in: tableIds },
            playerId: player?.id,
          },
        });

        // Remove user invitations to all tables if applicable
        await transaction.towersTableInvitation.deleteMany({
          where: {
            tableId: { in: tableIds },
            inviteePlayerId: session.user.id,
          },
        });
      }

      // Remove player from room
      const roomPlayer: TowersRoomPlayerWithRelations = await transaction.towersRoomPlayer.delete({
        where: {
          roomId_playerId: {
            roomId,
            playerId: session.user.id,
          },
        },
        include: getTowersRoomPlayerIncludes(),
      });

      return { roomPlayer };
    });

    if (roomPlayer) {
      await publishRedisEvent(RedisEvents.ROOM_LEAVE, { roomId, roomPlayer });
      logger.debug(`${player.user?.username} has left the room ${roomPlayer.room.name}.`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

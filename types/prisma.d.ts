import { Prisma } from "db";
import {
  getConversationIncludes,
  getConversationParticipantIncludes,
  getInstantMessageIncludes,
  getTowersPlayerLiteIncludes,
  getTowersRoomChatMessageIncludes,
  getTowersRoomIncludes,
  getTowersRoomPlayerIncludes,
  getTowersTableChatMessageIncludes,
  getTowersTableIncludes,
  getTowersTablePlayerIncludes,
  getTowersTableSeatIncludes,
  getUserMinimalSelect,
  getUserMuteIncludes,
  towersRoomsListIncludes,
} from "@/prisma/prisma-includes";

declare module "db" {
  // ======================================
  // USER
  // ======================================

  export type UserLite = Prisma.UserGetPayload<{
    select: ReturnType<typeof getUserMinimalSelect>
  }>;

  // ======================================
  // USER MUTE
  // ======================================

  type UserMuteWithRelations = Prisma.UserMuteGetPayload<{
    include: ReturnType<typeof getUserMuteIncludes>
  }>;

  // ======================================
  // CONVERSATION + IM
  // ======================================

  type ConversationWithRelations = Prisma.ConversationGetPayload<{
    include: ReturnType<typeof getConversationIncludes>
  }>;

  type ConversationParticipantWithRelations = Prisma.ConversationParticipantGetPayload<{
    include: ReturnType<typeof getConversationParticipantIncludes>
  }>;

  type InstantMessageWithRelations = Prisma.InstantMessageGetPayload<{
    include: ReturnType<typeof getInstantMessageIncludes>
  }>;

  // ======================================
  // PLAYER
  // ======================================

  type TowersPlayerLite = Prisma.TowersPlayerGetPayload<{
    include: ReturnType<typeof getTowersPlayerLiteIncludes>
  }>;

  // ======================================
  // ROOM
  // ======================================

  type TowersRoomsListWithCount = Prisma.TowersRoomGetPayload<{
    include: typeof towersRoomsListIncludes
  }>;

  type TowersRoomWithRelations = Prisma.TowersRoomGetPayload<{
    include: ReturnType<typeof getTowersRoomIncludes>
  }>;

  // ======================================
  // ROOM PLAYER
  // ======================================

  type TowersRoomPlayerWithRelations = Prisma.TowersRoomPlayerGetPayload<{
    include: ReturnType<typeof getTowersRoomPlayerIncludes>
  }>;

  // ======================================
  // ROOM CHAT MESSAGE
  // ======================================

  type TowersRoomChatMessageWithRelations = Prisma.TowersRoomChatMessageGetPayload<{
    include: ReturnType<typeof getTowersRoomChatMessageIncludes>
  }>;

  // ======================================
  // TABLE
  // ======================================

  type TowersTableWithRelations = Prisma.TowersTableGetPayload<{
    include: ReturnType<typeof getTowersTableIncludes>
  }>;

  // type TowersTableLiteWithRelations = Prisma.TowersTableGetPayload<{
  //   include: ReturnType<typeof getTowersTableLiteIncludes>
  // }>

  // ======================================
  // TABLE SEAT
  // ======================================

  type TowersTableSeatWithRelations = Prisma.TowersTableSeatGetPayload<{
    include: ReturnType<typeof getTowersTableSeatIncludes>
  }>;

  // ======================================
  // TABLE PLAYER
  // ======================================

  type TowersTablePlayerWithRelations = Prisma.TowersTablePlayerGetPayload<{
    include: ReturnType<typeof getTowersTablePlayerIncludes>
  }>;

  // type TowersTablePlayerLiteWithRelations = Prisma.TowersTablePlayerGetPayload<{
  //   include: ReturnType<typeof getTowersTablePlayerLiteIncludes>
  // }>

  // ======================================
  // TABLE CHAT MESSAGE
  // ======================================

  type TowersTableChatMessageWithRelations = Prisma.TowersTableChatMessageGetPayload<{
    include: ReturnType<typeof getTowersTableChatMessageIncludes>
  }>;

  // ======================================
  // TABLE INVITATION
  // ======================================

  // type TowersTableInvitationWithRelations = Prisma.TowersTableInvitationGetPayload<{
  //   include: ReturnType<typeof getTowersTableInvitationIncludes>
  // }>

  // ======================================
  // TABLE BOOT
  // ======================================

  // type TowersTableBootWithRelations = Prisma.TowersTableBootGetPayload<{
  //   include: ReturnType<typeof getTowersTableBootIncludes>
  // }>

  // ======================================
  // NOTIFICATION
  // ======================================

  // type TowersNotificationWithRelations = Prisma.TowersNotificationGetPayload<{
  //   include: ReturnType<typeof getTowersNotificationIncludes>
  // }>
}

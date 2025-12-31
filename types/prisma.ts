import { Prisma } from "db/client";

// ======================================
// USER
// ======================================

export const getUserMinimalSelect = () => ({
  id: true,
  username: true,
  userSettings: true,
  createdAt: true,
  updatedAt: true,
});

export type UserLite = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserMinimalSelect>
}>;

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    userSettings: true
  }
}>;

// ======================================
// USER RELATIONSHIP
// ======================================

export const getUserRelationshipIncludes = () => ({
  sourceUser: { select: getUserMinimalSelect() },
  targetUser: { select: getUserMinimalSelect() },
});

export type UserRelationshipWithRelations = Prisma.UserRelationshipGetPayload<{
  include: ReturnType<typeof getUserRelationshipIncludes>
}>;

export type UserRelationshipTableRow = Prisma.UserRelationshipGetPayload<{
  select: {
    id: true
    type: true
    isMuted: true
    createdAt: true
    targetUser: {
      select: {
        id: true
        username: true
        displayUsername: true
      }
    }
  }
}>;

// ======================================
// CONVERSATION + IM
// ======================================

export const getConversationIncludes = () => ({
  participants: { include: getConversationParticipantIncludes() },
  messages: { include: getInstantMessageIncludes() },
});

export type ConversationWithRelations = Prisma.ConversationGetPayload<{
  include: ReturnType<typeof getConversationIncludes>
}>;

export const getConversationParticipantIncludes = () => ({
  user: { select: getUserMinimalSelect() },
});

export type ConversationParticipantWithRelations = Prisma.ConversationParticipantGetPayload<{
  include: ReturnType<typeof getConversationParticipantIncludes>
}>;

export const getInstantMessageIncludes = () => ({
  conversation: { include: { participants: true } },
  user: { select: getUserMinimalSelect() },
});

export type InstantMessageWithRelations = Prisma.InstantMessageGetPayload<{
  include: ReturnType<typeof getInstantMessageIncludes>
}>;

// ======================================
// PLAYER
// ======================================

export const getTowersPlayerLiteIncludes = () => ({
  user: { select: getUserMinimalSelect() },
  controlKeys: true,
  stats: true,
});

export type TowersPlayerLite = Prisma.TowersPlayerGetPayload<{
  include: ReturnType<typeof getTowersPlayerLiteIncludes>
}>;

// ======================================
// ROOM PLAYER
// ======================================

export const getTowersRoomPlayerIncludes = () => ({
  room: true,
  player: { include: getTowersPlayerLiteIncludes() },
});

export type TowersRoomPlayerWithRelations = Prisma.TowersRoomPlayerGetPayload<{
  include: ReturnType<typeof getTowersRoomPlayerIncludes>
}>;

// ======================================
// ROOM
// ======================================

export const getTowersRoomIncludes = () => ({
  players: { include: getTowersRoomPlayerIncludes() },
  chatMessages: { include: getTowersRoomChatMessageIncludes() },
  tables: { include: getTowersTableIncludes() },
});

export type TowersRoomWithRelations = Prisma.TowersRoomGetPayload<{
  include: ReturnType<typeof getTowersRoomIncludes>
}>;

export const towersRoomsListIncludes: Prisma.TowersRoomInclude = {
  players: { include: getTowersRoomPlayerIncludes() },
  _count: { select: { players: true } },
};

export type TowersRoomsListWithCount = Prisma.TowersRoomGetPayload<{
  include: typeof towersRoomsListIncludes
}>;

// ======================================
// ROOM CHAT MESSAGE
// ======================================

export const getTowersRoomChatMessageIncludes = () => ({
  player: { include: getTowersPlayerLiteIncludes() },
});

export type TowersRoomChatMessageWithRelations = Prisma.TowersRoomChatMessageGetPayload<{
  include: ReturnType<typeof getTowersRoomChatMessageIncludes>
}>;

// ======================================
// TABLE
// ======================================

export const getTowersTableIncludes = () => ({
  room: { include: { players: { include: getTowersRoomPlayerIncludes() } } },
  hostPlayer: { include: getTowersPlayerLiteIncludes() },
  seats: { include: getTowersTableSeatIncludes() },
  players: { include: getTowersTablePlayerIncludes() },
  chatMessages: { include: getTowersTableChatMessageIncludes() },
  invitations: { include: getTowersTableInvitationIncludes() },
  // boots: { include: getTowersTableBootIncludes() },
  game: true,
});

export type TowersTableWithRelations = Prisma.TowersTableGetPayload<{
  include: ReturnType<typeof getTowersTableIncludes>
}>;

export const getTowersTableLiteIncludes = () => ({
  room: true,
  hostPlayer: { include: { user: true } },
  players: { include: getTowersTablePlayerLiteIncludes() },
});

// export type TowersTableLiteWithRelations = Prisma.TowersTableGetPayload<{
//   include: ReturnType<typeof getTowersTableLiteIncludes>
// }>

// ======================================
// TABLE SEAT
// ======================================

export const getTowersTableSeatIncludes = () => ({
  table: true,
  occupiedByPlayer: { include: getTowersPlayerLiteIncludes() },
});

export type TowersTableSeatWithRelations = Prisma.TowersTableSeatGetPayload<{
  include: ReturnType<typeof getTowersTableSeatIncludes>
}>;

// ======================================
// TABLE PLAYER
// ======================================

export const getTowersTablePlayerIncludes = () => ({
  table: true,
  player: { include: getTowersPlayerLiteIncludes() },
});

export type TowersTablePlayerWithRelations = Prisma.TowersTablePlayerGetPayload<{
  include: ReturnType<typeof getTowersTablePlayerIncludes>
}>;

export const getTowersTablePlayerLiteIncludes = () => ({
  player: { include: getTowersPlayerLiteIncludes() },
});

// export type TowersTablePlayerLiteWithRelations = Prisma.TowersTablePlayerGetPayload<{
//   include: ReturnType<typeof getTowersTablePlayerLiteIncludes>
// }>

// ======================================
// TABLE CHAT MESSAGE
// ======================================

export const getTowersTableChatMessageIncludes = () => ({
  player: { include: getTowersPlayerLiteIncludes() },
});

export type TowersTableChatMessageWithRelations = Prisma.TowersTableChatMessageGetPayload<{
  include: ReturnType<typeof getTowersTableChatMessageIncludes>
}>;

// ======================================
// TABLE INVITATION
// ======================================

export const getTowersTableInvitationIncludes = () => ({
  table: { include: getTowersTableLiteIncludes() },
  inviterPlayer: { include: { ...getTowersPlayerLiteIncludes(), stats: true } },
  inviteePlayer: { include: getTowersPlayerLiteIncludes() },
});

export type TowersTableInvitationWithRelations = Prisma.TowersTableInvitationGetPayload<{
  include: ReturnType<typeof getTowersTableInvitationIncludes>
}>;

// ======================================
// TABLE BOOT
// ======================================

// export const getTowersTableBootIncludes = () => ({
//   table: { include: getTowersTableLiteIncludes() },
//   booterPlayer: { include: getTowersPlayerLiteIncludes() },
//   bootedPlayer: { include: getTowersPlayerLiteIncludes() },
// });

// export type TowersTableBootWithRelations = Prisma.TowersTableBootGetPayload<{
//   include: ReturnType<typeof getTowersTableBootIncludes>
// }>

// ======================================
// NOTIFICATION
// ======================================

// export const getTowersNotificationIncludes = () => ({
//   player: { include: getTowersPlayerLiteIncludes() },
//   tableInvitation: { include: getTowersTableInvitationIncludes() },
//   bootedFromTable: { include: getTowersTableBootIncludes() },
// });

// export type TowersNotificationWithRelations = Prisma.TowersNotificationGetPayload<{
//   include: ReturnType<typeof getTowersNotificationIncludes>
// }>

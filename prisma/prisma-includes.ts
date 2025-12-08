import { Prisma } from "db";

// ======================================
// User
// ======================================

export const getUserMinimalSelect = () => ({
  id: true,
  username: true,
  image: true,
  createdAt: true,
  updatedAt: true,
});

export const getUserMuteIncludes = () => ({
  muterUser: { select: getUserMinimalSelect() },
  mutedUser: { select: getUserMinimalSelect() },
});

// ======================================
// CONVERSATION
// ======================================

export const getConversationIncludes = () => ({
  participants: { include: getConversationParticipantIncludes() },
  messages: { include: getInstantMessageIncludes() },
});

export const getConversationParticipantIncludes = () => ({
  user: { select: getUserMinimalSelect() },
});

export const getInstantMessageIncludes = () => ({
  conversation: { include: { participants: true } },
  user: { select: getUserMinimalSelect() },
});

// ======================================
// PLAYER
// ======================================

export const getTowersPlayerLiteIncludes = () => ({
  user: { select: getUserMinimalSelect() },
  controlKeys: true,
  stats: true,
});

// ======================================
// ROOM
// ======================================

export const getTowersRoomPlayerIncludes = () => ({
  room: true,
  player: { include: getTowersPlayerLiteIncludes() },
});

export const getTowersRoomIncludes = () => ({
  players: { include: getTowersRoomPlayerIncludes() },
  chatMessages: { include: getTowersRoomChatMessageIncludes() },
  tables: { include: getTowersTableIncludes() },
});

export const getTowersRoomChatMessageIncludes = () => ({
  player: { include: getTowersPlayerLiteIncludes() },
});

export const towersRoomsListIncludes = Prisma.validator<Prisma.TowersRoomInclude>()({
  players: { include: getTowersRoomPlayerIncludes() },
  _count: { select: { players: true } },
});

// ======================================
// TABLE
// ======================================

export const getTowersTablePlayerIncludes = () => ({
  table: true,
  player: { include: getTowersPlayerLiteIncludes() },
});

export const getTowersTablePlayerLiteIncludes = () => ({
  player: { include: getTowersPlayerLiteIncludes() },
});

export const getTowersTableIncludes = () => ({
  room: { include: { players: { include: getTowersRoomPlayerIncludes() } } },
  hostPlayer: { include: getTowersPlayerLiteIncludes() },
  seats: { include: getTowersTableSeatIncludes() },
  players: { include: getTowersTablePlayerIncludes() },
  chatMessages: { include: getTowersTableChatMessageIncludes() },
  invitations: { include: getTowersTableInvitationIncludes() },
  game: true,
});

export const getTowersTableLiteIncludes = () => ({
  room: true,
  hostPlayer: { include: { user: true } },
  players: { include: getTowersTablePlayerLiteIncludes() },
});

export const getTowersTableSeatIncludes = () => ({
  table: true,
  occupiedByPlayer: { include: getTowersPlayerLiteIncludes() },
});

export const getTowersTableChatMessageIncludes = () => ({
  player: { include: getTowersPlayerLiteIncludes() },
});

export const getTowersTableInvitationIncludes = () => ({
  table: { include: getTowersTableLiteIncludes() },
  inviterPlayer: { include: { ...getTowersPlayerLiteIncludes(), stats: true } },
  inviteePlayer: { include: getTowersPlayerLiteIncludes() },
});

// export const getTowersTableBootIncludes = () => ({
//   table: { include: getTowersTableLiteIncludes() },
//   booterPlayer: { include: getTowersPlayerLiteIncludes() },
//   bootedPlayer: { include: getTowersPlayerLiteIncludes() },
// });

// ======================================
// NOTIFICATION
// ======================================

// export const getTowersNotificationIncludes = () => ({
//   player: { include: getTowersPlayerLiteIncludes() },
//   tableInvitation: { include: getTowersTableInvitationIncludes() },
//   bootedFromTable: { include: getTowersTableBootIncludes() },
// });

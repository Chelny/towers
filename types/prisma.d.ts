import { Prisma } from "db";
import {
  getConversationIncludes,
  getConversationParticipantIncludes,
  getInstantMessageIncludes,
  getPlayerListIncludes,
  getTowersGameIncludes,
  getTowersNotificationIncludes,
  getTowersPlayerControlKeysIncludes,
  getTowersPlayerFullIncludes,
  getTowersPlayerLiteIncludes,
  getTowersPlayerTablesJoinedIncludes,
  getTowersRoomChatMessageIncludes,
  getTowersRoomIncludes,
  getTowersRoomPlayerIncludes,
  getTowersTableBootIncludes,
  getTowersTableChatMessageIncludes,
  getTowersTableIncludes,
  getTowersTableInvitationIncludes,
  getTowersTableLiteIncludes,
  getTowersTablePlayerIncludes,
  getTowersTablePlayerLiteIncludes,
  getTowersTableSeatIncludes,
  getUserIncludes,
  getUserMinimalSelect,
  getUserMuteIncludes,
  towersRoomsListIncludes,
} from "@/prisma/selects";

declare module "db" {
  // ======================================
  // USER
  // ======================================

  export type UserMinimal = Prisma.UserGetPayload<{
    select: ReturnType<typeof getUserMinimalSelect>
  }>

  export type UserWithRelations = Prisma.UserGetPayload<{
    include: ReturnType<typeof getUserIncludes>
  }>

  // ======================================
  // USER MUTE
  // ======================================

  type UserMuteWithRelations = Prisma.UserMuteGetPayload<{
    include: ReturnType<typeof getUserMuteIncludes>
  }>

  // ======================================
  // CONVERSATION + IM
  // ======================================

  type ConversationWithRelations = Prisma.ConversationGetPayload<{
    include: ReturnType<typeof getConversationIncludes>
  }>

  type ConversationParticipantWithRelations = Prisma.ConversationParticipantGetPayload<{
    include: ReturnType<typeof getConversationParticipantIncludes>
  }>

  type InstantMessageWithRelations = Prisma.InstantMessageGetPayload<{
    include: ReturnType<typeof getInstantMessageIncludes>
  }>

  // ======================================
  // PLAYER
  // ======================================

  type TowersPlayerWithRelations = Prisma.TowersPlayerGetPayload<{
    include: ReturnType<typeof getTowersPlayerFullIncludes>
  }>

  type TowersPlayerLite = Prisma.TowersPlayerGetPayload<{
    include: ReturnType<typeof getTowersPlayerLiteIncludes>
  }>

  type PlayerListWithRelations = Prisma.TowersPlayerGetPayload<{
    include: ReturnType<typeof getPlayerListIncludes>
  }>

  type TowersPlayerTablesJoined = Prisma.TowersTablePlayerGetPayload<{
    include: ReturnType<typeof getTowersPlayerTablesJoinedIncludes>
  }>

  type PlayerWithRelations = TowersRoomPlayerWithRelations | TowersTablePlayerWithRelations

  // ======================================
  // PLAYER CONTROL KEYS
  // ======================================

  type PlayerControlKeysWithRelations = Prisma.TowersPlayerControlKeysGetPayload<{
    include: ReturnType<typeof getTowersPlayerControlKeysIncludes>
  }>

  // ======================================
  // PLAYER STATS
  // ======================================

  // ======================================
  // ROOM
  // ======================================

  type TowersRoomsListWithCount = Prisma.TowersRoomGetPayload<{
    include: typeof towersRoomsListIncludes
  }>

  type TowersRoomWithRelations = Prisma.TowersRoomGetPayload<{
    include: ReturnType<typeof getTowersRoomIncludes>
  }>

  // ======================================
  // ROOM PLAYER
  // ======================================

  type TowersRoomPlayerWithRelations = Prisma.TowersRoomPlayerGetPayload<{
    include: ReturnType<typeof getTowersRoomPlayerIncludes>
  }>

  // ======================================
  // ROOM CHAT MESSAGE
  // ======================================

  type TowersRoomChatMessageWithRelations = Prisma.TowersRoomChatMessageGetPayload<{
    include: ReturnType<typeof getTowersRoomChatMessageIncludes>
  }>

  // ======================================
  // TABLE
  // ======================================

  type TowersTableWithRelations = Prisma.TowersTableGetPayload<{
    include: ReturnType<typeof getTowersTableIncludes>
  }>

  type TowersTableLiteWithRelations = Prisma.TowersTableGetPayload<{
    include: ReturnType<typeof getTowersTableLiteIncludes>
  }>

  type TowersTableWithRuntime = TowersTableWithRelations & {
    players: TowersTablePlayerWithRuntime[]
  }

  // ======================================
  // TABLE SEAT
  // ======================================

  type TowersTableSeatWithRelations = Prisma.TowersTableSeatGetPayload<{
    include: ReturnType<typeof getTowersTableSeatIncludes>
  }>

  // ======================================
  // TABLE PLAYER
  // ======================================

  type TowersTablePlayerWithRelations = Prisma.TowersTablePlayerGetPayload<{
    include: ReturnType<typeof getTowersTablePlayerIncludes>
  }>

  type TowersTablePlayerLiteWithRelations = Prisma.TowersTablePlayerGetPayload<{
    include: ReturnType<typeof getTowersTablePlayerLiteIncludes>
  }>

  type TowersTablePlayerWithRuntime = TowersTablePlayerWithRelations & {
    isReady: boolean
    isPlaying: boolean
  }

  // ======================================
  // TABLE CHAT MESSAGE
  // ======================================

  type TowersTableChatMessageWithRelations = Prisma.TowersTableChatMessageGetPayload<{
    include: ReturnType<typeof getTowersTableChatMessageIncludes>
  }>

  // ======================================
  // TABLE INVITATION
  // ======================================

  type TowersTableInvitationWithRelations = Prisma.TowersTableInvitationGetPayload<{
    include: ReturnType<typeof getTowersTableInvitationIncludes>
  }>

  // ======================================
  // TABLE BOOT
  // ======================================

  type TowersTableBootWithRelations = Prisma.TowersTableBootGetPayload<{
    include: ReturnType<typeof getTowersTableBootIncludes>
  }>

  // ======================================
  // GAME
  // ======================================

  type TowersGameWithRelations = Prisma.TowersGameGetPayload<{
    include: ReturnType<typeof getTowersGameIncludes>
  }>

  // ======================================
  // NOTIFICATION
  // ======================================

  type TowersNotificationWithRelations = Prisma.TowersNotificationGetPayload<{
    include: ReturnType<typeof getTowersNotificationIncludes>
  }>
}

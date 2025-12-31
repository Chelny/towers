export const ServerToClientEvents = {
  // User
  USER_SETTINGS_AVATAR: "stc:user-settings:avatar",
  USER_RELATIONSHIP_MUTE: "stc:user-relationship:mute",
  USER_RELATIONSHIP_UNMUTE: "stc:user-relationship:unmute",
  USER_ONLINE: "stc:user:online",
  USER_OFFLINE: "stc:user:offline",
  PING_ECHO: "stc:user:ping:echo",

  // Conversation
  CONVERSATIONS_UNREAD: "stc:conversation:all:unread",
  CONVERSATION_MUTE: "stc:conversation:mute",
  CONVERSATION_MARK_AS_READ: "stc:conversation:read",
  CONVERSATION_UNMUTE: "stc:conversation:unmute",
  CONVERSATION_REMOVE: "stc:conversation:remove",
  CONVERSATION_RESTORE: "stc:conversation:restore",
  CONVERSATION_MESSAGE_SENT: "stc:conversation:message:sent",

  // Rooms
  ROOMS_LIST_UPDATED: "stc:rooms:list:updated",

  // Room
  ROOM_JOIN: "stc:room:join",
  ROOM_LEAVE: "stc:room:leave",
  ROOM_PLAYER_JOINED: "stc:room:player:joined",
  ROOM_PLAYER_LEFT: "stc:room:player:left",
  ROOM_MESSAGE_SENT: "stc:room:message:sent",

  // Table
  TABLE_PLAYER_JOINED: "stc:table:player:joined",
  TABLE_PLAYER_LEFT: "stc:table:player:left",
  TABLE_PLAYER_UPDATED: "stc:table:player:updated",
  TABLE_MESSAGE_SENT: "stc:table:message:sent",
  TABLE_SEAT_UPDATED: "stc:seat:updated",
  TABLE_UPDATED: "stc:table:updated",
  TABLE_INVITATION_INVITED_NOTIFICATION: "stc:table:invitation:invited",
  TABLE_INVITATION_DECLINED_NOTIFICATION: "stc:table:invitation:declined",
  TABLE_BOOTED_NOTIFICATION: "stc:table:booted",
  TABLE_DELETED: "stc:table:deleted",

  // Game
  GAME_CONTROL_KEYS_UPDATED: "stc:game:control-keys:updated",
  GAME_SEATS: "stc:game:seats",
  GAME_STATE: "stc:game:state",
  GAME_COUNTDOWN: "stc:game:countdown",
  GAME_TIMER: "stc:game:timer",
  GAME_UPDATE: "stc:game:update",
  GAME_OVER: "stc:game:over",
  GAME_POWER_FIRE: "stc:game:power-fire",
  GAME_HOO_SEND_BLOCKS: "stc:game:hoo-send-blocks",
  GAME_BLOCKS_MARKED_FOR_REMOVAL: "stc:game:blocks-marked-for-removal",
  PIECE_SPEED: "stc:piece:speed",

  // Notification
  NOTIFICATION_MARK_AS_READ: "stc:notification:read",
  NOTIFICATION_DELETE: "stc:notification:delete",

  // Socket
  SIGN_OUT_SUCCESS: "stc:sign-out:success",
  SERVER_ERROR: "stc:server:error",
} as const;

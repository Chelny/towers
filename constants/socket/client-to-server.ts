export const ClientToServerEvents = {
  // User
  USER_MUTES: "cts:user-mute:all",
  USER_MUTE_CHECK: "cts:user-mute:check",
  USER_MUTE: "cts:user-mute:mute",
  USER_UNMUTE: "cts:user-mute:unmute",
  USER_CONNECTED: "cts:user:connected",
  USER_DISCONNECTED: "cts:user:disconnected",
  PING_REQUEST: "cts:user:ping:request",

  // Conversation
  CONVERSATIONS: "cts:conversation:all",
  CONVERSATIONS_UNREAD: "cts:conversation:all:unread",
  CONVERSATION: "cts:conversation",
  CONVERSATION_MARK_AS_READ: "cts:conversation:read",
  CONVERSATION_MUTE: "cts:conversation:mute",
  CONVERSATION_UNMUTE: "cts:conversation:unmute",
  CONVERSATION_REMOVE: "cts:conversation:remove",
  CONVERSATION_MESSAGE_SEND: "cts:conversation:message:send",

  // Room
  ROOM_JOIN: "cts:room:join",
  ROOM_LEAVE: "cts:room:leave",
  ROOM_MESSAGE_SEND: "cts:room:message:send",

  // Table
  TABLE_JOIN: "cts:table:join",
  TABLE_LEAVE: "cts:table:leave",
  TABLE_PLAY_NOW: "cts:table:play-now",
  TABLE_CREATE: "cts:table:create",
  TABLE_UPDATE_SETTINGS: "cts:table:settings:update",
  TABLE_MESSAGE_SEND: "cts:table:message:send",
  TABLE_PLAYERS_TO_INVITE: "cts:table:players:invite",
  TABLE_INVITE_USER: "cts:table:invite-user",
  TABLE_INVITATION_ACCEPTED_CHECK: "cts:table:invitation:accepted:check",
  TABLE_INVITATION_ACCEPTED: "cts:table:invitation:accepted",
  TABLE_INVITATION_DECLINED: "cts:table:invitation:declined",
  TABLE_PLAYERS_TO_BOOT: "cts:table:players:boot",
  TABLE_BOOT_USER: "cts:table:boot-user",
  TABLE_TYPED_HERO_CODE: "cts:table:hero-code:typed",

  // Table seats
  SEAT_SIT: "cts:table-seat:sit",
  SEAT_STAND: "cts:table-seat:stand",
  SEAT_READY: "cts:table-seat:ready",

  // Game
  GAME_CONTROL_KEYS: "cts:game:control-keys",
  GAME_CONTROL_KEYS_UPDATE: "cts:game:control-keys:update",
  GAME_POWER_APPLY: "cts:game:power:apply",
  GAME_HOO_ADD_BLOCKS: "cts:game:hoo:add-blocks",
  GAME_CLIENT_BLOCKS_ANIMATION_DONE: "cts:game:client-blocks-animation-done",
  GAME_WATCH_USER_AT_TABLE: "cts:game:watch-user-at-table",
  PIECE_MOVE: "cts:piece:move",
  PIECE_CYCLE: "cts:piece:cycle",
  PIECE_DROP: "cts:piece:drop",
  PIECE_DROP_STOP: "cts:piece:drop-stop",
  PIECE_SPEED: "cts:piece:speed",
  POWER_USE: "cts:power:use",

  // Notification
  NOTIFICATIONS: "cts:notifications",
  NOTIFICATION_MARK_AS_READ: "cts:notification:read",
  NOTIFICATION_DELETE: "cts:notification:delete",

  // Socket
  SIGN_OUT: "cts:sign-out",
} as const;

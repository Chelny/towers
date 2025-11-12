export const RedisEvents = {
  // Room
  ROOM_JOIN: "redis:room:join",
  ROOM_LEAVE: "redis:room:leave",
  ROOM_MESSAGE_SEND: "redis:room:message:send",

  // Table
  TABLE_JOIN: "redis:table:join",
  TABLE_LEAVE: "redis:table:leave",
  TABLE_OPTIONS_UPDATE: "redis:table:options:update",
  TABLE_MESSAGE_SEND: "redis:table:message:send",
  TABLE_INVITE_USER: "redis:table:inviteUser",
  TABLE_INVITATION_ACCEPT: "redis:table:invitation:accept",
  TABLE_INVITATION_DECLINE: "redis:table:invitation:decline",
  TABLE_BOOT_USER: "redis:table:bootUser",
  TABLE_HOST_LEAVE: "redis:table:host:leave",
  TABLE_DELETE: "redis:table:delete",

  // Seats
  TABLE_SEAT_SIT: "redis:tableSeat:sit",
  TABLE_SEAT_STAND: "redis:tableSeat:stand",
  TABLE_PLAYER_STATE_UPDATE: "redis:tablePlayer:state:update",

  // Game
  GAME_CONTROL_KEYS_UPDATE: "redis:game:controlKeys:update",
  GAME_STATE: "redis:game:state",
  GAME_COUNTDOWN: "redis:game:countdown",
  GAME_TIMER: "redis:game:timer",
  GAME_UPDATE: "redis:game:update",
  GAME_OVER: "redis:game:over",
  GAME_POWER_FIRE: "redis:game:powerFire",
  GAME_HOO_SEND_BLOCKS: "redis:game:hooSendBlocks",
  GAME_BLOCKS_MARKED_FOR_REMOVAL: "redis:game:blocks:markedForRemoval",

  // Piece (game board)
  PIECE_SPEED: "redis:piece:speed",

  // Conversation
  CONVERSATION_MESSAGE_SEND: "redis:conversation:message:send",
  CONVERSATION_MESSAGE_READ: "redis:conversation:message:read",
};

export const SocketEvents = {
  // Sockets
  SOCKET_JOIN: "socket:join",
  SOCKET_LEAVE: "socket:leave",

  // Rooms
  ROOMS_LIST_UPDATED: "rooms:list:updated",

  // Room
  ROOM_JOIN: "room:join",
  ROOM_LEAVE: "room:leave",
  ROOM_PLAYER_JOINED: "room:player:joined",
  ROOM_PLAYER_LEFT: "room:player:left",
  ROOM_MESSAGE_SEND: "room:message:send",
  ROOM_MESSAGE_SENT: "room:message:sent",
  ROOM_PLAY_NOW: "room:playNow",

  // Table
  TABLE_JOIN: "table:join",
  TABLE_JOIN_SEATED: "table:joinSeated",
  TABLE_LEAVE: "table:leave",
  TABLE_PLAYER_JOINED: "table:player:joined",
  TABLE_PLAYER_LEFT: "table:player:left",
  TABLE_MESSAGE_SEND: "table:message:send",
  TABLE_MESSAGE_SENT: "table:message:sent",
  TABLE_OPTIONS_UPDATE: "table:options:update",
  TABLE_UPDATED: "table:updated",
  TABLE_PLAYERS_TO_INVITE: "table:players:invite",
  TABLE_PLAYER_INVITE: "table:player:invite",
  TABLE_PLAYERS_TO_BOOT: "table:players:boot",
  TABLE_PLAYER_BOOT: "table:player:boot",
  TABLE_INVITATION_INVITED_NOTIFICATION: "table:invitation:invited",
  TABLE_INVITATION_DECLINED_NOTIFICATION: "table:invitation:declined",
  TABLE_BOOTED_NOTIFICATION: "table:booted",
  TABLE_DELETED: "table:deleted",

  // Seats
  TABLE_SEAT_UPDATED: "tableSeat:updated",
  TABLE_PLAYER_STATE_UPDATE: "tablePlayer:state:update",
  TABLE_PLAYER_STATE_UPDATED: "tablePlayer:state:updated",

  // Game
  GAME_CONTROL_KEYS_UPDATED: "game:controlKeys:updated",
  GAME_STATE: "game:state",
  GAME_COUNTDOWN: "game:countdown",
  GAME_TIMER: "game:timer",
  GAME_UPDATE: "game:update",
  GAME_OVER: "game:over",
  GAME_POWER_FIRE: "game:powerFire",
  GAME_POWER_APPLY: "game:powerApply",
  GAME_HOO_SEND_BLOCKS: "game:hooSendBlocks",
  GAME_HOO_ADD_BLOCKS: "game:hooAddBlocks",
  GAME_BLOCKS_MARKED_FOR_REMOVAL: "game:blocks:markedForRemoval",
  GAME_CLIENT_BLOCKS_ANIMATION_DONE: "game:clientBlocks:animationDone",

  // Piece (game board)
  PIECE_MOVE: "piece:move",
  PIECE_CYCLE: "piece:cycle",
  PIECE_DROP: "piece:drop",
  PIECE_DROP_STOP: "piece:dropStop",
  PIECE_SPEED: "piece:speed",
  POWER_USE: "power:use",

  // Conversation
  CONVERSATION_MESSAGE_SENT: "conversation:message:sent",
  CONVERSATION_MESSAGE_MARK_AS_READ: "conversation:message:markAsRead",

  // User
  PING_REQUEST: "ping:request",
  PING_ECHO: "ping:echo",
  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",
  USER_CONNECTED: "user:connect",
  USER_DISCONNECTED: "user:disconnect",

  // Socket
  SIGN_OUT: "signOut",
  SIGN_OUT_SUCCESS: "signOut:success",
  SERVER_ERROR: "server:error",
};

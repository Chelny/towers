export const SocketEvents = {
  // === User ===
  USER_MUTE: "userMute",

  // === Rooms ===
  ROOMS_GET: "roomsGet",
  ROOMS_LIST: "roomsList",
  ROOMS_LIST_UPDATED: "roomsListUpdated",

  // === Room ===
  ROOM_JOIN: "roomJoin",
  ROOM_LEAVE: "roomLeave",
  ROOM_GET: "roomGet",
  ROOM_DATA: "roomData",
  ROOM_DATA_UPDATED: "roomDataUpdated",
  ROOM_MESSAGE_SEND: "roomMessageSend",
  ROOM_CHAT_UPDATED: "roomChatUpdated",
  ROOM_TABLE_ADDED: "roomTableAdded",

  // === Chat ===
  INSTANT_MESSAGE_SENT: "instantMessageSent",
  INSTANT_MESSAGE_RECEIVED: "instantMessageReceived",

  // === Table ===
  TABLE_PLAY_NOW: "tablePlayNow",
  TABLE_CREATE: "tableCreate",
  TABLE_JOIN: "tableJoin",
  TABLE_LEAVE: "tableLeave",
  TABLE_GET: "tableGet",
  TABLE_DATA: "tableData",
  TABLE_DATA_UPDATED: "tableDataUpdated",
  TABLE_UPDATE_SETTINGS: "tableUpdateSettings",
  TABLE_MESSAGE_SEND: "tableMessageSend",
  TABLE_CHAT_UPDATED: "tableChatUpdated",
  TABLE_INVITE_USER: "tableInviteUser",
  TABLE_INVITATION_NOTIFICATION: "tableInvitationNotification",
  TABLE_INVITATION_ACCEPTED: "tableInvitationAccepted",
  TABLE_INVITATION_DECLINED: "tableInvitationDeclined",
  TABLE_INVITATION_DECLINED_NOTIFICATION: "tableInvitationDeclinedNotification",
  TABLE_BOOT_USER: "tableBootUser",
  TABLE_BOOTED_USER_NOTIFICATION: "tableBootedUserNotification",
  TABLE_TYPED_HERO_CODE: "tableTypedHeroCode",

  // === Seats ===
  SEAT_SIT: "seatSit",
  SEAT_STAND: "seatStand",
  SEAT_READY: "seatReady",

  // === Game ===
  GAME_STATE: "gameState",
  GAME_COUNTDOWN: "gameCountdown",
  GAME_TIMER: "gameTimer",
  GAME_UPDATE: "gameUpdate",
  GAME_OVER: "gameOver",
  GAME_GET_CONTROL_KEYS: "gameGetControlKeys",
  GAME_CONTROL_KEYS: "gameControlKeys",
  GAME_SAVE_CONTROL_KEYS: "gameSaveControlKeys",
  GAME_POWER_FIRE: "gamePowerFire",
  GAME_POWER_APPLY: "gamePowerApply",
  GAME_HOO_SEND_BLOCKS: "gameHooSendBlocks",
  GAME_HOO_ADD_BLOCKS: "gameHooAddBlocks",
  GAME_BLOCKS_MARKED_FOR_REMOVAL: "gameMarkedForRemoval",
  GAME_CLIENT_BLOCKS_ANIMATION_DONE: "gameClientBlocksAnimationDone",

  // === Game Board ===
  PIECE_MOVE: "pieceMove",
  PIECE_CYCLE: "pieceCycle",
  PIECE_DROP: "pieceDrop",
  PIECE_DROP_STOP: "pieceDropStop",
  PIECE_SPEED: "pieceSpeed",
  POWER_USE: "powerUse",
}

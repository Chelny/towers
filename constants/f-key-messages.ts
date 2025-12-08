import { msg } from "@lingui/core/macro";

export const fKeyMessages = {
  F1: msg`Help!`,
  F2: msg`Thanks, partner.`,
  F3: msg`Yeah baby!`,
  F4: msg`I rule the world!`,
  F5: msg`Prepare to lose.`,
  F6: msg`I can destroy at will.`,
  F7: msg`That must have hurt.`,
  F8: msg`I brush off your attacks like dandruff.`,
  F9: msg`You can't touch me.`,
  F10: msg`Need help partner?`,
  F11: msg`I can't talk until the game is over.`,
  F12: msg`Work as a team, partner.`,
};

export type FKey = keyof typeof fKeyMessages;

"use client";

import { ReactNode } from "react";
import { Trans } from "@lingui/react/macro";
import AlertMessage from "@/components/ui/AlertMessage";
import { useSocket } from "@/context/SocketContext";

export default function ServerMessage(): ReactNode {
  const { isConnected, session } = useSocket();
  const username: string | null | undefined = session?.user.username;

  if (isConnected) {
    if (!session) {
      return (
        <AlertMessage type="error">
          <Trans>You are not logged in</Trans>
        </AlertMessage>
      );
    }

    if (session) {
      return (
        <AlertMessage type="info">
          <Trans>Connected to the game as {username}</Trans>
        </AlertMessage>
      );
    }
  } else {
    return (
      <AlertMessage type="error">
        <Trans>Disconnected from server</Trans>
      </AlertMessage>
    );
  }

  return null;
}
